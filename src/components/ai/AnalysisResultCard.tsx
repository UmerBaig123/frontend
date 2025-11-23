import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Trash, 
  FileText, 
  Download, 
  BarChart4, 
  Building
} from "lucide-react";
import { 
  HistoricalAnalysisResult, 
  FloorPlanAnalysisResult, 
  ProjectSpecificAnalysisResult 
} from "@/services/aiAnalysisService";

interface AnalysisResultCardProps {
  result: HistoricalAnalysisResult | FloorPlanAnalysisResult | ProjectSpecificAnalysisResult;
  onDelete: () => void;
}

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result, onDelete }) => {
  const formatDate = (date: Date) => {
    return date instanceof Date 
      ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : 'Unknown date';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getCardIcon = () => {
    switch (result.type) {
      case 'historical':
        return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      case 'floorplan':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'project-specific':
        return <Building className="h-10 w-10 text-orange-500" />;
    }
  };

  const getCardTitle = () => {
    switch (result.type) {
      case 'historical':
        return 'Pricing Sheet Analysis';
      case 'floorplan':
        return 'Floor Plan Analysis';
      case 'project-specific':
        return 'Bid Analysis';
    }
  };

  const renderContent = () => {
    switch (result.type) {
      case 'historical':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{result.fileName}</h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(result.fileSize)} • {formatDate(result.date)}
                </p>
              </div>
              <div className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-full flex items-center">
                <BarChart4 className="h-3 w-3 mr-1" />
                {result.confidence}% confidence
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Insights</h4>
              <div className="grid grid-cols-2 gap-2">
                {result.insights.map((insight, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-md">
                    <p className="text-xs text-gray-500">{insight.key}</p>
                    <p className="font-medium">{insight.value}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case 'floorplan':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{result.fileName}</h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(result.fileSize)} • {formatDate(result.date)}
                </p>
              </div>
              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-full flex items-center">
                <BarChart4 className="h-3 w-3 mr-1" />
                {result.confidence}% confidence
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Floor Plan Dimensions</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 p-2 rounded-md">
                  <p className="text-xs text-gray-500">Width</p>
                  <p className="font-medium">{result.dimensions.width}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                  <p className="text-xs text-gray-500">Height</p>
                  <p className="font-medium">{result.dimensions.height}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                  <p className="text-xs text-gray-500">Area</p>
                  <p className="font-medium">{result.dimensions.area}</p>
                </div>
              </div>
            </div>
            
            {result.elements && result.elements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Elements Detected</h4>
                <div className="grid grid-cols-4 gap-2">
                  {result.elements.map((element, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">{element.type}</p>
                      <p className="font-medium">{element.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.materials && result.materials.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Material Estimation</h4>
                <div className="grid grid-cols-2 gap-2">
                  {result.materials.map((material, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">{material.name}</p>
                      <p className="font-medium">
                        {material.volume || material.area || material.weight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'project-specific':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{result.fileName}</h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(result.fileSize)} • {formatDate(result.date)}
                </p>
              </div>
              <div className="px-2 py-1 bg-orange-50 text-orange-700 text-sm rounded-full flex items-center">
                <BarChart4 className="h-3 w-3 mr-1" />
                {result.confidence}% confidence
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Total Bid Amount:</span>
                <span className="text-xl font-bold">${result.bidEstimate.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="border-r">
                  <p className="text-xs text-gray-500">Labor</p>
                  <p className="font-medium">${result.totalLabor.toLocaleString()}</p>
                </div>
                <div className="border-r text-center">
                  <p className="text-xs text-gray-500">Materials</p>
                  <p className="font-medium">${result.totalMaterials.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Equipment</p>
                  <p className="font-medium">${result.totalEquipment.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Line Items</h4>
              <div className="space-y-1">
                {result.lineItems.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.description}:</span>
                    <span>${item.total.toLocaleString()}</span>
                  </div>
                ))}
                {result.lineItems.length > 4 && (
                  <div className="text-sm text-gray-500 italic text-right">
                    + {result.lineItems.length - 4} more items
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notes</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                {result.notes.slice(0, 3).map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
                {result.notes.length > 3 && (
                  <li className="text-gray-500 italic">+ {result.notes.length - 3} more notes</li>
                )}
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-2 flex flex-row items-start">
        <div className="flex items-center flex-1">
          {getCardIcon()}
          <div className="ml-3">
            <CardTitle className="text-lg">{getCardTitle()}</CardTitle>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            title="Download analysis"
          >
            <Download className="h-4 w-4 text-gray-500" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700"
            onClick={onDelete}
            title="Delete analysis"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default AnalysisResultCard;
