import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trip, Participant } from "@/types";
import { showError, showSuccess } from "@/utils/toast";

export const useTripDetails = (tripId: string | undefined) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTripAndParticipants = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: tripData, error: tripError } = await supabase
        .from("events")
        .select("id, title, date, end_date, location")
        .eq("id", tripId)
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

      const { data: participantsData, error: participantsError } =
        await supabase
          .from("trip_participants")
          .select("id, name")
          .eq("trip_id", tripId)
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
  }, [tripId]);

  useEffect(() => {
    fetchTripAndParticipants();
  }, [fetchTripAndParticipants]);

  const addParticipant = async (name: string) => {
    if (!tripId || !name.trim()) return;

    const { data, error } = await supabase
      .from("trip_participants")
      .insert({ name: name.trim(), trip_id: tripId })
      .select()
      .single();

    if (error) {
      showError("Failed to add participant.");
      return;
    }

    setParticipants([...participants, data as Participant]);
    showSuccess("Participant added.");
  };

  const removeParticipant = async (participantId: string) => {
    const { error } = await supabase
      .from("trip_participants")
      .delete()
      .eq("id", participantId);

    if (error) {
      showError("Failed to remove participant.");
      return;
    }

    setParticipants(participants.filter((p) => p.id !== participantId));
    showSuccess("Participant removed.");
  };

  return { trip, participants, loading, addParticipant, removeParticipant };
};