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
import { MapPin, Trash2, Users, Copy, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Progress } from "./ui/progress";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onShare: (id: string) => void;
}

export const TripCard = ({ trip, onDelete, onDuplicate, onShare }: TripCardProps) => {
  const formattedStartDate = format(new Date(trip.startDate), "MMM d, yyyy");
  const formattedEndDate = format(new Date(trip.endDate), "MMM d, yyyy");

  const gearPacked = trip.gear_packed ?? 0;
  const gearTotal = trip.gear_total ?? 0;
  const progress = gearTotal > 0 ? (gearPacked / gearTotal) * 100 : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{trip.title}</CardTitle>
        <CardDescription>
          {formattedStartDate} - {formattedEndDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          <span>{trip.location}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{trip.participant_count} Participants</span>
        </div>
        {gearTotal > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="text-muted-foreground">Packing Progress</span>
              <span>{gearPacked} / {gearTotal}</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <Button asChild className="flex-grow mr-2">
          <Link to={`/trip/${trip.id}`}>View Trip</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onShare(trip.id)}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDuplicate(trip.id)}>
            <Copy className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
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
        </div>
      </CardFooter>
    </Card>
  );
};