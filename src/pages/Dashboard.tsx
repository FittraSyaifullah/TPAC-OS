import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { Plus, Calendar, Users, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryWidget } from "@/components/SummaryWidget";
import { EmptyState } from "@/components/EmptyState";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const { trips, stats, loading, removeTrip } = useDashboardData();

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

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/trip/new">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Link>
        </Button>
      </header>

      <main>
        {loading ? (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </>
        ) : (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-3">
              <SummaryWidget
                title="Total Trips"
                value={trips.length}
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              />
              <SummaryWidget
                title="Total Participants"
                value={stats.totalParticipants}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <SummaryWidget
                title="Total Gear Items"
                value={stats.totalGearItems}
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
              />
            </section>

            <h2 className="text-2xl font-bold mb-4">Upcoming Trips</h2>
            {trips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onDelete={handleDeleteTrip}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
                title="No upcoming trips"
                description="Plan a new adventure to see it here."
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;