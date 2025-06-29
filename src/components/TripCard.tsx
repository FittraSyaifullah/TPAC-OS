import { Trip } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { format } from "date-fns";

interface TripCardProps {
  trip: Trip;
}

export const TripCard = ({ trip }: TripCardProps) => {
  const formattedStartDate = format(trip.startDate, "MMM d, yyyy");
  const formattedEndDate = format(trip.endDate, "MMM d, yyyy");

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{trip.title}</CardTitle>
        <CardDescription>
          {formattedStartDate} - {formattedEndDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          <span>{trip.location}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Trip</Button>
      </CardFooter>
    </Card>
  );
};