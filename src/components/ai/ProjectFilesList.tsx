import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { Building2, Brain, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, Database, Download } from "lucide-react";
import { CompanyDataFile } from "@/services/aiAnalysisService";
import { generateProjectBid } from "@/services/aiAnalysisService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProjectFilesListProps {
  organizedProjects: Record<string, {
    pricing?: CompanyDataFile,
    floorplan?: CompanyDataFile,
    bid?: CompanyDataFile
  }>;
  currentPage: number;
  totalPages: number;
  sortBy: 'title' | 'location';
  projectsPerPage: number;
  onSortChange: (criteria: 'title' | 'location') => void;
  onPageChange: (page: number) => void;
  onClearAllFiles: () => void;
}

const ProjectFilesList: React.FC<ProjectFilesListProps> = ({
  organizedProjects,
  currentPage,
  totalPages,
  sortBy,
  projectsPerPage,
  onSortChange,
  onPageChange,
  onClearAllFiles
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const getCurrentProjects = () => {
    const projects = Object.keys(organizedProjects).sort();
    const start = currentPage * projectsPerPage;
    const end = start + projectsPerPage;
    return projects.slice(start, end);
  };

  const handleGenerateBid = async (projectId: string, projectName: string, projectLocation?: string) => {
    try {
      toast({
        title: "Generating Bid",
        description: "Please wait while we generate your bid...",
      });
      
      // Find floor plan for this project
      const floorPlan = organizedProjects[projectId]?.floorplan;
      
      if (!floorPlan) {
        toast({
          variant: "destructive",
          title: "No floor plan found",
          description: "A floor plan is required to generate a bid. Please upload one first.",
        });
        return;
      }
      
      // Prepare project details
      const projectDetails = {
        name: projectName + (projectLocation ? ` - ${projectLocation}` : ''),
        type: "commercial", // Default type
        budget: undefined, // Let AI determine budget
        notes: "Generated from project files"
      };
      
      // Generate the bid
      const bidResult = await generateProjectBid(floorPlan.id, projectDetails);
      
      if (bidResult) {
        toast({
          title: "Bid Generated Successfully",
          description: "The bid has been added to your project.",
        });
        
        // Navigate to bids page
        navigate("/bids");
      }
    } catch (error) {
      console.error("Error generating bid:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate bid",
        description: "Please try again later.",
      });
    }
  };

  const downloadFile = (file: CompanyDataFile) => {
    // Simulate file download as we don't have actual file data
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent("Simulated file content for " + file.fileName));
    element.setAttribute("download", file.fileName);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "File Downloaded",
      description: `${file.fileName} has been downloaded.`,
    });
  };

  if (Object.keys(organizedProjects).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Database className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p className="font-medium mb-1">No project data found</p>
        <p className="text-sm">Upload files to see them organized by project</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing projects {currentPage * projectsPerPage + 1} - {Math.min((currentPage + 1) * projectsPerPage, Object.keys(organizedProjects).length)} of {Object.keys(organizedProjects).length}
          </span>
        </div>
        <div className="flex gap-2">
          <div className="mr-4">
            <Button
              variant={sortBy === 'title' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('title')}
            >
              Sort by Title
            </Button>
            <Button
              variant={sortBy === 'location' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('location')}
              className="ml-2"
            >
              Sort by Location
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage >= totalPages - 1}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {getCurrentProjects().map(project => {
        const projectFiles = organizedProjects[project];
        const projectLocation = projectFiles.floorplan?.projectLocation || projectFiles.pricing?.projectLocation || projectFiles.bid?.projectLocation;
        
        return (
          <div key={project} className="border rounded-md p-4 bg-card shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-bidgenius-500 mr-2" />
                <h3 className="font-medium text-lg">{project} {projectLocation && <span className="text-sm text-gray-500">({projectLocation})</span>}</h3>
              </div>
              <div className="mt-2 md:mt-0 space-x-2">
                <Badge variant="outline" className="bg-gray-100">
                  {Object.keys(projectFiles).length} File{Object.keys(projectFiles).length !== 1 ? 's' : ''}
                </Badge>
                {projectFiles.floorplan && !projectFiles.bid && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleGenerateBid(project, project, projectLocation)}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Generate Bid
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-500 mr-2" />
                  Pricing Sheet
                </h4>
                {projectFiles.pricing ? (
                  <div className="text-sm">
                    <p className="truncate">{projectFiles.pricing.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistance(new Date(projectFiles.pricing.uploadDate), new Date(), { addSuffix: true })}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => downloadFile(projectFiles.pricing!)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No pricing data</div>
                )}
              </div>
              
              <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileText className="h-4 w-4 text-blue-500 mr-2" />
                  Floor Plan
                </h4>
                {projectFiles.floorplan ? (
                  <div className="text-sm">
                    <p className="truncate">{projectFiles.floorplan.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistance(new Date(projectFiles.floorplan.uploadDate), new Date(), { addSuffix: true })}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => downloadFile(projectFiles.floorplan!)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No floor plan</div>
                )}
              </div>
              
              <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileText className="h-4 w-4 text-orange-500 mr-2" />
                  Bid Document
                </h4>
                {projectFiles.bid ? (
                  <div className="text-sm">
                    <p className="truncate">{projectFiles.bid.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistance(new Date(projectFiles.bid.uploadDate), new Date(), { addSuffix: true })}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => downloadFile(projectFiles.bid!)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No bid document</div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      )}

      {Object.keys(organizedProjects).length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAllFiles}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Clear All Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectFilesList;
