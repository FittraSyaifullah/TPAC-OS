import { useState, useEffect, useMemo } from "react";
import { Gear, GearItem, Participant } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, ImageOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";

interface GearTabProps {
  gearItems: GearItem[];
  participants: Participant[];
  onAddItem: (gearId: string) => void;
  onUpdateItem: (id: string, updates: Partial<GearItem>) => void;
  onRemoveItem: (id: string) => void;
}

export const GearTab = ({
  gearItems,
  participants,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: GearTabProps) => {
  const isMobile = useIsMobile();
  const packedCount = gearItems.filter(
    (item) => item.status === "Packed",
  ).length;
  const totalCount = gearItems.length;

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
          <AddGearFromInventoryDialog onAddItems={onAddItem} existingGearIds={gearItems.map(i => i.gear_id)} />
        </div>
      </CardHeader>
      <CardContent>
        {gearItems.length > 0 ? (
          isMobile ? (
            <MobileGearList gearItems={gearItems} participants={participants} handleUpdate={onUpdateItem} handleRemoveItem={onRemoveItem} />
          ) : (
            <DesktopGearList gearItems={gearItems} participants={participants} handleUpdate={onUpdateItem} handleRemoveItem={onRemoveItem} />
          )
        ) : (
          <EmptyState
            icon={<Package className="h-8 w-8 text-muted-foreground" />}
            title="No gear added"
            description="Add items from your inventory to build your checklist."
          />
        )}
      </CardContent>
    </Card>
  );
};

const AddGearFromInventoryDialog = ({ onAddItems, existingGearIds }: { onAddItems: (gearId: string) => void; existingGearIds: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inventory, setInventory] = useState<Gear[]>([]);
  const [selectedGear, setSelectedGear] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchInventory = async () => {
        const { data } = await supabase.from("gear").select("*");
        setInventory(data || []);
      };
      fetchInventory();
    }
  }, [isOpen]);

  const availableInventory = useMemo(() => {
    return inventory.filter(item => !existingGearIds.includes(item.id));
  }, [inventory, existingGearIds]);

  const handleAdd = () => {
    selectedGear.forEach(id => onAddItems(id));
    setSelectedGear([]);
    setIsOpen(false);
  };

  const handleSelect = (gearId: string, checked: boolean) => {
    if (checked) {
      setSelectedGear(prev => [...prev, gearId]);
    } else {
      setSelectedGear(prev => prev.filter(id => id !== gearId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add from Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Gear from Inventory</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-4 p-4">
            {availableInventory.length > 0 ? availableInventory.map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`gear-${item.id}`}
                  onCheckedChange={(checked) => handleSelect(item.id, !!checked)}
                  checked={selectedGear.includes(item.id)}
                  disabled={item.available <= 0}
                />
                <Label htmlFor={`gear-${item.id}`} className={cn("flex items-center gap-3 cursor-pointer", item.available <= 0 && "opacity-50 cursor-not-allowed")}>
                  <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0">
                    {item.photo_url ? <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover rounded-md" /> : <ImageOff className="w-6 h-6 text-muted-foreground m-auto" />}
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type} - {item.available} of {item.quantity} available</p>
                  </div>
                </Label>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-8">No available gear in your inventory.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAdd} disabled={selectedGear.length === 0}>Add Selected</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AssigneeSelect = ({ value, onValueChange, participants }: { value: string; onValueChange: (value: string) => void; participants: Participant[] }) => (
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

const StatusBadge = ({ status }: { status: "Packed" | "Pending" }) => (
  <Badge
    variant="outline"
    className={cn(
      "pointer-events-none",
      status === "Packed"
        ? "border-green-600 bg-green-50 text-green-700"
        : "border-gray-300 bg-gray-50 text-gray-600",
    )}
  >
    {status}
  </Badge>
);

const DesktopGearList = ({ gearItems, participants, handleUpdate, handleRemoveItem }: { gearItems: GearItem[], participants: Participant[], handleUpdate: (id: string, updates: Partial<GearItem>) => void, handleRemoveItem: (id: string) => void }) => (
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
          <TableCell className="font-medium">{item.gear.name}</TableCell>
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
              <StatusBadge status={item.status} />
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

const MobileGearList = ({ gearItems, participants, handleUpdate, handleRemoveItem }: { gearItems: GearItem[], participants: Participant[], handleUpdate: (id: string, updates: Partial<GearItem>) => void, handleRemoveItem: (id: string) => void }) => (
  <div className="space-y-4">
    {gearItems.map((item: GearItem) => (
      <Card key={item.id}>
        <CardHeader>
          <CardTitle>{item.gear.name}</CardTitle>
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
              <StatusBadge status={item.status} />
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