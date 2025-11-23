import React, { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileSpreadsheet, 
  Trash, 
  FileText, 
  Calendar, 
  FileUp, 
  Search, 
  Filter, 
  BarChart4, 
  ArrowUpDown,
  Building,
  LayoutGrid,
  ListFilter,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  HistoricalAnalysisResult, 
  FloorPlanAnalysisResult, 
  ProjectSpecificAnalysisResult,
  getSavedAnalyses,
  deleteAnalysis,
  saveCompanyDataFile
} from "@/services/aiAnalysisService";
import AnalysisResultCard from "@/components/ai/AnalysisResultCard";

type AnalysisType = "historical" | "floorplan" | "project-specific";
type TabType = "all" | AnalysisType;

const AnalysisHistory = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [analyses, setAnalyses] = useState<(HistoricalAnalysisResult | FloorPlanAnalysisResult | ProjectSpecificAnalysisResult)[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadedAnalyses = getSavedAnalyses();
    setAnalyses(loadedAnalyses);
  }, []);
  
  const filteredAnalyses = activeTab === "all" 
    ? analyses 
    : activeTab === "historical"
      ? analyses.filter(a => a.type === "historical")
      : activeTab === "floorplan"
        ? analyses.filter(a => a.type === "floorplan")
        : analyses.filter(a => a.type === "project-specific");
    
  const searchFilteredAnalyses = searchTerm
    ? filteredAnalyses.filter(analysis => {
        const filename = analysis.fileName.toLowerCase();
        return filename.includes(searchTerm.toLowerCase());
      })
    : filteredAnalyses;
  
  const sortedAnalyses = [...searchFilteredAnalyses].sort((a, b) => {
    if (sortOrder === "desc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });
  
  const handleDeleteAnalysis = (id: string) => {
    if (window.confirm("Are you sure you want to delete this analysis?")) {
      const indexToDelete = analyses.findIndex(a => a.id === id);
      if (indexToDelete !== -1) {
        deleteAnalysis(indexToDelete);
        setAnalyses(prevAnalyses => prevAnalyses.filter(a => a.id !== id));
        toast({
          title: "Analysis deleted",
          description: "The analysis has been removed successfully",
        });
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      handleFileUpload(Array.from(e.target.files));
    }
  };
  
  const handleFileUpload = async (filesToUpload: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          processFiles(filesToUpload);
        }
        return newProgress;
      });
    }, 100);
  };
  
  const processFiles = (filesToProcess: File[]) => {
    try {
      const newAnalyses = [...analyses];
      
      for (const file of filesToProcess) {
        const savedFile = saveCompanyDataFile(file);
        
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        
        if (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'csv') {
          const analysis: HistoricalAnalysisResult = {
            type: 'historical',
            confidence: 85 + Math.floor(Math.random() * 15),
            id: crypto.randomUUID(),
            date: new Date(),
            fileName: file.name,
            fileSize: file.size,
            fileType: fileExt,
            insights: [
              { key: "Average Cost Per Sq. Ft.", value: `$${(30 + Math.random() * 20).toFixed(2)}` },
              { key: "Labor Cost Percentage", value: `${(40 + Math.random() * 20).toFixed(1)}%` },
              { key: "Material Cost Percentage", value: `${(30 + Math.random() * 15).toFixed(1)}%` }
            ],
            recommendations: [
              "Consider adjusting labor costs based on regional averages",
              "Evaluate material supplier options for better pricing",
              "Review equipment rental duration to optimize costs"
            ]
          };
          newAnalyses.unshift(analysis);
        } else if (fileExt === 'pdf') {
          if (file.name.toLowerCase().includes('plan') || file.name.toLowerCase().includes('floor')) {
            const analysis: FloorPlanAnalysisResult = {
              type: 'floorplan',
              confidence: 80 + Math.floor(Math.random() * 15),
              id: crypto.randomUUID(),
              date: new Date(),
              fileName: file.name,
              fileSize: file.size,
              fileType: fileExt,
              dimensions: {
                width: `${30 + Math.floor(Math.random() * 50)}ft`,
                height: `${40 + Math.floor(Math.random() * 30)}ft`,
                area: `${(1200 + Math.floor(Math.random() * 3000)).toLocaleString()}sq ft`
              },
              elements: [
                { type: "Walls", count: 12 + Math.floor(Math.random() * 10) },
                { type: "Doors", count: 5 + Math.floor(Math.random() * 8) },
                { type: "Windows", count: 8 + Math.floor(Math.random() * 6) },
                { type: "Rooms", count: 4 + Math.floor(Math.random() * 5) }
              ],
              materials: [
                { name: "Concrete", volume: `${(20 + Math.random() * 40).toFixed(1)} yd³` },
                { name: "Drywall", area: `${(1000 + Math.random() * 2000).toFixed(0)} ft²` },
                { name: "Steel", weight: `${(5 + Math.random() * 10).toFixed(1)} tons` }
              ]
            };
            newAnalyses.unshift(analysis);
          } else {
            const analysis: ProjectSpecificAnalysisResult = {
              type: 'project-specific',
              projectId: crypto.randomUUID(),
              confidence: 75 + Math.floor(Math.random() * 20),
              id: crypto.randomUUID(),
              date: new Date(),
              fileName: file.name,
              fileSize: file.size,
              fileType: fileExt,
              bidEstimate: 75000 + Math.floor(Math.random() * 150000),
              documentTypes: ["Pricing Spreadsheet", "Floor Plan"],
              lineItems: [
                { description: 'Demolition Labor', quantity: 160, unitPrice: 65, total: 10400 },
                { description: 'Debris Removal', quantity: 40, unitPrice: 450, total: 18000 },
                { description: 'Equipment Rental', quantity: 1, unitPrice: 15000, total: 15000 }
              ],
              notes: [
                'Based on standard pricing',
                'Excludes hazardous material handling'
              ],
              totalLabor: 45000,
              totalMaterials: 18000,
              totalEquipment: 30000,
              format: 'pdf'
            };
            newAnalyses.unshift(analysis);
          }
        }
      }
      
      setAnalyses(newAnalyses);
      setIsUploading(false);
      setSelectedFiles([]);
      
      toast({
        title: "Files processed",
        description: `${filesToProcess.length} file(s) analyzed successfully.`,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "There was an error analyzing your files."
      });
      setIsUploading(false);
      setSelectedFiles([]);
    }
  };
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };
  
  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-bidgenius-600" />
          <div>
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage all your previous AI analyses
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <Input
            placeholder="Search analyses..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            <Calendar className="mr-1 h-4 w-4" />
            Date {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
          
          <div>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.pdf"
            />
            <label htmlFor="file-upload">
              <Button variant="default" size="sm" className="cursor-pointer" asChild>
                <div>
                  <FileUp className="mr-1 h-4 w-4" />
                  Upload Files
                </div>
              </Button>
            </label>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="all">All Company Data</TabsTrigger>
          <TabsTrigger value="historical">Pricing Sheets</TabsTrigger>
          <TabsTrigger value="project-specific">Bids</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {isUploading && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Uploading {selectedFiles.length} file(s)...</Label>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-bidgenius-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedAnalyses.length > 0 ? (
              sortedAnalyses.map(analysis => (
                <AnalysisResultCard 
                  key={analysis.id}
                  result={analysis}
                  onDelete={() => handleDeleteAnalysis(analysis.id)}
                />
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-gray-500 dark:text-gray-400">
                <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">No analyses found</h3>
                <p>Upload files to analyze or check your search filters</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="historical" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedAnalyses.length > 0 ? (
              sortedAnalyses.map(analysis => (
                <AnalysisResultCard 
                  key={analysis.id}
                  result={analysis}
                  onDelete={() => handleDeleteAnalysis(analysis.id)}
                />
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-gray-500 dark:text-gray-400">
                <FileSpreadsheet className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">No pricing sheet analyses found</h3>
                <p>Upload spreadsheets to generate cost estimations</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="project-specific" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedAnalyses.length > 0 ? (
              sortedAnalyses.map(analysis => (
                <AnalysisResultCard 
                  key={analysis.id}
                  result={analysis}
                  onDelete={() => handleDeleteAnalysis(analysis.id)}
                />
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-gray-500 dark:text-gray-400">
                <Building className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">No bid analyses found</h3>
                <p>Upload bid documents to generate project-specific analyses</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default AnalysisHistory;
