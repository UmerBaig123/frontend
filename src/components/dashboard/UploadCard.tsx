 
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadCardProps {
  title: string;
  description: string;
  fileTypes: string[];
  onUpload: (file: File) => Promise<void>;
  onAnalyze?: (file: File) => Promise<void>;
  multiple?: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({
  title,
  description,
  fileTypes,
  onUpload,
  onAnalyze,
  multiple = true
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadSuccess, setUploadSuccess] = useState<{[key: string]: boolean}>({});
  const [uploadError, setUploadError] = useState<{[key: string]: string}>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList: FileList) => {
    const newFiles = multiple ? 
      Array.from(fileList) : 
      [fileList[0]];
    
    // Validate file types
    const validFiles = newFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return fileTypes.includes(extension);
    });
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Invalid file type",
        description: `Some files were rejected. Supported file types: ${fileTypes.join(', ')}`,
        variant: "destructive",
      });
    }
    
    if (validFiles.length === 0) return;
    
    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles([validFiles[0]]);
    }
    
    // Initialize progress for new files
    const newProgress = {...uploadProgress};
    const newSuccess = {...uploadSuccess};
    const newError = {...uploadError};
    
    validFiles.forEach(file => {
      const fileId = `${file.name}-${file.size}-${Date.now()}`;
      newProgress[fileId] = 0;
      newSuccess[fileId] = false;
      newError[fileId] = '';
    });
    
    setUploadProgress(newProgress);
    setUploadSuccess(newSuccess);
    setUploadError(newError);
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    for (const file of files) {
      const fileId = `${file.name}-${file.size}-${Date.now()}`;
      
      try {
        setUploadProgress(prev => ({...prev, [fileId]: 10}));
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress < 90) {
              return {...prev, [fileId]: currentProgress + 10};
            }
            clearInterval(progressInterval);
            return prev;
          });
        }, 300);
        
        // Upload file
        await onUpload(file);
        
        setUploadProgress(prev => ({...prev, [fileId]: 100}));
        setUploadSuccess(prev => ({...prev, [fileId]: true}));
        
        clearInterval(progressInterval);
        
        // Analyze if needed
        if (onAnalyze) {
          await onAnalyze(file);
        }
        
        toast({
          title: "Upload complete",
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadError(prev => ({...prev, [fileId]: "Failed to upload file."}));
        
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors mb-4 
            ${isDragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'}
            ${files.length > 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-sm text-center mb-2">{description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Supported formats: {fileTypes.join(', ')}
              </p>
              <Button variant="outline" size="sm" onClick={openFileDialog}>
                Select Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={fileTypes.map(type => `.${type}`).join(',')}
                onChange={handleFileChange}
                multiple={multiple}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
                <Button variant="outline" size="sm" onClick={openFileDialog}>
                  Add More
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {files.map((file, index) => {
                  const fileId = `${file.name}-${file.size}-${Date.now()}`;
                  const progress = uploadProgress[fileId] || 0;
                  const isSuccess = uploadSuccess[fileId] || false;
                  const error = uploadError[fileId] || '';
                  
                  return (
                    <div key={index} className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded p-2 shadow-sm">
                      <FileText className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        
                        {uploading && !isSuccess && !error && (
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      
                      {isSuccess ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : error ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {files.length > 0 && (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Upload {files.length > 1 ? `(${files.length})` : ''}</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadCard;
