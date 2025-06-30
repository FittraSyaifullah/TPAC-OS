import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryWidget } from "@/components/SummaryWidget";
import { ItineraryTab } from "@/components/ItineraryTab";
import { GearTab } from "@/components/GearTab";
import { ParticipantsTab } from "@/components/ParticipantsTab";
import { EmergencyTab } from "@/components/EmergencyTab";
import { useEffect, useState } from "react";
import { Trip, Participant } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [gearCounts, setGearCounts] = useState({ packed: 0, total: 0 });

  useEffect(() => {
    const fetchTripAndParticipants = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch trip details
        const { data: tripData, error: tripError } = await supabase
          .from("events")
          .select("id, title, date, end_date, location")
          .eq("id", id)
          .single();

        if (tripError) throw tripError;

        if (tripData) {
          setTrip({
            id: tripData.id,
            title: tripData.title,
            startDate: new Date(tripData.date),
            endDate: new Date(tripData.end_date),
            location: tripData.location,
          });
        }

        // Fetch participants
        const { data: participantsData, error: participantsError } =
          await supabase
            .from("trip_participants")
            .select("id, name")
            .eq("trip_id", id)
            .order("created_at", { ascending: true });

        if (participantsError) throw participantsError;
        setParticipants(participantsData as Participant[]);
      } catch (error: any) {
        showError("Failed to fetch trip details.");
        console.error("Error fetching data:", error);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTripAndParticipants();
  }, [id]);

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/4 mb-4" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!trip) {
    return <Navigate to="/404" replace />;
  }

  const formattedStartDate = format(trip.startDate, "MMM d, yyyy");
  const formattedEndDate = format(trip.endDate, "MMM d, yyyy");

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold">{trip.title}</h1>
        <div className="text-lg text-muted-foreground mt-2">
          <p>
            {formattedStartDate} - {formattedEndDate}
          </p>
          <div className="flex items-center mt-1">
            <MapPin className="mr-2 h-5 w-5" />
            <span>{trip.location}</span>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2">
          <SummaryWidget
            title="Participants"
            value={participants.length}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <SummaryWidget
            title="Gear Packed"
            value={`${gearCounts.packed} / ${gearCounts.total}`}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
        </section>

        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="gear">Gear</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
          <TabsContent value="itinerary" className="mt-4">
            <ItineraryTab tripId={trip.id} />
          </TabsContent>
          <TabsContent value="gear" className="mt-4">
            <GearTab
              tripId={trip.id}
              participants={participants}
              onCountsChange={setGearCounts}
            />
          </TabsContent>
          <TabsContent value="participants" className="mt-4">
            <ParticipantsTab
              tripId={trip.id}
              initialParticipants={participants}
              onParticipantsChange={handleParticipantsChange}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="emergency" className="mt-4">
            <EmergencyTab tripId={trip.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TripDetails;