import { useState, useEffect } from "react";
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
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface ItineraryTabProps {
  itinerary: ItineraryItem[];
  onAddItem: () => void;
  onUpdateItem: (id: string, updates: Partial<ItineraryItem>) => void;
  onRemoveItem: (id: string) => void;
}

export const ItineraryTab = ({
  itinerary: initialItinerary,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ItineraryTabProps) => {
  const [itinerary, setItinerary] = useState(initialItinerary);

  useEffect(() => {
    setItinerary(initialItinerary);
  }, [initialItinerary]);

  const handleInputChange = (
    id: string,
    field: "location" | "activity",
    value: string,
  ) => {
    setItinerary((currentItinerary) =>
      currentItinerary.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleBlur = (
    id: string,
    field: "location" | "activity",
    value: string,
  ) => {
    const originalItem = initialItinerary.find((item) => item.id === id);
    if (originalItem && originalItem[field] !== value) {
      onUpdateItem(id, { [field]: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itinerary Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {itinerary.length > 0 ? (
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
                            handleInputChange(item.id, "location", e.target.value)
                          }
                          onBlur={(e) =>
                            handleBlur(item.id, "location", e.target.value)
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
                            handleInputChange(item.id, "activity", e.target.value)
                          }
                          onBlur={(e) =>
                            handleBlur(item.id, "activity", e.target.value)
                          }
                          placeholder="Describe the day's activities..."
                          rows={4}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
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
          ) : (
            <EmptyState
              icon={<CalendarDays className="h-8 w-8 text-muted-foreground" />}
              title="No itinerary yet"
              description="Add the first day to start planning your schedule."
            />
          )}
          <Button onClick={onAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};