 
import React, { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  Brain,
  Upload,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUploadSection from "@/components/ai/FileUploadSection";
import DataEntryTable from "@/components/ai/DataEntryTable";
import EnhancedFileUpload from "@/components/ai/EnhancedFileUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DataItem {
  id: string;
  name: string;
  price: number;
}

const AiAnalysis = () => {
  const { toast } = useToast();
  const [tableData, setTableData] = useState<DataItem[]>([]);
  const [showEnhancedUpload, setShowEnhancedUpload] = useState(false);

  const handleTableDataChange = (data: DataItem[]) => {
    setTableData(data);
    // Here you could save the data to localStorage or send to backend
    localStorage.setItem('ai-analysis-table-data', JSON.stringify(data));
  };

  // Load saved table data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('ai-analysis-table-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setTableData(parsedData);
      } catch (error) {
        console.error('Error loading saved table data:', error);
      }
    }
  }, []);

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-bidgenius-600" />
          <div>
            <h1 className="text-2xl font-bold">Documents</h1> {/* Renamed */}
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your project documents and upload bid templates.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Price Sheet Section - Now on top */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-bidgenius-600" />
              <CardTitle className="text-lg">Price Sheet</CardTitle>
            </div>
            <CardDescription>
              Manage your pricing data for AI analysis and bid generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataEntryTable 
              onDataChange={handleTableDataChange}
              initialData={tableData}
            />
          </CardContent>
        </Card>

        {/* Upload Bid Template Section - Now second */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-bidgenius-600" />
                <CardTitle className="text-lg">Upload Bid Template</CardTitle> {/* Renamed */}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEnhancedUpload(!showEnhancedUpload)}
                >
                  {showEnhancedUpload ? 'Hide' : 'Show'} Enhanced Upload
                </Button>
              </div>
            </div>
            <CardDescription>
              Upload your PDF or DOC bid template files. Files will be automatically processed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showEnhancedUpload ? (
              <EnhancedFileUpload
                onFilesUploaded={() => {}} // No longer need to trigger dialog
                acceptedTypes={['.pdf', '.doc', '.docx']} // Restricted to PDF and DOC
                maxFileSize={10}
                maxFiles={1}
              />
            ) : (
              <FileUploadSection onFileProcessed={() => {}} />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AiAnalysis;
