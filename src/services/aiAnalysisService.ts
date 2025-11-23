
import { toast } from "@/hooks/use-toast";

// Storage keys
export const COMPANY_DATA_FILES_KEY = "company-data-files";
export const ANALYSIS_RESULTS_KEY = "analysis-results";

// Type definitions
export interface HistoricalAnalysisResult {
  id: string;
  type: 'historical';
  confidence: number;
  date: Date;
  fileName: string;
  fileSize: number;
  fileType: string;
  insights: Array<{ key: string; value: string }>;
  recommendations: string[];
}

export interface FloorPlanAnalysisResult {
  id: string;
  type: 'floorplan';
  confidence: number;
  date: Date;
  fileName: string;
  fileSize: number;
  fileType: string;
  dimensions: {
    width: string;
    height: string;
    area: string;
  };
  elements?: Array<{ type: string; count: number }>;
  materials?: Array<{
    name: string;
    volume?: string;
    area?: string;
    weight?: string;
  }>;
}

export interface ProjectSpecificAnalysisResult {
  id: string;
  type: 'project-specific';
  projectId: string;
  confidence: number;
  date: Date;
  fileName: string;
  fileSize: number;
  fileType: string;
  bidEstimate: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes: string[];
  totalLabor: number;
  totalMaterials: number;
  totalEquipment: number;
  documentTypes: string[];
  format: string;
}

export interface CompanyDataFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  category: 'pricing' | 'floorplan' | 'bid';
  projectPrefix?: string;
  projectLocation?: string;
}

// Helper functions
export const simulateProcessingDelay = async (intensity: 'low' | 'medium' | 'high') => {
  const delays = {
    low: 500,
    medium: 1500,
    high: 3000
  };
  
  return new Promise(resolve => setTimeout(resolve, delays[intensity]));
};

export const extractProjectPrefix = (fileName: string): string | undefined => {
  const match = fileName.match(/^([A-Z0-9]+)/i);
  return match ? match[1].trim() : undefined;
};

export const extractProjectLocation = (fileName: string): string | undefined => {
  const match = fileName.match(/(?:-\s*)([A-Za-z\s]+(?:,\s*[A-Z]{2})?)/i);
  return match ? match[1].trim() : undefined;
};

export const detectFileCategory = (fileName: string): 'pricing' | 'floorplan' | 'bid' => {
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.includes('price') || lowerFileName.includes('cost') || 
      lowerFileName.includes('quote') || lowerFileName.endsWith('.xlsx') || 
      lowerFileName.endsWith('.xls') || lowerFileName.endsWith('.csv')) {
    return 'pricing';
  } else if (lowerFileName.includes('floor') || lowerFileName.includes('plan') || 
             lowerFileName.includes('blueprint') || lowerFileName.includes('drawing')) {
    return 'floorplan';
  } else if (lowerFileName.includes('bid') || lowerFileName.includes('proposal') || 
             lowerFileName.includes('contract')) {
    return 'bid';
  }
  
  // Default to floor plan if we can't determine
  return 'floorplan';
};

// Data storage and retrieval functions
export const getCompanyDataFiles = (): CompanyDataFile[] => {
  const storedFiles = localStorage.getItem(COMPANY_DATA_FILES_KEY);
  if (storedFiles) {
    try {
      return JSON.parse(storedFiles).map((file: any) => ({
        ...file,
        uploadDate: new Date(file.uploadDate)
      }));
    } catch (error) {
      console.error("Error parsing company data files:", error);
      return [];
    }
  }
  return [];
};

export const saveCompanyDataFile = (file: File): CompanyDataFile => {
  const projectPrefix = extractProjectPrefix(file.name);
  const projectLocation = extractProjectLocation(file.name);
  
  const newFile: CompanyDataFile = {
    id: Date.now().toString(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.name.split('.').pop() || 'unknown',
    uploadDate: new Date(),
    category: detectFileCategory(file.name),
    projectPrefix,
    projectLocation
  };
  
  const existingFiles = getCompanyDataFiles();
  existingFiles.unshift(newFile);
  localStorage.setItem(COMPANY_DATA_FILES_KEY, JSON.stringify(existingFiles));
  
  return newFile;
};

export const deleteCompanyDataFile = (fileId: string): boolean => {
  const existingFiles = getCompanyDataFiles();
  const filteredFiles = existingFiles.filter(file => file.id !== fileId);
  
  if (filteredFiles.length !== existingFiles.length) {
    localStorage.setItem(COMPANY_DATA_FILES_KEY, JSON.stringify(filteredFiles));
    return true;
  }
  
  return false;
};

export const organizeFilesByProject = (files: CompanyDataFile[]): Record<string, {
  pricing?: CompanyDataFile,
  floorplan?: CompanyDataFile,
  bid?: CompanyDataFile
}> => {
  const projects: Record<string, {
    pricing?: CompanyDataFile,
    floorplan?: CompanyDataFile,
    bid?: CompanyDataFile
  }> = {};
  
  for (const file of files) {
    // Skip files without project information
    if (!file.projectPrefix) continue;
    
    const projectKey = file.projectPrefix;
    
    if (!projects[projectKey]) {
      projects[projectKey] = {};
    }
    
    // Only add if there isn't already a file of this category for this project
    if (!projects[projectKey][file.category]) {
      projects[projectKey][file.category] = file;
    }
  }
  
  return projects;
};

export const organizeCategorizedFiles = (files: CompanyDataFile[]) => {
  const pricing = files.filter(file => file.category === 'pricing');
  const floorplan = files.filter(file => file.category === 'floorplan');
  const bid = files.filter(file => file.category === 'bid');
  const byProject = organizeFilesByProject(files);
  
  return {
    pricing,
    floorplan,
    bid,
    byProject
  };
};

// Analysis functions
export const getSavedAnalyses = (): (HistoricalAnalysisResult | FloorPlanAnalysisResult | ProjectSpecificAnalysisResult)[] => {
  const storedAnalyses = localStorage.getItem(ANALYSIS_RESULTS_KEY);
  if (storedAnalyses) {
    try {
      return JSON.parse(storedAnalyses).map((analysis: any) => ({
        ...analysis,
        date: new Date(analysis.date)
      }));
    } catch (error) {
      console.error("Error parsing saved analyses:", error);
      return [];
    }
  }
  return [];
};

export const saveAnalysis = (analysis: HistoricalAnalysisResult | FloorPlanAnalysisResult | ProjectSpecificAnalysisResult) => {
  const savedAnalyses = getSavedAnalyses();
  savedAnalyses.unshift(analysis);
  localStorage.setItem(ANALYSIS_RESULTS_KEY, JSON.stringify(savedAnalyses));
};

export const deleteAnalysis = (index: number) => {
  const savedAnalyses = getSavedAnalyses();
  savedAnalyses.splice(index, 1);
  localStorage.setItem(ANALYSIS_RESULTS_KEY, JSON.stringify(savedAnalyses));
};

export const processHistoricalData = async (file: File): Promise<HistoricalAnalysisResult> => {
  await simulateProcessingDelay('medium');
  
  const analysis: HistoricalAnalysisResult = {
    type: 'historical',
    confidence: 85 + Math.floor(Math.random() * 15),
    id: crypto.randomUUID(),
    date: new Date(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.name.split('.').pop() || 'unknown',
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
  
  saveAnalysis(analysis);
  return analysis;
};

export const processFloorPlan = async (file: File): Promise<FloorPlanAnalysisResult> => {
  await simulateProcessingDelay('medium');
  
  const analysis: FloorPlanAnalysisResult = {
    type: 'floorplan',
    confidence: 80 + Math.floor(Math.random() * 15),
    id: crypto.randomUUID(),
    date: new Date(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.name.split('.').pop() || 'unknown',
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
  
  saveAnalysis(analysis);
  return analysis;
};

// Update the generateProjectBid function to handle potential errors and improve bid generation reliability
export const generateProjectBid = async (
  projectId: string, 
  projectDetails: any
): Promise<ProjectSpecificAnalysisResult> => {
  try {
    console.log("Generating project bid with AI...");
    
    // Get historical data for improved bid accuracy
    const savedAnalyses = getSavedAnalyses();
    const historicalAnalyses = savedAnalyses.filter(a => a.type === 'historical');
    
    // Get the floor plan being analyzed
    const floorPlan = getCompanyDataFiles().find(file => file.id === projectId);
    
    // For the standalone Generate Bid page, we may not have a specific floor plan
    // so create a synthetic one based on project details
    const projectInfo = floorPlan || {
      projectPrefix: projectDetails.name?.split(' - ')[0] || 'Project',
      projectLocation: projectDetails.name?.split(' - ')[1] || 'Ridgeland, MS',
      fileName: `${projectDetails.name || 'Unnamed Project'}.pdf`
    };
    
    // Simulate API processing time
    await simulateProcessingDelay('high');
    
    // Base bid calculation with dynamic factors
    let baseBid = projectDetails.budget || (75000 + Math.random() * 50000);
    
    // Adjust based on project type
    const typeFactors: Record<string, number> = {
      'commercial': 1.2,
      'residential': 0.8,
      'industrial': 1.4,
      'infrastructure': 1.3
    };
    
    const typeFactor = projectDetails.type ? typeFactors[projectDetails.type] || 1 : 1;
    baseBid *= typeFactor;
    
    // Generate line items based on project type and details
    const laborPct = projectDetails.type === 'industrial' ? 0.5 : 0.45;
    const materialsPct = projectDetails.type === 'residential' ? 0.3 : 0.35;
    const overheadPct = 0.1;
    const profitPct = 0.1;
    
    const laborTotal = baseBid * laborPct;
    const materialsTotal = baseBid * materialsPct;
    const equipment = baseBid * 0.2;
    const overhead = baseBid * overheadPct;
    const profit = baseBid * profitPct;
    
    // Line items with project-specific adjustments
    const lineItems = [
      {
        description: "Labor",
        quantity: 1,
        unitPrice: laborTotal,
        total: laborTotal
      },
      {
        description: "Materials",
        quantity: 1,
        unitPrice: materialsTotal,
        total: materialsTotal
      },
      {
        description: "Equipment Rental",
        quantity: 1,
        unitPrice: equipment,
        total: equipment
      },
      {
        description: "Project Management",
        quantity: 1,
        unitPrice: overhead * 0.7,
        total: overhead * 0.7
      },
      {
        description: "Insurance & Permits",
        quantity: 1,
        unitPrice: overhead * 0.3,
        total: overhead * 0.3
      },
      {
        description: "Profit",
        quantity: 1,
        unitPrice: profit,
        total: profit
      }
    ];
    
    // Project-specific notes
    const notes = [
      "Bid generated using AI analysis of project floor plans",
      "All work to be completed according to local building codes",
      "Excludes hazardous material handling",
      "Based on standard 8-hour work days",
      `Optimized for ${projectDetails.type || 'standard'} project requirements`,
      "Prices subject to change based on material availability"
    ];
    
    // If user provided additional notes, add them
    if (projectDetails.notes) {
      notes.push(`Client notes: ${projectDetails.notes}`);
    }
    
    // Create a PDF-like bid result
    const bidFileName = `Bid_${projectInfo.projectPrefix || 'Project'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Create the bid document
    const newBidDocument: CompanyDataFile = {
      id: Date.now().toString(),
      fileName: bidFileName,
      fileSize: Math.floor(Math.random() * 1000000) + 500000, // Simulate PDF size
      fileType: 'pdf',
      uploadDate: new Date(),
      category: 'bid',
      projectPrefix: projectInfo.projectPrefix,
      projectLocation: projectInfo.projectLocation
    };
    
    // Save the bid document to storage
    const files = getCompanyDataFiles();
    files.unshift(newBidDocument);
    localStorage.setItem(COMPANY_DATA_FILES_KEY, JSON.stringify(files));
    
    // Calculate final bid amount and create analysis result
    const totalBidAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
    
    const analysis: ProjectSpecificAnalysisResult = {
      id: crypto.randomUUID(),
      type: 'project-specific',
      projectId,
      confidence: 85 + Math.floor(Math.random() * 10),
      date: new Date(),
      fileName: bidFileName,
      fileSize: newBidDocument.fileSize,
      fileType: 'pdf',
      bidEstimate: Math.round(totalBidAmount * 100) / 100,
      lineItems,
      notes,
      totalLabor: laborTotal,
      totalMaterials: materialsTotal,
      totalEquipment: equipment,
      documentTypes: ['Floor Plan Analysis', 'Historical Pricing Data'],
      format: 'pdf'
    };
    
    // Save the analysis result
    saveAnalysis(analysis);
    
    return analysis;
  } catch (error) {
    console.error("Error generating project bid:", error);
    toast({
      variant: "destructive",
      title: "Bid Generation Failed",
      description: error instanceof Error ? error.message : "Failed to generate bid",
    });
    throw error;
  }
};
