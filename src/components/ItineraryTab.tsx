import { useState } from "react";
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

const initialItinerary: ItineraryItem[] = [
  {
    id: "item-1",
    day: 1,
    location: "Kathmandu, Nepal",
    activity:
      "Arrive at Tribhuvan International Airport, transfer to hotel. Team briefing and gear check. Welcome dinner with the group.",
  },
  {
    id: "item-2",
    day: 2,
    location: "Lukla to Phakding",
    activity:
      "Early morning scenic flight to Lukla (2,860m). Begin trek to Phakding (2,610m), a gentle 3-4 hour walk through villages and forests.",
  },
];

export const ItineraryTab = () => {
  const [itinerary, setItinerary] =
    useState<ItineraryItem[]>(initialItinerary);

  const handleAddDay = () => {
    const newDayNumber =
      itinerary.length > 0
        ? Math.max(...itinerary.map((item) => item.day)) + 1
        : 1;
    const newItem: ItineraryItem = {
      id: `item-${Date.now()}`,
      day: newDayNumber,
      location: "",
      activity: "",
    };
    setItinerary([...itinerary, newItem]);
  };

  const handleRemoveDay = (id: string) => {
    setItinerary(itinerary.filter((item) => item.id !== id));
  };

  const handleUpdateDay = (
    id: string,
    field: "location" | "activity",
    value: string,
  ) => {
    setItinerary(
      itinerary.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

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
            defaultValue={["item-1"]}
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