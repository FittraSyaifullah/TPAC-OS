import { useState } from "react";
import { GearItem, Participant } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const initialParticipants: Participant[] = [
  { id: "p1", name: "Alex" },
  { id: "p2", name: "Jordan" },
  { id: "p3", name: "Taylor" },
  { id: "unassigned", name: "Unassigned" },
];

const initialGear: GearItem[] = [
  { id: "g1", name: "Backpack (65L)", status: "Packed", assignedTo: "p1" },
  { id: "g2", name: "Tent", status: "Packed", assignedTo: "p2" },
  { id: "g3", name: "Sleeping Bag", status: "Pending", assignedTo: "p1" },
  { id: "g4", name: "Water Filter", status: "Pending", assignedTo: "p3" },
  { id: "g5", name: "First Aid Kit", status: "Packed", assignedTo: "unassigned" },
];

export const GearTab = () => {
  const [gearItems, setGearItems] = useState<GearItem[]>(initialGear);
  const [participants] = useState<Participant[]>(initialParticipants);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const isMobile = useIsMobile();

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem: GearItem = {
      id: `g-${Date.now()}`,
      name: newItemName.trim(),
      status: "Pending",
      assignedTo: "unassigned",
    };
    setGearItems([newItem, ...gearItems]);
    setNewItemName("");
    setIsAddDialogOpen(false);
  };

  const handleUpdate = (
    id: string,
    updates: Partial<Omit<GearItem, "id">>,
  ) => {
    setGearItems(
      gearItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  };

  const handleRemoveItem = (id: string) => {
    setGearItems(gearItems.filter((item) => item.id !== id));
  };

  const packedCount = gearItems.filter((item) => item.status === "Packed").length;
  const totalCount = gearItems.length;

  const gearListProps = {
    gearItems,
    participants,
    handleUpdate,
    handleRemoveItem,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <CardTitle>Gear Checklist</CardTitle>
            <CardDescription>
              {packedCount} of {totalCount} items packed
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Gear Item</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Headlamp"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <MobileGearList {...gearListProps} />
        ) : (
          <DesktopGearList {...gearListProps} />
        )}
      </CardContent>
    </Card>
  );
};

// Desktop View
const DesktopGearList = ({ gearItems, participants, handleUpdate, handleRemoveItem }: any) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40%]">Item</TableHead>
        <TableHead>Assigned To</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {gearItems.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            <Select
              value={item.assignedTo}
              onValueChange={(value) => handleUpdate(item.id, { assignedTo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign..." />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p: Participant) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <Switch
                id={`status-${item.id}`}
                checked={item.status === "Packed"}
                onCheckedChange={(checked) =>
                  handleUpdate(item.id, { status: checked ? "Packed" : "Pending" })
                }
              />
              <Label htmlFor={`status-${item.id}`}>{item.status}</Label>
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// Mobile View
const MobileGearList = ({ gearItems, participants, handleUpdate, handleRemoveItem }: any) => (
  <div className="space-y-4">
    {gearItems.map((item) => (
      <Card key={item.id}>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Assigned To</Label>
            <Select
              value={item.assignedTo}
              onValueChange={(value) => handleUpdate(item.id, { assignedTo: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assign..." />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p: Participant) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`mobile-status-${item.id}`}
                checked={item.status === "Packed"}
                onCheckedChange={(checked) =>
                  handleUpdate(item.id, { status: checked ? "Packed" : "Pending" })
                }
              />
              <Label htmlFor={`mobile-status-${item.id}`}>{item.status}</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => handleRemoveItem(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);