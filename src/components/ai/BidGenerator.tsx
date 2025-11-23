import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { FileText, FileCheck, FileWarning, Loader2, Download, Brain, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { generateProjectBid } from '@/services/aiAnalysisService';
import { ProjectSpecificAnalysisResult } from '@/services/aiAnalysisService';

interface BidGeneratorProps {
  floorPlans: Array<{id: string, fileName: string, projectPrefix?: string, projectLocation?: string}>;
  onBidGenerated?: (bid: ProjectSpecificAnalysisResult) => void;
}

const BidGenerator: React.FC<BidGeneratorProps> = ({ floorPlans, onBidGenerated }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('commercial');
  const [projectBudget, setProjectBudget] = useState<string>('');
  const [projectNotes, setProjectNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [generatedBid, setGeneratedBid] = useState<ProjectSpecificAnalysisResult | null>(null);
  const { toast } = useToast();

  // Get selected floor plan details
  const getSelectedPlanDetails = () => {
    return floorPlans.find(plan => plan.id === selectedPlan);
  };

  // Auto-fill project name based on selection
  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    const plan = floorPlans.find(p => p.id === planId);
    if (plan && plan.projectPrefix) {
      setProjectName(plan.projectPrefix + (plan.projectLocation ? ` - ${plan.projectLocation}` : ''));
    }
  };

  const handleGenerateBid = async () => {
    if (!selectedPlan && floorPlans.length > 0) {
      toast({
        variant: "destructive",
        title: "No floor plan selected",
        description: "Please select a floor plan to analyze."
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 1000);

    try {
      // Prepare project details
      const projectDetails = {
        name: projectName || 'Unnamed Project',
        type: projectType,
        budget: projectBudget ? parseFloat(projectBudget) : undefined,
        notes: projectNotes
      };

      // If no floor plan is selected (when there are none available), use a placeholder ID
      const planId = selectedPlan || 'placeholder-plan-id';

      // Generate bid using selected floor plan
      const bid = await generateProjectBid(
        planId,
        projectDetails
      );

      if (!bid) {
        throw new Error("Failed to generate bid");
      }

      // Update UI
      setGeneratedBid(bid);
      
      // Notify parent component
      if (onBidGenerated) {
        onBidGenerated(bid);
      }

      clearInterval(interval);
      setProgress(100);
      
      toast({
        title: "Bid Generated Successfully",
        description: `AI-generated bid for ${projectName || 'Unnamed Project'} is ready to view.`
      });
    } catch (error) {
      clearInterval(interval);
      console.error("Bid generation error:", error);
      toast({
        variant: "destructive",
        title: "Bid Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred."
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const downloadBid = () => {
    if (!generatedBid) return;
    
    // Create a simple HTML representation of the bid
    const bidContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bid Estimate - ${projectName || 'Unnamed Project'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .bid-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
            .footer { margin-top: 30px; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bid Estimate</h1>
            <p>Project: ${projectName || 'Unnamed Project'}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="bid-info">
            <p><strong>Total Bid Amount:</strong> $${generatedBid.bidEstimate.toLocaleString()}</p>
            <p><strong>Project Type:</strong> ${projectType}</p>
            ${projectNotes ? `<p><strong>Notes:</strong> ${projectNotes}</p>` : ''}
          </div>
          
          <h2>Line Items</h2>
          <table>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
            ${generatedBid.lineItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>$${item.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3">TOTAL</td>
              <td>$${generatedBid.bidEstimate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
          </table>
          
          <h2>Notes</h2>
          <ul>
            ${generatedBid.notes.map(note => `<li>${note}</li>`).join('')}
          </ul>
          
          <div class="footer">
            <p>This bid was generated using AI analysis based on floor plans and historical data.</p>
            <p>Confidence Level: ${generatedBid.confidence}%</p>
          </div>
        </body>
      </html>
    `;
    
    // Create a Blob from the HTML content
    const blob = new Blob([bidContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bid_${(projectName || 'Project').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Bid Downloaded",
      description: "The bid document is ready for review"
    });
  };

  const selectedPlanDetails = getSelectedPlanDetails();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-bidgenius-600" />
          AI Bid Generator
        </CardTitle>
        <CardDescription>
          Generate project-specific bids by analyzing floor plans with AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        {floorPlans.length === 0 ? (
          <Alert className="bg-amber-50 border-amber-200">
            <FileWarning className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              No floor plans available. Upload floor plans in the Files tab to generate bids.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="floor-plan">Select Floor Plan</Label>
              <Select 
                value={selectedPlan} 
                onValueChange={handlePlanSelection}
                disabled={isProcessing}
              >
                <SelectTrigger id="floor-plan">
                  <SelectValue placeholder="Choose a floor plan to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {floorPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.fileName}
                      {plan.projectPrefix && plan.projectLocation && (
                        <span className="text-gray-500 text-xs"> ({plan.projectPrefix} - {plan.projectLocation})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input 
                id="project-name" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Select 
                value={projectType}
                onValueChange={setProjectType}
                disabled={isProcessing}
              >
                <SelectTrigger id="project-type">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-budget">
                Estimated Budget (optional)
              </Label>
              <Input 
                id="project-budget"
                type="number"
                value={projectBudget}
                onChange={(e) => setProjectBudget(e.target.value)}
                placeholder="Enter estimated budget"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-notes">Additional Notes (optional)</Label>
              <Textarea
                id="project-notes"
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
                placeholder="Enter any specific requirements or notes"
                disabled={isProcessing}
                className="min-h-[100px]"
              />
            </div>

            {selectedPlanDetails && (
              <Alert className="bg-gray-50 border-gray-200">
                <FileText className="h-4 w-4 text-gray-500" />
                <AlertDescription>
                  Analyzing {selectedPlanDetails.fileName}
                  {selectedPlanDetails.projectPrefix && selectedPlanDetails.projectLocation && (
                    <span> for project {selectedPlanDetails.projectPrefix} in {selectedPlanDetails.projectLocation}</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing floor plan and generating bid...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={handleGenerateBid}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Bid...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Bid
                </>
              )}
            </Button>
          </div>
        )}

        {generatedBid && !isProcessing && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-green-500" />
                Bid Generated
              </h3>
              <p className="text-sm text-gray-500">
                AI-generated bid based on floor plan analysis
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Bid Amount:</span>
                <span className="text-lg font-bold">${generatedBid.bidEstimate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confidence Level:</span>
                <span>{generatedBid.confidence}%</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Major Line Items:</h4>
              <div className="space-y-1">
                {generatedBid.lineItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.description}:</span>
                    <span>${item.total.toLocaleString()}</span>
                  </div>
                ))}
                {generatedBid.lineItems.length > 3 && (
                  <div className="text-sm text-gray-500 italic">
                    + {generatedBid.lineItems.length - 3} more items
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={downloadBid}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Bid PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidGenerator;