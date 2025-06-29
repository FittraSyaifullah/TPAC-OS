export interface Trip {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
}

export interface ItineraryItem {
  id: string;
  day: number;
  location: string;
  activity: string;
}