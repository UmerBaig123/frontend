import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Upload, FileText, Loader2, Brain, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useProfileInfo } from "@/hooks/use-profile-info";
import { 
  generateProjectBid,
  getCompanyDataFiles
} from "@/services/aiAnalysisService";
import { bidAPI } from "@/api/bids";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GenerateBid = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { profileInfo } = useProfileInfo();
  const [isProcessing, setIsProcessing] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [hasCompanyData, setHasCompanyData] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showAiTips, setShowAiTips] = useState(false);
  const [projectNotes, setProjectNotes] = useState("");
  
  useEffect(() => {
    const companyFiles = getCompanyDataFiles();
    setHasCompanyData(companyFiles.length > 0);
  }, []);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    
    setUploadedFile(files[0]);
    
    toast({
      title: "File uploaded",
      description: "Your file is ready to be used for bid generation.",
    });
  };

  const getProjectsFromStorage = () => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      try {
        const parsed = JSON.parse(storedProjects);
        return parsed.map((project: any) => ({
          ...project,
          dueDate: new Date(project.dueDate)
        }));
      } catch (error) {
        console.error("Error parsing stored projects:", error);
        return [];
      }
    }
    return [];
  };

  const simulateAiProcessing = () => {
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setProcessingStep(step);
      
      if (step >= 5) {
        clearInterval(interval);
      }
    }, 800);
    
    return () => clearInterval(interval);
  };

  const handleGenerateBid = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a project name.",
        variant: "destructive",
      });
      return;
    }

    if (!clientName.trim()) {
      toast({
        title: "Missing information", 
        description: "Please provide a client name.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessingStep(0);
    
    const clearSimulation = simulateAiProcessing();
    
    try {
      const projectDetails = {
        name: projectName,
        type: projectType,
        notes: projectNotes
      };
      
      const projectId = `bid-${Date.now()}`;
      
      console.log("Starting AI bid generation for:", projectName);
      
      const bidResult = await generateProjectBid(
        projectId, 
        projectDetails
      );
      
      console.log("AI bid generation complete:", bidResult);

      // Create bid data for API
      const bidData = {
        projectName: projectName,
        client: clientName,
        amount: bidResult.bidEstimate.toString(),
        description: projectNotes || `${projectType} project`,
        location: projectLocation || undefined,
      };

      let apiResponse;
      
      if (uploadedFile) {
        // Create bid with document using the /with-document endpoint
        apiResponse = await bidAPI.createBidWithDocument({
          ...bidData,
          document: uploadedFile
        });
      } else {
        // Create bid without document using the regular endpoint
        apiResponse = await bidAPI.createBid(bidData);
      }

      if (apiResponse.success ) {
        // Also save to localStorage for backward compatibility with existing UI
        const projects = getProjectsFromStorage();
        const matchingProject = projects.find(p => p.title.toLowerCase() === projectName.toLowerCase());
        
        if (matchingProject) {
          const newBidDocument = {
            id: `doc-${Date.now()}`,
            name: `Bid for ${matchingProject.title}`,
            type: "bid" as const,
            createdAt: new Date(),
            format: "pdf",
            content: {
              bidAmount: bidResult.bidEstimate,
              lineItems: bidResult.lineItems,
              documentTypes: bidResult.documentTypes || []
            }
          };
          
          if (!matchingProject.documents) {
            matchingProject.documents = [];
          }
          matchingProject.documents.push(newBidDocument);
          
          localStorage.setItem('projects', JSON.stringify(projects));
        }

        // Save to localStorage bids for backward compatibility
        const existingBids = JSON.parse(localStorage.getItem('bids') || '[]');
        const newBid = {
          id: parseInt(apiResponse.bid.id),
          projectName: apiResponse.bid.projectName,
          client: apiResponse.bid.client,
          createdDate: apiResponse.bid.createdDate,
          amount: `$${parseInt(apiResponse.bid.amount).toLocaleString()}`,
          status: apiResponse.bid.status,
          description: apiResponse.bid.description || projectNotes || `${projectType} project`,
          documents: uploadedFile ? 1 : 0,
          location: apiResponse.bid.location
        };
        
        existingBids.push(newBid);
        localStorage.setItem('bids', JSON.stringify(existingBids));

        addNotification({
          id: `bid-${Date.now()}`,
          title: "Bid Generated Successfully",
          message: `New bid for "${projectName}" has been created and is ready for review.`,
          type: "success",
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "Bid Generated Successfully!",
          description: "The AI-generated bid has been created and saved to the system.",
        });
        
        setProjectName("");
        setProjectType("");
        setClientName("");
        setProjectLocation("");
        setProjectNotes("");
        setUploadedFile(null);
        
        setTimeout(() => {
          navigate("/bids");
        }, 1500);
      } else {
        throw new Error(apiResponse.message || "Failed to create bid");
      }
      
    } catch (error) {
      console.error("Error generating bid:", error);
      toast({
        // title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate bid. Please try again.",
        // variant: "destructive"
      });
    } finally {
      clearSimulation();
      setIsProcessing(false);
    }
  };

  const renderProcessingStep = () => {
    const steps = [
      "Analyzing project requirements...",
      "Retrieving historical data...",
      "Calculating cost estimates...",
      "Applying AI optimization...",
      "Finalizing bid document..."
    ];
    
    return steps[processingStep - 1] || "Preparing...";
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Generate New Bid</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create accurate demolition bids with advanced AI analysis using your company data.
            </p>
          </div>
        </div>
        
        {!hasCompanyData && (
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50">
            <Brain className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              For more accurate bids, upload your company's historical data in the AI Analysis section first.
              <Button 
                variant="link" 
                className="text-amber-800 dark:text-amber-300 p-0 h-auto font-normal underline ml-2"
                onClick={() => navigate("/ai-analysis")}
              >
                Go to AI Analysis
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Provide basic information for your new bid.
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowAiTips(!showAiTips)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">AI bidding tips</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              {showAiTips && (
                <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong>AI Bidding Tips:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Be specific with project type to improve accuracy</li>
                      <li>Upload project documents for more precise estimates</li>
                      <li>More historical data = better bid accuracy</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      placeholder="Enter client name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project-type">Project Type</Label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="residential">Residential Building</SelectItem>
                        <SelectItem value="industrial">Industrial Facility</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project-location">Project Location (Optional)</Label>
                    <Input
                      id="project-location"
                      placeholder="Enter project location"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project-notes">Additional Notes</Label>
                    <Textarea
                      id="project-notes"
                      placeholder="Enter any additional information about this project"
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="project-file">Project-Specific Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-center">
                        {uploadedFile ? (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{uploadedFile.name}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2 text-red-500 hover:text-red-700"
                              onClick={() => setUploadedFile(null)}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Label htmlFor="file-upload" className="cursor-pointer">
                              <div className="flex flex-col items-center">
                                <Upload className="h-5 w-5 text-gray-500 mb-1" />
                                <span className="text-sm">Upload project specifications or blueprints</span>
                              </div>
                              <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
                              />
                            </Label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-bidgenius-200 dark:border-bidgenius-800/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-bidgenius-100 dark:bg-bidgenius-900/50 p-3 rounded-full">
                  <Brain className="h-5 w-5 text-bidgenius-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">AI Bid Generation</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our AI engine analyzes your company's historical data, project specifications, and industry 
                    benchmarks to generate highly accurate bids tailored to your specific requirements.
                    {hasCompanyData ? 
                      " Your historical company data will be used to enhance bid accuracy." : 
                      " Upload company data in the AI Analysis section for more accurate bids."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isProcessing && (
            <Card className="border-blue-100 dark:border-blue-900/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" />
                      <span className="font-medium">{renderProcessingStep()}</span>
                    </div>
                    <span className="text-sm text-gray-500">Step {processingStep}/5</span>
                  </div>
                  <Progress value={processingStep * 20} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end">
            <Button
              className="bg-bidgenius-600 hover:bg-bidgenius-700"
              disabled={isProcessing}
              onClick={handleGenerateBid}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  AI Generating Bid...
                </>
              ) : (
                "Generate Bid"
              )}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default GenerateBid;
