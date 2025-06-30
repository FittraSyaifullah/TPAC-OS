import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trip } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, date, end_date, location")
          .eq("creator_id", user.id);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedTrips: Trip[] = data.map((event) => ({
            id: event.id,
            title: event.title,
            startDate: new Date(event.date),
            endDate: new Date(event.end_date),
            location: event.location,
          }));
          setTrips(formattedTrips);
        }
      } catch (error: any) {
        showError("Failed to fetch your trips.");
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Upcoming Trips</h1>
        <Button asChild>
          <Link to="/trip/new">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Link>
        </Button>
      </header>

      <main>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No trips yet!</h2>
            <p className="text-muted-foreground mt-2">
              Click "New Trip" to plan your first adventure.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;