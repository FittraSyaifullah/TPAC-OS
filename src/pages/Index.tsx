import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { Plus } from "lucide-react";
import { trips } from "@/data/trips";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Upcoming Trips</h1>
        <Button asChild>
          <Link to="/auth">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Link>
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