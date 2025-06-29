import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { Trip } from "@/types";
import { Plus } from "lucide-react";

const trips: Trip[] = [
  {
    id: "1",
    title: "Himalayan Trek",
    startDate: new Date("2024-08-15"),
    endDate: new Date("2024-08-25"),
    location: "Everest Base Camp, Nepal",
  },
  {
    id: "2",
    title: "Amazon Rainforest Expedition",
    startDate: new Date("2024-09-10"),
    endDate: new Date("2024-09-20"),
    location: "Manaus, Brazil",
  },
  {
    id: "3",
    title: "Sahara Desert Safari",
    startDate: new Date("2024-10-05"),
    endDate: new Date("2024-10-12"),
    location: "Merzouga, Morocco",
  },
  {
    id: "4",
    title: "Galapagos Islands Cruise",
    startDate: new Date("2024-11-20"),
    endDate: new Date("2024-11-30"),
    location: "Baltra Island, Ecuador",
  },
  {
    id: "5",
    title: "Kyoto Cherry Blossom Tour",
    startDate: new Date("2025-03-25"),
    endDate: new Date("2025-04-05"),
    location: "Kyoto, Japan",
  },
  {
    id: "6",
    title: "New Zealand Adventure",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-01-29"),
    location: "Queenstown, New Zealand",
  },
];

const Index = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Upcoming Trips</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </header>

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;