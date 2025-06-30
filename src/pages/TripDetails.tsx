import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Package, MapPin, Pencil, Download } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryWidget } from "@/components/SummaryWidget";
import { ItineraryTab } from "@/components/ItineraryTab";
import { GearTab } from "@/components/GearTab";
import { ParticipantsTab } from "@/components/ParticipantsTab";
import { EmergencyTab } from "@/components/EmergencyTab";
import { Skeleton } from "@/components/ui/skeleton";
import { useTripDetails } from "@/hooks/useTripDetails";
import { Progress } from "@/components/ui/progress";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PrintableTripReport from "@/components/PrintableTripReport";
import { DocumentsTab } from "@/components/DocumentsTab";
import { MapPreview } from "@/components/MapPreview";

const MAPBOX_API_KEY = "pk.eyJ1IjoiZml0dHJhLXN5YWlmdWxsYWgiLCJhIjoiY204c2x2ZWRsMDFnZTJrbjF1MXpxeng4OSJ9.RYNyNDntRWMhdri3jz5W_g";

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    trip,
    participants,
    itinerary,
    gearItems,
    emergencyContacts,
    documents,
    loading,
    addParticipant,
    removeParticipant,
    addItineraryItem,
    updateItineraryItem,
    removeItineraryItem,
    addGearItem,
    updateGearItem,
    removeGearItem,
    addEmergencyContact,
    updateEmergencyContact,
    removeEmergencyContact,
    addDocument,
    removeDocument,
  } = useTripDetails(id);

  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!printRef.current || !trip) return;
    setIsExporting(true);

    const canvas = await html2canvas(printRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    
    pdf.save(`${trip.title.replace(/ /g, '_')}-report.pdf`);
    setIsExporting(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-1/4 mb-4" />
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

  if (!trip) {
    return <Navigate to="/404" replace />;
  }

  const formattedStartDate = format(trip.startDate, "MMM d, yyyy");
  const formattedEndDate = format(trip.endDate, "MMM d, yyyy");
  const gearPackedCount = gearItems.filter(
    (item) => item.status === "Packed",
  ).length;
  const gearProgress =
    gearItems.length > 0 ? (gearPackedCount / gearItems.length) * 100 : 0;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to={`/trip/${trip.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Trip
              </Link>
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{trip.title}</h1>
        <div className="text-lg text-muted-foreground mt-2">
          <p>
            {formattedStartDate} - {formattedEndDate}
          </p>
          <div className="flex items-center mt-1">
            <MapPin className="mr-2 h-5 w-5" />
            <span>{trip.location}</span>
          </div>
        </div>
      </header>

      <main className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SummaryWidget
            title="Participants"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">{participants.length}</div>
          </SummaryWidget>
          <SummaryWidget
            title="Gear Packed"
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="text-2xl font-bold">
              {gearPackedCount} / {gearItems.length}
            </div>
            <Progress value={gearProgress} className="mt-2" />
          </SummaryWidget>
          <div className="lg:col-span-1 rounded-lg overflow-hidden h-full min-h-[150px]">
             <MapPreview location={trip.location} apiKey={MAPBOX_API_KEY} />
          </div>
        </section>

        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="gear">Gear</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="itinerary" className="mt-4">
            <ItineraryTab
              itinerary={itinerary}
              onAddItem={addItineraryItem}
              onUpdateItem={updateItineraryItem}
              onRemoveItem={removeItineraryItem}
            />
          </TabsContent>
          <TabsContent value="gear" className="mt-4">
            <GearTab
              gearItems={gearItems}
              participants={participants}
              onAddItem={addGearItem}
              onUpdateItem={updateGearItem}
              onRemoveItem={removeGearItem}
            />
          </TabsContent>
          <TabsContent value="participants" className="mt-4">
            <ParticipantsTab
              participants={participants}
              onAddParticipant={addParticipant}
              onRemoveParticipant={removeParticipant}
            />
          </TabsContent>
          <TabsContent value="emergency" className="mt-4">
            <EmergencyTab
              contacts={emergencyContacts}
              onAddContact={addEmergencyContact}
              onUpdateContact={updateEmergencyContact}
              onRemoveContact={removeEmergencyContact}
            />
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
            <DocumentsTab
              documents={documents}
              onAddDocument={addDocument}
              onRemoveDocument={removeDocument}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Hidden component for printing */}
      <div className="absolute -left-[9999px] top-auto w-[794px]">
        <PrintableTripReport
          ref={printRef}
          trip={trip}
          participants={participants}
          itinerary={itinerary}
          gearItems={gearItems}
          emergencyContacts={emergencyContacts}
        />
      </div>
    </div>
  );
};

export default TripDetails;