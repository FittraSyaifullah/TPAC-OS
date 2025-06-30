import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ItineraryItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "./ui/skeleton";

interface ItineraryTabProps {
  tripId: string;
}

export const ItineraryTab = ({ tripId }: ItineraryTabProps) => {
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!tripId || !user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("itinerary_items")
          .select("*")
          .eq("trip_id", tripId)
          .order("day", { ascending: true });

        if (error) throw error;
        setItinerary(data as ItineraryItem[]);
      } catch (error: any) {
        showError("Failed to fetch itinerary.");
        console.error("Error fetching itinerary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [tripId, user]);

  const handleAddDay = async () => {
    if (!user) return;
    const newDayNumber =
      itinerary.length > 0
        ? Math.max(...itinerary.map((item) => item.day)) + 1
        : 1;
    const newItem: Omit<ItineraryItem, "id"> = {
      day: newDayNumber,
      location: "",
      activity: "",
      trip_id: tripId,
      creator_id: user.id,
    };

    try {
      const { data, error } = await supabase
        .from("itinerary_items")
        .insert(newItem)
        .select()
        .single();
      if (error) throw error;
      setItinerary([...itinerary, data as ItineraryItem]);
      showSuccess("New day added to itinerary.");
    } catch (error: any) {
      showError("Failed to add new day.");
    }
  };

  const handleRemoveDay = async (id: string) => {
    try {
      const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
      if (error) throw error;
      setItinerary(itinerary.filter((item) => item.id !== id));
      showSuccess("Day removed from itinerary.");
    } catch (error) {
      showError("Failed to remove day.");
    }
  };

  const handleUpdateDay = async (
    id: string,
    field: "location" | "activity",
    value: string,
  ) => {
    // Optimistic UI update
    const originalItinerary = [...itinerary];
    const updatedItinerary = itinerary.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setItinerary(updatedItinerary);

    try {
      const { error } = await supabase
        .from("itinerary_items")
        .update({ [field]: value })
        .eq("id", id);
      if (error) {
        // Revert on error
        setItinerary(originalItinerary);
        throw error;
      }
    } catch (error) {
      showError(`Failed to update ${field}.`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itinerary Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={itinerary.length > 0 ? [itinerary[0].id] : []}
          >
            {itinerary.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>
                  <span className="font-semibold text-left">
                    Day {item.day}: {item.location || "New Location"}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-2">
                    <div>
                      <label
                        htmlFor={`location-${item.id}`}
                        className="block text-sm font-medium mb-1"
                      >
                        Location
                      </label>
                      <Input
                        id={`location-${item.id}`}
                        value={item.location}
                        onChange={(e) =>
                          handleUpdateDay(item.id, "location", e.target.value)
                        }
                        placeholder="e.g., City, Landmark"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`activity-${item.id}`}
                        className="block text-sm font-medium mb-1"
                      >
                        Activity
                      </label>
                      <Textarea
                        id={`activity-${item.id}`}
                        value={item.activity}
                        onChange={(e) =>
                          handleUpdateDay(item.id, "activity", e.target.value)
                        }
                        placeholder="Describe the day's activities..."
                        rows={4}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveDay(item.id)}
                      className="mt-2"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Day {item.day}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button onClick={handleAddDay}>
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};