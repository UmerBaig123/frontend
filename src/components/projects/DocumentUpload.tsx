import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, FileText } from 'lucide-react';
import { ProjectDocument } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

interface DocumentUploadProps {
  projectId?: string;
  onDocumentAdded?: (document: ProjectDocument) => void;
  onUpload?: (file: File) => void;
  allowedTypes?: string[];
  fileCategory?: 'bid' | 'plan' | 'pricing' | 'other';
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  projectId, 
  onDocumentAdded,
  onUpload,
  allowedTypes = [".pdf", ".docx", ".xlsx", ".csv", ".jpg", ".jpeg", ".png"],
  fileCategory = "other"
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [docType, setDocType] = useState<"bid" | "plan" | "pricing" | "other">(fileCategory);
  const [docName, setDocName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-fill document name from filename if not already set
      if (!docName) {
        setDocName(selectedFile.name.split('.')[0]);
      }
      
      // Auto-detect document type based on file category or extension
      if (fileCategory !== "other") {
        setDocType(fileCategory);
      } else {
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        if (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'csv') {
          setDocType('pricing');
        } else if (selectedFile.name.toLowerCase().includes('plan') || selectedFile.name.toLowerCase().includes('floor')) {
          setDocType('plan');
        } else if (fileExt === 'pdf' && !selectedFile.name.toLowerCase().includes('plan')) {
          setDocType('bid');
        }
      }

      if (onUpload) {
        onUpload(selectedFile);
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    if (!docName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing document name",
        description: "Please provide a name for the document.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload with progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload process
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Create new document object
      const newDocument: ProjectDocument = {
        id: Date.now().toString(),
        name: docName,
        type: docType,
        createdAt: new Date(),
        content: {
          fileUrl: URL.createObjectURL(file),
          // Add other properties based on document type
          ...(docType === 'bid' && { 
            bidAmount: 0,
            approved: false
          })
        }
      };

      // Add to project documents
      if (onDocumentAdded) {
        onDocumentAdded(newDocument);
      }
      
      // Reset form
      setFile(null);
      setDocName("");
      setDocType(fileCategory);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Document uploaded",
        description: "The document has been successfully processed and added to the project.",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Upload {docType === 'plan' ? 'Floor Plan' : docType === 'pricing' ? 'Pricing Sheet' : docType === 'bid' ? 'Bid Document' : 'Document'}</h3>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="doc-name" className="text-sm font-medium mb-1 block">
                Document Name
              </label>
              <Input 
                id="doc-name"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
            
            {fileCategory === "other" && (
              <div>
                <label htmlFor="doc-type" className="text-sm font-medium mb-1 block">
                  Document Type
                </label>
                <Select value={docType} onValueChange={(value) => setDocType(value as any)}>
                  <SelectTrigger id="doc-type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bid">Bids Submitted</SelectItem>
                    <SelectItem value="plan">Floor Plans</SelectItem>
                    <SelectItem value="pricing">Pricing Sheets</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label htmlFor="file-upload" className="text-sm font-medium mb-1 block">
                Select File
              </label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  asChild
                  className="w-full cursor-pointer"
                >
                  <label htmlFor="file-upload" className="flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    {file ? file.name : `Choose ${docType === 'plan' ? 'Floor Plan' : docType === 'pricing' ? 'Pricing Sheet' : docType === 'bid' ? 'Bid Document' : 'File'}`}
                  </label>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={allowedTypes.join(',')}
                />
              </div>
              {file && (
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <Button
              onClick={handleUpload}
              disabled={isUploading || !file || !docName.trim()}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload & Process"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload; 
