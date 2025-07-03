import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types";

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
  const [upcomingRes, pastRes] = await Promise.all([
    supabase.rpc('get_upcoming_trips_with_stats'),
    supabase.rpc('get_past_trips_with_stats'),
  ]);

  if (upcomingRes.error) throw upcomingRes.error;
  if (pastRes.error) throw pastRes.error;

  return {
    upcomingTrips: formatTrips(upcomingRes.data || []),
    pastTrips: formatTrips(pastRes.data || []),
  };
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });
};