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

interface ItineraryDayFormProps {
  item: ItineraryItem;
  onUpdateItem: (id: string, updates: Partial<ItineraryItem>) => void;
  onRemoveItem: (id: string) => void;
}

const ItineraryDayForm = ({ item, onUpdateItem, onRemoveItem }: ItineraryDayFormProps) => {
  const [location, setLocation] = useState(item.location);
  const [activity, setActivity] = useState(item.activity);
  const [time, setTime] = useState(item.time);

  useEffect(() => {
    setLocation(item.location);
    setActivity(item.activity);
    setTime(item.time);
  }, [item]);

  const handleBlur = (field: 'location' | 'activity' | 'time', value: string | null) => {
    if (value !== item[field]) {
      onUpdateItem(item.id, { [field]: value });
    }
  };

  return (
    <div className="space-y-4 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label
            htmlFor={`location-${item.id}`}
            className="block text-sm font-medium mb-1"
          >
            Location
          </label>
          <Input
            id={`location-${item.id}`}
            value={location || ''}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => handleBlur('location', location)}
            placeholder="e.g., City, Landmark"
          />
        </div>
        <div>
          <label
            htmlFor={`time-${item.id}`}
            className="block text-sm font-medium mb-1"
          >
            Time
          </label>
          <Input
            id={`time-${item.id}`}
            value={time || ''}
            onChange={(e) => setTime(e.target.value)}
            onBlur={() => handleBlur('time', time)}
            placeholder="e.g., 9:00 AM or Morning"
          />
        </div>
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
          value={activity || ''}
          onChange={(e) => setActivity(e.target.value)}
          onBlur={() => handleBlur('activity', activity)}
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
  );
};

export const ItineraryTab = ({
  itinerary,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ItineraryTabProps) => {
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
                      Day {item.day}: {item.time ? `${item.time} - ` : ''}{item.location || "New Location"}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ItineraryDayForm
                      item={item}
                      onUpdateItem={onUpdateItem}
                      onRemoveItem={onRemoveItem}
                    />
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