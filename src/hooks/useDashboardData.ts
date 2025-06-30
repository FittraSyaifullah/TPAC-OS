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
      const [tripsRes, participantsRes, gearRes] = await Promise.all([
        supabase.rpc('get_trips_with_gear_stats'),
        supabase
          .from("trip_participants")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("trip_gear_items")
          .select("id", { count: "exact", head: true }),
      ]);

      if (tripsRes.error) throw tripsRes.error;
      if (participantsRes.error) throw participantsRes.error;
      if (gearRes.error) throw gearRes.error;

      if (tripsRes.data) {
        const formattedTrips: Trip[] = tripsRes.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          startDate: new Date(event.date),
          endDate: new Date(event.end_date),
          location: event.location,
          gear_total: event.gear_total,
          gear_packed: event.gear_packed,
        }));
        setTrips(formattedTrips);
      }

      setStats({
        totalParticipants: participantsRes.count ?? 0,
        totalGearItems: gearRes.count ?? 0,
      });
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