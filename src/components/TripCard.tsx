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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export const TripCard = ({ trip, onDelete }: TripCardProps) => {
  const formattedStartDate = format(new Date(trip.startDate), "MMM d, yyyy");
  const formattedEndDate = format(new Date(trip.endDate), "MMM d, yyyy");

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
      <CardFooter className="flex justify-between items-center">
        <Button asChild className="flex-grow">
          <Link to={`/trip/${trip.id}`}>View Trip</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="ml-2 flex-shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                trip and all of its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(trip.id)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};