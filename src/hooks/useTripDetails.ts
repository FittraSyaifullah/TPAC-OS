import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trip, Participant, ItineraryItem, GearItem, EmergencyContact, TripDocument } from "@/types";
import { showError, showSuccess } from "@/utils/toast";

export const useTripDetails = (tripId: string | undefined) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [documents, setDocuments] = useState<TripDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tripRes, participantsRes, itineraryRes, gearRes, contactsRes, documentsRes] = await Promise.all([
        supabase.from("events").select("id, title, date, end_date, location").eq("id", tripId).single(),
        supabase.from("trip_participants").select("*").eq("trip_id", tripId).order("created_at"),
        supabase.from("itinerary_items").select("*").eq("trip_id", tripId).order("day"),
        supabase.from("trip_gear_items").select("*").eq("trip_id", tripId).order("created_at"),
        supabase.from("emergency_contacts").select("*").eq("trip_id", tripId).order("created_at"),
        supabase.from("trip_documents").select("*").eq("trip_id", tripId).order("created_at"),
      ]);

      if (tripRes.error) throw tripRes.error;
      if (participantsRes.error) throw participantsRes.error;
      if (itineraryRes.error) throw itineraryRes.error;
      if (gearRes.error) throw gearRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (documentsRes.error) throw documentsRes.error;

      setTrip({
        ...tripRes.data,
        startDate: new Date(tripRes.data.date),
        endDate: new Date(tripRes.data.end_date),
      } as Trip);
      setParticipants(participantsRes.data as Participant[]);
      setItinerary(itineraryRes.data as ItineraryItem[]);
      setGearItems(gearRes.data as GearItem[]);
      setEmergencyContacts(contactsRes.data as EmergencyContact[]);
      setDocuments(documentsRes.data as TripDocument[]);

    } catch (error: any) {
      showError("Failed to fetch trip details.");
      console.error("Error fetching data:", error);
      setTrip(null);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Participant Handlers
  const addParticipant = async (name: string) => {
    if (!tripId || !name.trim()) return;
    const { data, error } = await supabase.from("trip_participants").insert({ name: name.trim(), trip_id: tripId }).select().single();
    if (error) { showError("Failed to add participant."); return; }
    setParticipants(prev => [...prev, data as Participant]);
    showSuccess("Participant added.");
  };

  const removeParticipant = async (id: string) => {
    const { error } = await supabase.from("trip_participants").delete().eq("id", id);
    if (error) { showError("Failed to remove participant."); return; }
    setParticipants(prev => prev.filter(p => p.id !== id));
    showSuccess("Participant removed.");
  };

  // Itinerary Handlers
  const addItineraryItem = async () => {
    if (!tripId) return;
    const newDay = itinerary.length > 0 ? Math.max(...itinerary.map(i => i.day)) + 1 : 1;
    const { data, error } = await supabase.from("itinerary_items").insert({ day: newDay, location: "", activity: "", time: "", trip_id: tripId }).select().single();
    if (error) { showError("Failed to add day."); return; }
    setItinerary(prev => [...prev, data as ItineraryItem]);
    showSuccess("Day added.");
  };

  const updateItineraryItem = async (id: string, updates: Partial<ItineraryItem>) => {
    const { error } = await supabase.from("itinerary_items").update(updates).eq("id", id);
    if (error) { showError("Failed to update itinerary."); return; }
    setItinerary(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const removeItineraryItem = async (id: string) => {
    const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
    if (error) { showError("Failed to remove day."); return; }
    setItinerary(prev => prev.filter(i => i.id !== id));
    showSuccess("Day removed.");
  };

  // Gear Handlers
  const addGearItem = async (name: string) => {
    if (!tripId || !name.trim()) return;
    const { data, error } = await supabase.from("trip_gear_items").insert({ name: name.trim(), status: "Pending", trip_id: tripId }).select().single();
    if (error) { showError("Failed to add gear item."); return; }
    setGearItems(prev => [data as GearItem, ...prev]);
    showSuccess("Gear item added.");
  };

  const updateGearItem = async (id: string, updates: Partial<GearItem>) => {
    const { error } = await supabase.from("trip_gear_items").update(updates).eq("id", id);
    if (error) { showError("Failed to update gear item."); return; }
    setGearItems(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const removeGearItem = async (id: string) => {
    const { error } = await supabase.from("trip_gear_items").delete().eq("id", id);
    if (error) { showError("Failed to remove gear item."); return; }
    setGearItems(prev => prev.filter(g => g.id !== id));
    showSuccess("Gear item removed.");
  };

  // Emergency Contact Handlers
  const addEmergencyContact = async (contact: Omit<EmergencyContact, "id" | "trip_id">) => {
    if (!tripId) return;
    const { data, error } = await supabase.from("emergency_contacts").insert({ ...contact, trip_id: tripId }).select().single();
    if (error) { showError("Failed to add contact."); return; }
    setEmergencyContacts(prev => [...prev, data as EmergencyContact]);
    showSuccess("Contact added.");
  };

  const updateEmergencyContact = async (id: string, contact: Partial<EmergencyContact>) => {
    const { data, error } = await supabase.from("emergency_contacts").update(contact).eq("id", id).select().single();
    if (error) { showError("Failed to update contact."); return; }
    setEmergencyContacts(prev => prev.map(c => c.id === id ? data as EmergencyContact : c));
    showSuccess("Contact updated.");
  };

  const removeEmergencyContact = async (id: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (error) { showError("Failed to remove contact."); return; }
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    showSuccess("Contact removed.");
  };

  // Document Handlers
  const addDocument = async (file: File) => {
    if (!tripId || !file) return;
    const filePath = `${tripId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from('trip_documents').upload(filePath, file);
    if (uploadError) { showError("Failed to upload document."); console.error(uploadError); return; }

    const { data, error } = await supabase.from("trip_documents").insert({ name: file.name, trip_id: tripId, file_path: filePath }).select().single();
    if (error) { showError("Failed to save document record."); return; }

    setDocuments(prev => [...prev, data as TripDocument]);
    showSuccess("Document uploaded.");
  };

  const removeDocument = async (doc: TripDocument) => {
    const { error: storageError } = await supabase.storage.from('trip_documents').remove([doc.file_path]);
    if (storageError) { showError("Failed to delete document from storage."); return; }

    const { error } = await supabase.from("trip_documents").delete().eq("id", doc.id);
    if (error) { showError("Failed to remove document record."); return; }

    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    showSuccess("Document removed.");
  };

  return {
    trip,
    participants,
    itinerary,
    gearItems,
    emergencyContacts,
    documents,
    loading,
    addParticipant,
    removeParticipant,
    addItineraryItem,
    updateItineraryItem,
    removeItineraryItem,
    addGearItem,
    updateGearItem,
    removeGearItem,
    addEmergencyContact,
    updateEmergencyContact,
    removeEmergencyContact,
    addDocument,
    removeDocument,
  };
};