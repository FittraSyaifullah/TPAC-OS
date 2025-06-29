export interface Trip {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
}

export interface ItineraryItem {
  id:string;
  day: number;
  location: string;
  activity: string;
}

export interface Participant {
  id: string;
  name: string;
}

export interface GearItem {
  id: string;
  name: string;
  status: "Pending" | "Packed";
  assignedTo: string; // Participant ID
}

export type ContactType = "Rescue" | "Local Authority" | "Embassy" | "Guide";

export interface EmergencyContact {
  id: string;
  name: string;
  contactNumber: string;
  type: ContactType;
}