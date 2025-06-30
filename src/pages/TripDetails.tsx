import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, MapPin, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryWidget } from "@/components/SummaryWidget";
import { ItineraryTab } from "@/components/ItineraryTab";
import { GearTab } from "@/components/GearTab";
import { ParticipantsTab } from "@/components/ParticipantsTab";
import { EmergencyTab } from "@/components/EmergencyTab";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTripDetails } from "@/hooks/useTripDetails";

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { trip, participants, loading, setParticipants } = useTripDetails(id);
  const [gearCounts, setGearCounts] = useState({ packed: 0, total: 0 });

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/4 mb-4" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!trip) {
    return <Navigate to="/404" replace />;
  }

  const formattedStartDate = format(trip.startDate, "MMM d, yyyy");
  const formattedEndDate = format(trip.endDate, "MMM d, yyyy");

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/trip/${trip.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Trip
            </Link>
          </Button>
        </div>
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
            value={participants.length}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <SummaryWidget
            title="Gear Packed"
            value={`${gearCounts.packed} / ${gearCounts.total}`}
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
            <ItineraryTab tripId={trip.id} />
          </TabsContent>
          <TabsContent value="gear" className="mt-4">
            <GearTab
              tripId={trip.id}
              participants={participants}
              onCountsChange={setGearCounts}
            />
          </TabsContent>
          <TabsContent value="participants" className="mt-4">
            <ParticipantsTab
              tripId={trip.id}
              initialParticipants={participants}
              onParticipantsChange={setParticipants}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="emergency" className="mt-4">
            <EmergencyTab tripId={trip.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TripDetails;