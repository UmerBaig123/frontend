 
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  HardHat, 
  FileCheck,
  PlusCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Project, ProjectStatus } from "@/types/project";
import { projectAPI, CreateProjectRequest } from "@/api/projects";

const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectType, setProjectType] = useState<string>("commercial");
  
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    location: "",
    estimatedStartDate: "",
    projectDescription: "",
    scope: {
      interior: true,
      exterior: false,
      structural: false,
      mechanical: false,
      electrical: false,
      plumbing: false
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScopeChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [value]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.projectName || !formData.clientName || !formData.location) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create project request data
      const projectData: CreateProjectRequest = {
        title: formData.projectName,
        client: formData.clientName,
        description: formData.projectDescription,
        dueDate: formData.estimatedStartDate || new Date().toISOString().split('T')[0],
        budget: 0,
        location: formData.location,
        projectType: projectType,
        status: "pending"
      };

      console.log("Sending project data to API:", projectData);
      console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
      console.log("Auth token:", localStorage.getItem('auth_token'));

      try {
        // Try to create project via API
        const result = await projectAPI.createProject(projectData);
        console.log("API create result:", result);
        
        toast({
          title: "Project created successfully!",
          description: "Your new project has been created and saved.",
        });
        
        navigate("/projects");
      } catch (apiError) {
        console.error("API error, falling back to localStorage:", apiError);
        
        // Fallback to localStorage if API fails
        const newProject: Project = {
          id: crypto.randomUUID(),
          title: formData.projectName,
          client: formData.clientName,
          address: formData.location,
          dueDate: formData.estimatedStartDate ? new Date(formData.estimatedStartDate) : new Date(),
          budget: 0,
          status: "pending" as ProjectStatus,
          progress: 0,
          description: formData.projectDescription,
          contactEmail: "",
          contactPhone: "",
          tasks: [],
          team: [],
          documents: [],
          bids: []
        };
        
        const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const updatedProjects = [...existingProjects, newProject];
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        toast({
          title: "Project created successfully!",
          description: "Your new project has been created and saved locally.",
        });
        
        navigate("/projects");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create New Project</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-bidgenius-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      placeholder="Enter project name"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      placeholder="Enter client name"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectType">Project Type</Label>
                    <Select 
                      value={projectType} 
                      onValueChange={(value) => setProjectType(value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="Project address"
                        className="pl-10"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedStartDate">Estimated Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="estimatedStartDate"
                        name="estimatedStartDate"
                        type="date"
                        className="pl-10"
                        value={formData.estimatedStartDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea
                    id="projectDescription"
                    name="projectDescription"
                    placeholder="Enter project details, specific requirements, etc."
                    rows={4}
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardHat className="h-5 w-5 text-bidgenius-600" />
                  Demolition Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="interior" 
                      checked={formData.scope.interior}
                      onCheckedChange={(checked) => 
                        handleScopeChange("interior", checked === true)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="interior">Interior Demolition</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="exterior" 
                      checked={formData.scope.exterior}
                      onCheckedChange={(checked) => 
                        handleScopeChange("exterior", checked === true)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="exterior">Exterior Demolition</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="structural" 
                      checked={formData.scope.structural}
                      onCheckedChange={(checked) => 
                        handleScopeChange("structural", checked === true)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="structural">Structural Demolition</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="mechanical" 
                      checked={formData.scope.mechanical}
                      onCheckedChange={(checked) => 
                        handleScopeChange("mechanical", checked === true)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="mechanical">Mechanical Systems</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="electrical" 
                      checked={formData.scope.electrical}
                      onCheckedChange={(checked) => 
                        handleScopeChange("electrical", checked === true)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="electrical">Electrical Systems</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="plumbing" 
                      checked={formData.scope.plumbing}
                      onCheckedChange={(checked) => 
                        handleScopeChange("plumbing", checked === true)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="plumbing">Plumbing Systems</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-bidgenius-600 hover:bg-bidgenius-700 text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Creating Project...</>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default NewProject;
