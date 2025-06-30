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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

interface GearTabProps {
  gearItems: GearItem[];
  participants: Participant[];
  onAddItem: (name: string) => void;
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const isMobile = useIsMobile();

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAddItem(newItemName);
    setNewItemName("");
    setIsAddDialogOpen(false);
  };

  const packedCount = gearItems.filter(
    (item) => item.status === "Packed",
  ).length;
  const totalCount = gearItems.length;

  const gearListProps = {
    gearItems,
    participants,
    handleUpdate: onUpdateItem,
    handleRemoveItem: onRemoveItem,
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
        {gearItems.length > 0 ? (
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