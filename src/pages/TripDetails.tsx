import { Link, useParams, Navigate } from "react-router-dom";
import { trips } from "@/data/trips";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryWidget } from "@/components/SummaryWidget";
import { ItineraryTab } from "@/components/ItineraryTab";
import { GearTab } from "@/components/GearTab";
import { ParticipantsTab } from "@/components/ParticipantsTab";
import { EmergencyTab } from "@/components/EmergencyTab";

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const trip = trips.find((t) => t.id === id);

  if (!trip) {
    return <Navigate to="/404" replace />;
  }

  const formattedStartDate = format(trip.startDate, "MMM d, yyyy");
  const formattedEndDate = format(trip.endDate, "MMM d, yyyy");

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold">{trip.title}</h1>
        <div className="text-lg text-muted-foreground mt-2">
          <p>
            {formattedStartDate} - {formattedEndDate}
          </p>
          <div className="flex items-center mt-1">
            <MapPin className="mr-2 h-5 w-5" />
            <span>{trip.location}</span>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2">
          <SummaryWidget
            title="Participants"
            value="12"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <SummaryWidget
            title="Gear Packed"
            value="34 / 45"
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
        </section>

        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="gear">Gear</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>
          <TabsContent value="itinerary" className="mt-4">
            <ItineraryTab />
          </TabsContent>
          <TabsContent value="gear" className="mt-4">
            <GearTab />
          </TabsContent>
          <TabsContent value="participants" className="mt-4">
            <ParticipantsTab />
          </TabsContent>
          <TabsContent value="emergency" className="mt-4">
            <EmergencyTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TripDetails;