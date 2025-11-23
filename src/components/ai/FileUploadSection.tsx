import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { templateAPI } from "@/api/template";

interface FileUploadSectionProps {
  onFileProcessed?: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ onFileProcessed }) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const file = uploadedFiles[0];
    setIsUploading(true);

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
        processFile(file);
      }
    }, 200);
  };

  const processFile = async (file: File) => {
    try {
      console.log("Starting file upload:", file.name, file.size, file.type);
      
      const result = await templateAPI.uploadTemplate(file);

      toast({
        title: "Bid Template Uploaded Successfully",
        description: `${file.name} has been processed and uploaded to the server.`,
      });

      if (onFileProcessed) {
        onFileProcessed();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error uploading your bid template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
            <Upload className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Upload Bid Template
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Drag and drop PDF or DOC files or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX
            </p>
          </div>
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
          />
          <Button asChild variant="outline" size="sm">
            <label htmlFor="file-upload" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>

        {isUploading && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Uploading file...
            </p>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadSection;
