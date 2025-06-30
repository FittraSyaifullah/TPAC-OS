import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { Plus, Calendar, Users, Package, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { SummaryWidget } from "@/components/SummaryWidget";
import { EmptyState } from "@/components/EmptyState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLoadingSkeleton } from "@/components/DashboardLoadingSkeleton";
import { GearStatusChart } from "@/components/GearStatusChart";

const Dashboard = () => {
  const { upcomingTrips, pastTrips, loading, removeTrip } = useDashboardData();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState("");

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
    return filteredTrips.reduce(
      (acc, trip) => {
        acc.totalParticipants += trip.participant_count || 0;
        acc.totalGearItems += trip.gear_total || 0;
        acc.totalGearPacked += trip.gear_packed || 0;
        return acc;
      },
      { totalParticipants: 0, totalGearItems: 0, totalGearPacked: 0 },
    );
  }, [filteredTrips]);

  const handleDeleteTrip = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      removeTrip(id);
      showSuccess("Trip deleted successfully!");
    } catch (error: any) {
      showError("Failed to delete trip.");
      console.error("Error deleting trip:", error);
    }
  };

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
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
            title="Trips"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">{filteredTrips.length}</div>
          </SummaryWidget>
          <SummaryWidget
            title="Participants"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">
              {stats.totalParticipants}
            </div>
          </SummaryWidget>
          <SummaryWidget
            title="Total Gear Items"
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
              icon={<Search className="h-8 w-8 text-muted-foreground" />}
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
              <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;