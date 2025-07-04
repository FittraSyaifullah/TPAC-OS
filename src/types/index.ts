export interface Trip {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  gear_total?: number;
  gear_packed?: number;
  participant_count?: number;
  last_edited_by?: string;
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
  role?: string;
  trip_id?: string;
}

export interface Gear {
  id: string;
  name: string;
  type: string;
  quantity: number;
  available: number;
  condition: 'Good' | 'Needs Repair' | 'Dispose';
  photo_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  last_edited_by?: string;
}

export interface GearItem {
  id: string;
  status: "Pending" | "Packed";
  assigned_to: string | null;
  trip_id?: string;
  gear_id: string;
  gear: Gear;
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