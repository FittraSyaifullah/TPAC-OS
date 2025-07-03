import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Trip, Participant, ItineraryItem, GearItem, EmergencyContact, TripDocument } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MountainSnow, Users, Package, MapPin, CalendarDays, ShieldAlert, FileText, Download } from 'lucide-react';
import { MapPreview } from '@/components/MapPreview';
import { Button } from '@/components/ui/button';
import { showSuccess, showError } from '@/utils/toast';

const MAPBOX_API_KEY = "pk.eyJ1IjoiZml0dHJhLXN5YWlmdWxsYWgiLCJhIjoiY204c2x2ZWRsMDFnZTJrbjF1MXpxeng4OSJ9.RYNyNDntRWMhdri3jz5W_g";

const ShareTrip = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [documents, setDocuments] = useState<TripDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validGearItems = useMemo(() => gearItems.filter(item => item.gear), [gearItems]);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!id) {
        setError("No trip ID provided.");
        setLoading(false);
        return;
      }

      try {
        const { data: tripData, error: tripError } = await supabase
          .from('events')
          .select('id, title, date, end_date, location')
          .eq('id', id)
          .single();

        if (tripError || !tripData) {
          throw new Error("Trip not found.");
        }
        
        setTrip({
          ...tripData,
          startDate: new Date(tripData.date),
          endDate: new Date(tripData.end_date),
        } as Trip);

        const [participantsRes, itineraryRes, gearRes, contactsRes, documentsRes] = await Promise.all([
          supabase.from("trip_participants").select("*").eq("trip_id", id).order("created_at"),
          supabase.from("itinerary_items").select("*").eq("trip_id", id).order("day"),
          supabase.from("trip_gear_items").select("*, gear(*)").eq("trip_id", id),
          supabase.from("emergency_contacts").select("*").eq("trip_id", id).order("created_at"),
          supabase.from("trip_documents").select("*").eq("trip_id", id).order("created_at"),
        ]);

        setParticipants(participantsRes.data || []);
        setItinerary(itineraryRes.data || []);
        setGearItems(gearRes.data || []);
        setEmergencyContacts(contactsRes.data || []);
        setDocuments(documentsRes.data || []);

      } catch (err: any) {
        setError(err.message || "Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id]);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from('trip_documents').download(filePath);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess("Download started.");
    } catch (error: any) {
      showError(error.message || "Failed to download file.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground mt-2">{error || "Could not find the requested trip."}</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      <header className="bg-background border-b">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MountainSnow className="h-6 w-6" />
            <span className="font-bold">Trailstack</span>
          </div>
          <Button asChild>
            <Link to="/login">Create Your Own Trip</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl md:text-4xl font-bold">{trip.title}</h1>
        <div className="text-lg text-muted-foreground mt-2">
          <p>{format(trip.startDate, "MMM d, yyyy")} - {format(trip.endDate, "MMM d, yyyy")}</p>
          <div className="flex items-center mt-1">
            <MapPin className="mr-2 h-5 w-5" />
            <span>{trip.location}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Itinerary */}
            <Card>
              <CardHeader><CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5" /> Itinerary</CardTitle></CardHeader>
              <CardContent>
                {itinerary.length > 0 ? itinerary.map(item => (
                  <div key={item.id} className="mb-4 last:mb-0">
                    <h3 className="font-semibold">Day {item.day}: {item.location} {item.time && `(${item.time})`}</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{item.activity}</p>
                  </div>
                )) : <p className="text-muted-foreground">No itinerary planned yet.</p>}
              </CardContent>
            </Card>
            {/* Gear */}
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5" /> Gear List</CardTitle></CardHeader>
              <CardContent>
                {validGearItems.length > 0 ? (
                  <ul className="list-disc list-inside columns-2">
                    {validGearItems.map(item => <li key={item.id}>{item.gear.name} {item.assigned_to && item.assigned_to !== 'unassigned' ? `(${item.assigned_to})` : ''}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">No gear listed yet.</p>}
              </CardContent>
            </Card>
             {/* Documents */}
            <Card>
              <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" /> Documents</CardTitle></CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <span className="font-medium truncate" title={doc.name}>{doc.name}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.file_path, doc.name)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted-foreground">No documents shared for this trip.</p>}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-8">
            {/* Map */}
            <Card className="overflow-hidden">
              <CardHeader><CardTitle>Map</CardTitle></CardHeader>
              <CardContent className="p-0 h-64">
                <MapPreview location={trip.location} apiKey={MAPBOX_API_KEY} />
              </CardContent>
            </Card>
            {/* Participants */}
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Participants</CardTitle></CardHeader>
              <CardContent>
                {participants.length > 0 ? (
                  <ul className="space-y-2">
                    {participants.map(p => <li key={p.id} className="font-medium">{p.name} {p.role && <span className="text-sm text-muted-foreground">({p.role})</span>}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">No participants listed.</p>}
              </CardContent>
            </Card>
            {/* Emergency Contacts */}
            <Card>
              <CardHeader><CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-5 w-5" /> Emergency Contacts</CardTitle></CardHeader>
              <CardContent>
                {emergencyContacts.length > 0 ? (
                  <ul className="space-y-2">
                    {emergencyContacts.map(c => <li key={c.id}><span className="font-medium">{c.name} ({c.type}):</span> {c.contact_number}</li>)}
                  </ul>
                ) : <p className="text-muted-foreground">No emergency contacts listed.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShareTrip;