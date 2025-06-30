import { useState } from "react";
import { TripDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, FileText, Download, FileUp } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface DocumentsTabProps {
  documents: TripDocument[];
  onAddDocument: (file: File) => Promise<void>;
  onRemoveDocument: (doc: TripDocument) => Promise<void>;
}

export const DocumentsTab = ({ documents, onAddDocument, onRemoveDocument }: DocumentsTabProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    await onAddDocument(selectedFile);
    setSelectedFile(null);
    setUploading(false);
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6 border p-4 rounded-lg">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="document-upload">Upload a new document</Label>
            <Input id="document-upload" type="file" onChange={handleFileChange} />
          </div>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full sm:w-auto">
            {uploading ? "Uploading..." : <><FileUp className="mr-2 h-4 w-4" /> Upload</>}
          </Button>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4 overflow-hidden">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <p className="font-semibold truncate" title={doc.name}>{doc.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.file_path, doc.name)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveDocument(doc)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="No documents uploaded"
            description="Upload tickets, reservations, or other important files."
          />
        )}
      </CardContent>
    </Card>
  );
};