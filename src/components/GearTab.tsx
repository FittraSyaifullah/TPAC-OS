import { useEffect, useState } from "react";
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
import { Plus, Trash2, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "./ui/skeleton";
import { EmptyState } from "./EmptyState";

interface GearTabProps {
  tripId: string;
  participants: Participant[];
  onCountsChange: (counts: { packed: number; total: number }) => void;
}

export const GearTab = ({
  tripId,
  participants,
  onCountsChange,
}: GearTabProps) => {
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchGear = async () => {
      if (!tripId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("trip_gear_items")
          .select("id, name, status, assigned_to")
          .eq("trip_id", tripId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const items = data.map((item) => ({
          ...item,
          status: item.status === "Packed" ? "Packed" : "Pending",
        })) as GearItem[];
        setGearItems(items);
      } catch (error: any) {
        showError("Failed to fetch gear list.");
        console.error("Error fetching gear:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGear();
  }, [tripId]);

  useEffect(() => {
    const packedCount = gearItems.filter(
      (item) => item.status === "Packed",
    ).length;
    const totalCount = gearItems.length;
    onCountsChange({ packed: packedCount, total: totalCount });
  }, [gearItems, onCountsChange]);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    const newItem: Omit<GearItem, "id"> = {
      name: newItemName.trim(),
      status: "Pending",
      assigned_to: "unassigned",
      trip_id: tripId,
    };

    try {
      const { data, error } = await supabase
        .from("trip_gear_items")
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      setGearItems([data as GearItem, ...gearItems]);
      setNewItemName("");
      setIsAddDialogOpen(false);
      showSuccess("Item added.");
    } catch (error: any) {
      showError("Failed to add item.");
    }
  };

  const handleUpdate = async (
    id: string,
    updates: Partial<Omit<GearItem, "id">>,
  ) => {
    try {
      const { error } = await supabase
        .from("trip_gear_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setGearItems(
        gearItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item,
        ),
      );
    } catch (error: any) {
      showError("Failed to update item.");
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trip_gear_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGearItems(gearItems.filter((item) => item.id !== id));
      showSuccess("Item removed.");
    } catch (error: any) {
      showError("Failed to remove item.");
    }
  };

  const packedCount = gearItems.filter(
    (item) => item.status === "Packed",
  ).length;
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
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : gearItems.length > 0 ? (
          isMobile ? (
            <MobileGearList {...gearListProps} />
          ) : (
            <DesktopGearList {...gearListProps} />
          )
        ) : (
          <EmptyState
            icon={<Package className="h-8 w-8 text-muted-foreground" />}
            title="No gear added"
            description="Add your first item to the checklist."
          />
        )}
      </CardContent>
    </Card>
  );
};

const AssigneeSelect = ({ value, onValueChange, participants }: any) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger>
      <SelectValue placeholder="Assign..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="unassigned">Unassigned</SelectItem>
      {participants.map((p: Participant) => (
        <SelectItem key={p.id} value={p.name}>
          {p.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const DesktopGearList = ({
  gearItems,
  participants,
  handleUpdate,
  handleRemoveItem,
}: any) => (
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
      {gearItems.map((item: GearItem) => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            <AssigneeSelect
              value={item.assigned_to || "unassigned"}
              onValueChange={(value: string) =>
                handleUpdate(item.id, { assigned_to: value })
              }
              participants={participants}
            />
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <Switch
                id={`status-${item.id}`}
                checked={item.status === "Packed"}
                onCheckedChange={(checked) =>
                  handleUpdate(item.id, {
                    status: checked ? "Packed" : "Pending",
                  })
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

const MobileGearList = ({
  gearItems,
  participants,
  handleUpdate,
  handleRemoveItem,
}: any) => (
  <div className="space-y-4">
    {gearItems.map((item: GearItem) => (
      <Card key={item.id}>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Assigned To</Label>
            <div className="w-[180px]">
              <AssigneeSelect
                value={item.assigned_to || "unassigned"}
                onValueChange={(value: string) =>
                  handleUpdate(item.id, { assigned_to: value })
                }
                participants={participants}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`mobile-status-${item.id}`}
                checked={item.status === "Packed"}
                onCheckedChange={(checked) =>
                  handleUpdate(item.id, {
                    status: checked ? "Packed" : "Pending",
                  })
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