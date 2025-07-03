import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { Plus, Calendar, Users, Package, Search, Copy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { SummaryWidget } from "@/components/SummaryWidget";
import { EmptyState } from "@/components/EmptyState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLoadingSkeleton } from "@/components/DashboardLoadingSkeleton";
import { GearStatusChart } from "@/components/GearStatusChart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from 'qrcode.react';

const Dashboard = () => {
  const { data, isLoading, refetch } = useDashboardData();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const upcomingTrips = data?.upcomingTrips || [];
  const pastTrips = data?.pastTrips || [];
  const trips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;

  const filteredTrips = useMemo(() => {
    if (!searchTerm) {
      return trips;
    }
    return trips.filter(
      (trip) =>
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [trips, searchTerm]);

  const stats = useMemo(() => {
    const allTrips = [...upcomingTrips, ...pastTrips];
    return allTrips.reduce(
      (acc, trip) => {
        acc.totalParticipants += trip.participant_count || 0;
        acc.totalGearItems += trip.gear_total || 0;
        acc.totalGearPacked += trip.gear_packed || 0;
        return acc;
      },
      { totalParticipants: 0, totalGearItems: 0, totalGearPacked: 0 },
    );
  }, [upcomingTrips, pastTrips]);

  const handleDeleteTrip = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      refetch();
      showSuccess("Trip deleted successfully!");
    } catch (error: any) {
      showError("Failed to delete trip.");
      console.error("Error deleting trip:", error);
    }
  };

  const handleDuplicateTrip = async (tripId: string) => {
    const toastId = showLoading("Duplicating trip...");
    try {
      const { data: originalTrip, error: tripError } = await supabase
        .from("events")
        .select("*")
        .eq("id", tripId)
        .single();
      if (tripError) throw tripError;

      const [participantsRes, itineraryRes, gearRes, contactsRes, documentsRes] = await Promise.all([
        supabase.from("trip_participants").select("*").eq("trip_id", tripId),
        supabase.from("itinerary_items").select("*").eq("trip_id", tripId),
        supabase.from("trip_gear_items").select("*").eq("trip_id", tripId),
        supabase.from("emergency_contacts").select("*").eq("trip_id", tripId),
        supabase.from("trip_documents").select("*").eq("trip_id", tripId),
      ]);

      const errors = [participantsRes.error, itineraryRes.error, gearRes.error, contactsRes.error, documentsRes.error].filter(Boolean);
      if (errors.length > 0) throw errors[0];

      const { data: newTrip, error: newTripError } = await supabase
        .from("events")
        .insert({
          title: `${originalTrip.title} (Copy)`,
          description: originalTrip.description,
          date: originalTrip.date,
          end_date: originalTrip.end_date,
          location: originalTrip.location,
          max_participants: originalTrip.max_participants,
        })
        .select()
        .single();
      if (newTripError) throw newTripError;

      const newTripId = newTrip.id;

      const participantsToInsert = participantsRes.data.map(({ id, trip_id, created_at, ...p }) => ({ ...p, trip_id: newTripId }));
      const itineraryToInsert = itineraryRes.data.map(({ id, trip_id, created_at, ...i }) => ({ ...i, trip_id: newTripId }));
      const gearToInsert = gearRes.data.map(({ id, trip_id, created_at, ...g }) => ({ ...g, trip_id: newTripId, status: 'Pending' }));
      const contactsToInsert = contactsRes.data.map(({ id, trip_id, created_at, ...c }) => ({ ...c, trip_id: newTripId }));
      
      if (documentsRes.data && documentsRes.data.length > 0) {
        const documentsToInsert = [];
        for (const doc of documentsRes.data) {
          const newFilePath = `${newTripId}/${Date.now()}-${doc.name}`;
          const { error: copyError } = await supabase.storage.from('trip_documents').copy(doc.file_path, newFilePath);
          if (copyError) {
            console.error(`Failed to copy document ${doc.name}:`, copyError);
            continue;
          }
          documentsToInsert.push({ name: doc.name, trip_id: newTripId, file_path: newFilePath });
        }
        if (documentsToInsert.length > 0) {
          const { error } = await supabase.from("trip_documents").insert(documentsToInsert);
          if (error) throw error;
        }
      }

      if (participantsToInsert.length > 0) {
        const { error } = await supabase.from("trip_participants").insert(participantsToInsert);
        if (error) throw error;
      }
      if (itineraryToInsert.length > 0) {
        const { error } = await supabase.from("itinerary_items").insert(itineraryToInsert);
        if (error) throw error;
      }
      if (gearToInsert.length > 0) {
        const { error } = await supabase.from("trip_gear_items").insert(gearToInsert);
        if (error) throw error;
      }
      if (contactsToInsert.length > 0) {
        const { error } = await supabase.from("emergency_contacts").insert(contactsToInsert);
        if (error) throw error;
      }

      dismissToast(toastId);
      refetch();
      showSuccess("Trip duplicated successfully!");
      navigate(`/trip/${newTripId}`);

    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Failed to duplicate trip.");
      console.error("Error duplicating trip:", error);
    }
  };

  const handleShareTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setIsShareDialogOpen(true);
  };

  const shareUrl = selectedTripId ? `${window.location.origin}/share/${selectedTripId}` : "";

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search trips..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link to="/trip/new">
                <Plus className="mr-2 h-4 w-4" />
                New Trip
              </Link>
            </Button>
          </div>
        </header>

        <main>
          <section className="mb-8 grid gap-4 md:grid-cols-3">
            <SummaryWidget
              title="Total Trips"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="text-2xl font-bold">{upcomingTrips.length + pastTrips.length}</div>
            </SummaryWidget>
            <SummaryWidget
              title="Total Participants"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="text-2xl font-bold">
                {stats.totalParticipants}
              </div>
            </SummaryWidget>
            <SummaryWidget
              title="Total Gear Items (in trips)"
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="text-2xl font-bold">{stats.totalGearItems}</div>
            </SummaryWidget>
          </section>

          <section className="mb-8">
            <GearStatusChart packed={stats.totalGearPacked} total={stats.totalGearItems} />
          </section>

          <Tabs defaultValue="upcoming" onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past')}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredTrips.length === 0 ? (
            searchTerm ? (
              <EmptyState
                icon={<Search />}
                title="No trips found"
                description="Try adjusting your search term."
              />
            ) : (
              <EmptyState
                icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
                title={activeTab === 'upcoming' ? "No upcoming trips" : "No past trips"}
                description={activeTab === 'upcoming' ? "Plan a new adventure to see it here." : "Completed trips will appear here."}
              />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} onDuplicate={handleDuplicateTrip} onShare={handleShareTrip} />
              ))}
            </div>
          )}
        </main>
      </div>
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Trip</DialogTitle>
            <DialogDescription>
              Anyone with a link or this QR code can view a read-only version of your trip plan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <QRCodeSVG value={shareUrl} size={256} level="H" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={shareUrl}
                readOnly
              />
            </div>
            <Button type="button" size="sm" className="px-3" onClick={() => {
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                  showSuccess("Link copied to clipboard!");
                }).catch(() => {
                  showError("Could not copy link automatically. Please copy it manually.");
                });
              } else {
                showError("Automatic copy is not available. Please copy the link manually.");
              }
            }}>
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;