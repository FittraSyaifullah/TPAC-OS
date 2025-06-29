import { useState } from "react";
import { EmergencyContact, ContactType } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Pencil,
  Shield,
  Building,
  Flag,
  User,
} from "lucide-react";

const initialContacts: EmergencyContact[] = [
  {
    id: "c1",
    name: "Mountain Rescue",
    contactNumber: "+977 1 4411933",
    type: "Rescue",
  },
  {
    id: "c2",
    name: "Local Police",
    contactNumber: "100",
    type: "Local Authority",
  },
  { id: "c3", name: "Lead Guide", contactNumber: "+977 9851012345", type: "Guide" },
];

const contactTypeIcons: Record<ContactType, React.ReactNode> = {
  Rescue: <Shield className="h-5 w-5 text-red-500" />,
  "Local Authority": <Building className="h-5 w-5 text-blue-500" />,
  Embassy: <Flag className="h-5 w-5 text-green-500" />,
  Guide: <User className="h-5 w-5 text-yellow-500" />,
};

const contactTypes: ContactType[] = ["Rescue", "Local Authority", "Embassy", "Guide"];

export const EmergencyTab = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const handleSave = (formData: Omit<EmergencyContact, "id">) => {
    if (editingContact) {
      // Update existing contact
      setContacts(
        contacts.map((c) =>
          c.id === editingContact.id ? { ...c, ...formData } : c,
        ),
      );
    } else {
      // Add new contact
      const newContact: EmergencyContact = {
        id: `c-${Date.now()}`,
        ...formData,
      };
      setContacts([newContact, ...contacts]);
    }
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emergency Contacts</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
            </DialogHeader>
            <ContactForm
              onSubmit={handleSave}
              initialData={editingContact}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {contactTypeIcons[contact.type]}
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {contact.contactNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(contact)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(contact.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Contact Form Sub-component
interface ContactFormProps {
  onSubmit: (data: Omit<EmergencyContact, "id">) => void;
  initialData?: EmergencyContact | null;
  onClose: () => void;
}

const ContactForm = ({ onSubmit, initialData, onClose }: ContactFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || "");
  const [type, setType] = useState<ContactType>(initialData?.type || "Guide");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactNumber) return;
    onSubmit({ name, contactNumber, type });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Mountain Rescue"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="e.g., +1 555-123-4567"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={(v: ContactType) => setType(v)} value={type}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {contactTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Save Contact</Button>
      </DialogFooter>
    </form>
  );
};