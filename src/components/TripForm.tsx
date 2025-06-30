import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types";
import { showError, showSuccess } from "@/utils/toast";
import { MapPreview } from "./MapPreview";
import { useDebounce } from "@/hooks/useDebounce";

interface TripFormProps {
  trip?: Trip;
  apiKey: string;
}

export const TripForm = ({ trip, apiKey }: TripFormProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(trip?.title || "");
  const [location, setLocation] = useState(trip?.location || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    trip?.startDate ? new Date(trip.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    trip?.endDate ? new Date(trip.endDate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedLocation = useDebounce(location, 500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !startDate || !endDate) {
      showError("Please fill out all fields.");
      return;
    }
    if (startDate > endDate) {
      showError("End date must be after start date.");
      return;
    }

    setIsSubmitting(true);

    const tripData = {
      title,
      location,
      date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    let result;
    if (trip) {
      result = await supabase
        .from("events")
        .update(tripData)
        .eq("id", trip.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("events")
        .insert(tripData)
        .select()
        .single();
    }

    setIsSubmitting(false);

    if (result.error) {
      showError(`Failed to ${trip ? "update" : "create"} trip.`);
      console.error(result.error);
    } else {
      showSuccess(`Trip ${trip ? "updated" : "created"} successfully!`);
      navigate(`/trip/${result.data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{trip ? "Edit Trip" : "Create a New Trip"}</CardTitle>
          <CardDescription>
            Fill in the details below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Trip Title</Label>
            <Input
              id="title"
              placeholder="e.g., Yosemite National Park Expedition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., California, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          {debouncedLocation && (
            <div className="mt-4">
              <Label>Map Preview</Label>
              <div className="h-48 mt-2">
                <MapPreview location={debouncedLocation} apiKey={apiKey} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="Select a start date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="Select an end date"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? trip
                ? "Saving..."
                : "Creating..."
              : trip
              ? "Save Changes"
              : "Create Trip"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};