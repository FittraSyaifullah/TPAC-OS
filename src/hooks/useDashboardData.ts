import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types";
import { showError } from "@/utils/toast";

export const useDashboardData = () => {
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTrips = (data: any[]): Trip[] => {
    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      startDate: new Date(event.date),
      endDate: new Date(event.end_date),
      location: event.location,
      gear_total: event.gear_total,
      gear_packed: event.gear_packed,
      participant_count: event.participant_count,
    }));
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        supabase.rpc('get_upcoming_trips_with_stats'),
        supabase.rpc('get_past_trips_with_stats'),
      ]);

      if (upcomingRes.error) throw upcomingRes.error;
      if (pastRes.error) throw pastRes.error;

      if (upcomingRes.data) {
        setUpcomingTrips(formatTrips(upcomingRes.data));
      }
      if (pastRes.data) {
        setPastTrips(formatTrips(pastRes.data));
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
    setUpcomingTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    setPastTrips((prev) => prev.filter((trip) => trip.id !== tripId));
  };

  return { upcomingTrips, pastTrips, loading, removeTrip };
};