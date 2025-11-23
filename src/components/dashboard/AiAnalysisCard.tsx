 
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Upload, Check, AlertTriangle, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  processHistoricalData, 
  processFloorPlan,
  HistoricalAnalysisResult, 
  FloorPlanAnalysisResult,
  ProjectSpecificAnalysisResult
} from "@/services/aiAnalysisService";

interface AiAnalysisCardProps {
  title: string;
  description: string;
  fileTypes: string[];
  analysisType: 'historical' | 'floorplan' | 'project-specific';
  projectData?: any;
}

const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  title,
  description,
  fileTypes,
  analysisType,
  projectData
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<
    HistoricalAnalysisResult | FloorPlanAnalysisResult | ProjectSpecificAnalysisResult | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFile = e.dataTransfer.files[0];
      setFile(newFile);
      await processFile(newFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      setFile(newFile);
      await processFile(newFile);
    }
  };

  const processFile = async (fileToProcess: File) => {
    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      let result;
      
      // Try to extract project information from the filename for better organization
      const projectMatch = fileToProcess.name.match(/^([A-Z0-9]+\s*-\s*[^_\s]+(?:,\s*[A-Z]{2})?)/i);
      const projectPrefix = projectMatch ? projectMatch[1].trim() : fileToProcess.name.split(/[_\s]/)[0];
      
      if (analysisType === 'historical') {
        result = await processHistoricalData(fileToProcess);
        toast({
          title: "Data Analysis Complete",
          description: "Historical data has been successfully analyzed.",
        });
      } else if (analysisType === 'floorplan') {
        result = await processFloorPlan(fileToProcess);
        toast({
          title: "Blueprint Analysis Complete",
          description: "Floor plan has been successfully analyzed.",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "Project-specific data has been successfully analyzed.",
        });
      }
      
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error processing file:", err);
      setError("Unable to process file. Please make sure it's in a supported format.");
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing your file.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysisResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    if (analysisResult.type === 'historical') {
      const result = analysisResult as HistoricalAnalysisResult;
      return (
        <div className="space-y-4">
          <div className="flex items-center text-green-600 mb-2">
            <Check className="h-5 w-5 mr-1" />
            <span className="text-lg font-medium">Data Analysis Complete</span>
            <span className="ml-auto text-sm bg-green-100 text-green-800 py-1 px-2 rounded dark:bg-green-900/20 dark:text-green-400">
              {result.confidence}% Confidence
            </span>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Insights
            </h3>
            <div className="space-y-2 text-sm">
              {result.insights.map((insight, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded flex justify-between">
                  <p>{insight.key}</p>
                  <p className="font-medium">{insight.value}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              AI Recommendations
            </h3>
            <div className="space-y-2 text-sm">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <p>{index + 1}. {rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (analysisResult.type === 'floorplan') {
      const result = analysisResult as FloorPlanAnalysisResult;
      return (
        <div className="space-y-4">
          <div className="flex items-center text-green-600 mb-2">
            <Check className="h-5 w-5 mr-1" />
            <span className="text-lg font-medium">Blueprint Analyzed</span>
            <span className="ml-auto text-sm bg-green-100 text-green-800 py-1 px-2 rounded dark:bg-green-900/20 dark:text-green-400">
              {result.confidence}% Confidence
            </span>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dimensions
            </h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <p className="text-gray-500">Width</p>
                <p className="font-medium">{result.dimensions.width}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <p className="text-gray-500">Height</p>
                <p className="font-medium">{result.dimensions.height}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <p className="text-gray-500">Area</p>
                <p className="font-medium">{result.dimensions.area}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Detected Elements
            </h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {result.elements.map((element, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <p className="text-gray-500">{element.type}</p>
                  <p className="font-medium">{element.count}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Material Estimates
            </h3>
            <div className="space-y-2 text-sm">
              {result.materials.map((material, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded flex justify-between">
                  <p>{material.name}</p>
                  <p className="font-medium">
                    {material.volume || material.area || material.weight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (analysisResult.type === 'project-specific') {
      const result = analysisResult as ProjectSpecificAnalysisResult;
      return (
        <div className="space-y-4">
          <div className="flex items-center text-green-600 mb-2">
            <Check className="h-5 w-5 mr-1" />
            <span className="text-lg font-medium">Bid Generated</span>
            <span className="ml-auto text-sm bg-green-100 text-green-800 py-1 px-2 rounded dark:bg-green-900/20 dark:text-green-400">
              {result.confidence}% Confidence
            </span>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Bid Estimate
            </h3>
            <p className="text-2xl font-bold text-bidgenius-600">${result.bidEstimate.toLocaleString()}</p>
          </div>
          
          {result.documentTypes && result.documentTypes.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Documents Used
              </h3>
              <div className="flex gap-2 flex-wrap">
                {result.documentTypes.map((docType, index) => (
                  <div key={index} className="text-xs flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 py-1 px-2 rounded-full">
                    {docType === 'Pricing Spreadsheet' ? (
                      <FileSpreadsheet className="h-3 w-3 mr-1" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    {docType}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Line Items
            </h3>
            <div className="space-y-2 text-sm">
              {result.lineItems.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded flex justify-between">
                  <p>{item.description}</p>
                  <p className="font-medium">${item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </h3>
            <div className="space-y-1 text-sm">
              {result.notes.map((note, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <p>• {note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Processing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
              ${isDragging ? 'border-bidgenius-500 bg-bidgenius-50 dark:bg-bidgenius-900/20' : 'border-gray-300 hover:border-bidgenius-400'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="h-12 w-12 rounded-full bg-bidgenius-100 dark:bg-bidgenius-900/30 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-bidgenius-600 dark:text-bidgenius-400" />
            </div>
            
            <p className="text-sm text-center mb-2">{description}</p>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {fileTypes.join(', ')} files supported
            </p>
            
            <label htmlFor={`file-upload-${title}`}>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Select File
              </Button>
              <input
                id={`file-upload-${title}`}
                type="file"
                className="sr-only"
                accept={fileTypes.map(type => `.${type}`).join(',')}
                onChange={handleFileChange}
              />
            </label>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 p-2 border border-gray-200 dark:border-gray-700 rounded flex items-center gap-2 bg-gray-50 dark:bg-gray-900">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="font-medium">{file.name}</span>
              <span className="ml-auto text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-bidgenius-600 animate-spin mb-4" />
                <p className="text-sm text-gray-500">Analyzing data with AI...</p>
              </div>
            ) : (
              <>
                {renderAnalysisResult()}
                
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" size="sm" onClick={resetAnalysis}>
                    Analyze Another File
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiAnalysisCard;
