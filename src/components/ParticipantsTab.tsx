import { useState, useEffect } from "react";
import { Participant } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "./ui/skeleton";
import { EmptyState } from "./EmptyState";

interface ParticipantsTabProps {
  tripId: string;
  initialParticipants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
  loading: boolean;
}

export const ParticipantsTab = ({
  tripId,
  initialParticipants,
  onParticipantsChange,
  loading,
}: ParticipantsTabProps) => {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");

  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) return;
    const newParticipantData: Omit<Participant, "id"> = {
      name: newParticipantName.trim(),
      trip_id: tripId,
    };

    try {
      const { data, error } = await supabase
        .from("trip_participants")
        .insert(newParticipantData)
        .select()
        .single();

      if (error) throw error;

      const newParticipants = [...participants, data as Participant];
      setParticipants(newParticipants);
      onParticipantsChange(newParticipants);
      setNewParticipantName("");
      setIsAddDialogOpen(false);
      showSuccess("Participant added.");
    } catch (error: any) {
      showError("Failed to add participant.");
      console.error("Error adding participant:", error);
    }
  };

  const handleRemoveParticipant = async (id: string) => {
    try {
      const { error } = await supabase.from("trip_participants").delete().eq("id", id);
      if (error) throw error;

      const newParticipants = participants.filter((p) => p.id !== id);
      setParticipants(newParticipants);
      onParticipantsChange(newParticipants);
      showSuccess("Participant removed.");
    } catch (error: any) {
      showError("Failed to remove participant.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Participants</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Participant</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Alex Smith"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddParticipant}>Add Participant</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : participants.length > 0 ? (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <p className="font-semibold">{participant.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveParticipant(participant.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-8 w-8 text-muted-foreground" />}
            title="No participants yet"
            description="Add the first participant to your trip."
          />
        )}
      </CardContent>
    </Card>
  );
};