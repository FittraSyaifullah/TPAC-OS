import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types";
import { showError } from "@/utils/toast";

export const useDashboardData = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalGearItems: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_upcoming_trips_with_stats');

      if (error) throw error;

      if (data) {
        const formattedTrips: Trip[] = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          startDate: new Date(event.date),
          endDate: new Date(event.end_date),
          location: event.location,
          gear_total: event.gear_total,
          gear_packed: event.gear_packed,
          participant_count: event.participant_count,
        }));
        setTrips(formattedTrips);

        const totalParticipants = formattedTrips.reduce((sum, trip) => sum + (trip.participant_count || 0), 0);
        const totalGearItems = formattedTrips.reduce((sum, trip) => sum + (trip.gear_total || 0), 0);

        setStats({
          totalParticipants,
          totalGearItems,
        });
      }
    } catch (error: any) {
      showError("Failed to fetch dashboard data.");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const removeTrip = (tripId: string) => {
    setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
  };

  return { trips, stats, loading, removeTrip };
};