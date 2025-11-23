import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  File as FileIcon, 
  X, 
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Image
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface EnhancedFileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
}

const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFilesUploaded,
  acceptedTypes = ['.xlsx', '.xls', '.pdf', '.csv', '.jpg', '.png'],
  maxFileSize = 10, // 10MB
  maxFiles = 5
}) => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not supported`;
    }

    return null;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'jpg':
      case 'png':
      case 'jpeg':
        return <Image className="h-5 w-5 text-blue-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    const fileId = crypto.randomUUID();
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          clearInterval(interval);
          uploadedFile.status = 'success';
          uploadedFile.progress = 100;
          resolve(uploadedFile);
        } else {
          uploadedFile.progress = progress;
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileId ? { ...uploadedFile } : f)
          );
        }
      }, 200);
    });
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${maxFiles} files at a time`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "File Validation Error",
          description: error,
          variant: "destructive"
        });
        continue;
      }

      const uploadedFile = await processFile(file);
      newFiles.push(uploadedFile);
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);

    if (newFiles.length > 0) {
      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) uploaded successfully`,
      });

      if (onFilesUploaded) {
        onFilesUploaded([...uploadedFiles, ...newFiles]);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "File Removed",
      description: "The file has been removed successfully",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragOver 
          ? 'border-bidgenius-500 bg-bidgenius-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center py-8"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
            <p className="text-gray-600 text-center mb-4">
              Drag and drop files here, or click to browse
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {acceptedTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <p className="text-xs text-gray-500">
              Max file size: {maxFileSize}MB • Max files: {maxFiles}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Uploaded Files</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <div className="w-20">
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                    
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFileUpload; 