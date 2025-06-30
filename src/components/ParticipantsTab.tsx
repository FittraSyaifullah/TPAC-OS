import { useState } from "react";
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
import { Plus, Trash2, User, Users, Pencil } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface ParticipantsTabProps {
  participants: Participant[];
  onAddParticipant: (name: string) => Promise<void>;
  onUpdateParticipant: (id: string, name: string) => Promise<void>;
  onRemoveParticipant: (id: string) => Promise<void>;
}

export const ParticipantsTab = ({
  participants,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
}: ParticipantsTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [updatedParticipantName, setUpdatedParticipantName] = useState("");

  const handleAddParticipant = async () => {
    await onAddParticipant(newParticipantName);
    setNewParticipantName("");
    setIsAddDialogOpen(false);
  };

  const handleOpenEditDialog = (participant: Participant) => {
    setEditingParticipant(participant);
    setUpdatedParticipantName(participant.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateParticipant = async () => {
    if (editingParticipant && updatedParticipantName.trim()) {
      await onUpdateParticipant(editingParticipant.id, updatedParticipantName.trim());
      setIsEditDialogOpen(false);
      setEditingParticipant(null);
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
        {participants.length > 0 ? (
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
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEditDialog(participant)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Participant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={updatedParticipantName}
                onChange={(e) => setUpdatedParticipantName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateParticipant}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};