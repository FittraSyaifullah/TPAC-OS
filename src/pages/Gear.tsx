import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Gear } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, ImageOff, Search } from "lucide-react";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";

const GearPage = () => {
  const { userRole } = useAuth();
  const [gear, setGear] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGear, setEditingGear] = useState<Gear | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState<"all" | Gear['condition']>("all");

  const canManageGear = useMemo(() => {
    if (!userRole) return false;
    const allowedRoles = [
      'Developer',
      'Quartermaster',
      'Assistant Quartermaster'
    ];
    return allowedRoles.includes(userRole);
  }, [userRole]);

  useEffect(() => {
    fetchGear();
  }, []);

  const fetchGear = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("gear").select("*").order("created_at", { ascending: false });
    if (error) {
      showError("Failed to fetch gear.");
    } else {
      setGear(data as Gear[]);
    }
    setLoading(false);
  };

  const handleDelete = async (item: Gear) => {
    const toastId = showLoading("Deleting gear...");
    if (item.photo_url) {
      const { error: storageError } = await supabase.storage.from("gear_photos").remove([item.photo_url]);
      if (storageError) {
        dismissToast(toastId);
        showError("Failed to delete gear photo.");
        return;
      }
    }
    const { error } = await supabase.from("gear").delete().eq("id", item.id);
    if (error) {
      dismissToast(toastId);
      showError("Failed to delete gear.");
    } else {
      dismissToast(toastId);
      showSuccess("Gear deleted.");
      setGear(gear.filter((g) => g.id !== item.id));
    }
  };

  const handleSave = (savedGear: Gear) => {
    if (editingGear) {
      setGear(gear.map((g) => (g.id === savedGear.id ? savedGear : g)));
    } else {
      setGear([savedGear, ...gear]);
    }
  };

  const gearTypes = useMemo(() => ['all', ...Array.from(new Set(gear.map(g => g.type)))], [gear]);
  const gearConditions: Array<"all" | Gear['condition']> = ['all', 'Good', 'Needs Repair', 'Dispose'];

  const filteredGear = useMemo(() => {
    return gear.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" ||
        item.name.toLowerCase().includes(searchLower) ||
        (item.notes && item.notes.toLowerCase().includes(searchLower)) ||
        item.type.toLowerCase().includes(searchLower);
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;

      return matchesSearch && matchesType && matchesCondition;
    });
  }, [gear, searchTerm, typeFilter, conditionFilter]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Gear Inventory</h1>
        {canManageGear && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingGear(null)}>
                <Plus className="mr-2 h-4 w-4" /> Add Gear
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGear ? "Edit Gear" : "Add New Gear"}</DialogTitle>
              </DialogHeader>
              <GearForm
                gearItem={editingGear}
                onSave={(savedGear) => {
                  handleSave(savedGear);
                  setIsDialogOpen(false);
                }}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search gear by name, type, or notes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {gearTypes.map(type => (
              <SelectItem key={type} value={type}>{type === 'all' ? 'All Types' : type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={(value) => setConditionFilter(value as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by condition" />
          </SelectTrigger>
          <SelectContent>
            {gearConditions.map(condition => (
              <SelectItem key={condition} value={condition}>{condition === 'all' ? 'All Conditions' : condition}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredGear.length === 0 ? (
        <EmptyState 
          icon={<Search />} 
          title={searchTerm || typeFilter !== 'all' || conditionFilter !== 'all' ? "No Matching Gear Found" : "No Gear in Inventory"} 
          description={searchTerm || typeFilter !== 'all' || conditionFilter !== 'all' ? "Try adjusting your search or filters." : "Add your first piece of gear to get started."}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGear.map((item) => (
            <Card key={item.id}>
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.type}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm">Available: {item.available} / {item.quantity}</p>
                  <Badge variant={item.condition === 'Good' ? 'default' : item.condition === 'Needs Repair' ? 'secondary' : 'destructive'}>
                    {item.condition}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Last edited by: {item.last_edited_by || 'N/A'}</p>
                {canManageGear && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingGear(item); setIsDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const GearForm = ({ gearItem, onSave, onClose }: { gearItem: Gear | null; onSave: (gear: Gear) => void; onClose: () => void }) => {
  const { userRole } = useAuth();
  const [name, setName] = useState(gearItem?.name || "");
  const [type, setType] = useState(gearItem?.type || "");
  const [quantity, setQuantity] = useState(gearItem?.quantity || 1);
  const [available, setAvailable] = useState(gearItem?.available ?? gearItem?.quantity ?? 1);
  const [condition, setCondition] = useState<Gear['condition']>(gearItem?.condition || 'Good');
  const [notes, setNotes] = useState(gearItem?.notes || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!gearItem) {
      setAvailable(quantity);
    }
  }, [quantity, gearItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = showLoading("Saving gear...");

    let photo_url = gearItem?.photo_url || null;
    if (photoFile) {
      const filePath = `public/${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("gear_photos").upload(filePath, photoFile);
      if (uploadError) {
        dismissToast(toastId);
        showError("Failed to upload photo.");
        setIsSubmitting(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("gear_photos").getPublicUrl(filePath);
      photo_url = publicUrl;
    }

    const gearData = {
      name,
      type,
      quantity,
      available,
      condition,
      notes,
      photo_url,
      last_edited_by: userRole,
      updated_at: new Date().toISOString(),
    };

    if (gearItem) {
      const { data, error } = await supabase.from("gear").update(gearData).eq("id", gearItem.id).select().single();
      if (error) {
        dismissToast(toastId);
        showError("Failed to update gear.");
      } else {
        dismissToast(toastId);
        showSuccess("Gear updated.");
        onSave(data as Gear);
      }
    } else {
      const { data, error } = await supabase.from("gear").insert(gearData).select().single();
      if (error) {
        dismissToast(toastId);
        showError("Failed to add gear.");
      } else {
        dismissToast(toastId);
        showSuccess("Gear added.");
        onSave(data as Gear);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Tent, Sleeping Bag" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Total Quantity</Label>
          <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} min="1" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="available">Available</Label>
          <Input id="available" type="number" value={available} onChange={(e) => setAvailable(parseInt(e.target.value, 10))} min="0" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="condition">Condition</Label>
        <Select onValueChange={(value: Gear['condition']) => setCondition(value)} value={condition}>
          <SelectTrigger id="condition">
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Needs Repair">Needs Repair</SelectItem>
            <SelectItem value="Dispose">Dispose</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="photo">Photo</Label>
        <Input id="photo" type="file" onChange={(e) => e.target.files && setPhotoFile(e.target.files[0])} accept="image/*" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
      </DialogFooter>
    </form>
  );
};

export default GearPage;