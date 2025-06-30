export interface Trip {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  gear_total?: number;
  gear_packed?: number;
  participant_count?: number;
}

export interface ItineraryItem {
  id: string;
  day: number;
  location: string;
  activity: string;
  time: string;
  trip_id?: string;
}

export interface Participant {
  id: string;
  name: string;
  trip_id?: string;
}

export interface GearItem {
  id: string;
  name: string;
  status: "Pending" | "Packed";
  assigned_to: string | null;
  trip_id?: string;
}

export type ContactType = "Rescue" | "Local Authority" | "Embassy" | "Guide";

export interface EmergencyContact {
  id: string;
  name: string;
  contact_number: string;
  type: ContactType;
  trip_id?: string;
}

export interface TripDocument {
  id: string;
  name: string;
  file_path: string;
  created_at: string;
  trip_id?: string;
}