import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  HardHat, 
  DollarSign,
  FileCheck,
  Save,
  ArrowLeft,
  Trash2,
  UserPlus,
  UserX,
  Users
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
import { Project, ProjectStatus, TeamMember } from "@/types/project";
import { projectAPI, UpdateProjectRequest } from "@/api/projects";
import { useNotifications } from "@/hooks/use-notifications";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    role: 'worker'
  });
  
  // Project state
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    client: "",
    address: "",
    dueDate: new Date(),
    budget: 0,
    status: "active",
    description: "",
    contactEmail: "",
    contactPhone: "",
    progress: 0,
    team: []
  });

  // Load projects from localStorage
  const getProjectsFromStorage = (): Project[] => {
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
    return [
      {
        id: "1",
        title: "Downtown Office Renovation",
        client: "ABC Corporation",
        address: "123 Main St, Seattle, WA",
        dueDate: new Date("2023-12-15"),
        budget: 125000,
        status: "active" as ProjectStatus,
        progress: 65,
        description: "Complete renovation of downtown office space including new electrical and HVAC.",
        contactEmail: "contact@abccorp.com",
        contactPhone: "(206) 555-1234",
        tasks: [],
        team: [],
        documents: [],
        bids: []
      },
      {
        id: "2",
        title: "Westside Residential Complex",
        client: "Westside Development",
        address: "456 Park Ave, Seattle, WA",
        dueDate: new Date("2024-02-28"),
        budget: 2750000,
        status: "pending" as ProjectStatus,
        progress: 15,
        description: "New construction of 24-unit residential complex with underground parking.",
        contactEmail: "info@westsidedev.com",
        contactPhone: "(206) 555-6789",
        tasks: [],
        team: [],
        documents: [],
        bids: []
      },
      {
        id: "3",
        title: "Harbor View Hotel Remodel",
        client: "Oceanside Hospitality",
        address: "789 Harbor Blvd, Seattle, WA",
        dueDate: new Date("2023-10-30"),
        budget: 890000,
        status: "completed" as ProjectStatus,
        progress: 100,
        description: "Complete remodel of hotel lobby, restaurant, and 15 premium suites.",
        contactEmail: "projects@oceansidehospitality.com",
        contactPhone: "(206) 555-4321",
        tasks: [],
        team: [],
        documents: [],
        bids: []
      },
      {
        id: "4",
        title: "Parkside Community Center",
        client: "City of Seattle",
        address: "321 Park Lane, Seattle, WA",
        dueDate: new Date("2024-04-15"),
        budget: 1250000,
        status: "active" as ProjectStatus,
        progress: 35,
        description: "Construction of a new community center with gymnasium, classrooms, and kitchen facilities.",
        contactEmail: "projects@seattle.gov",
        contactPhone: "(206) 555-5555",
        tasks: [],
        team: [],
        documents: [],
        bids: []
      },
      {
        id: "5",
        title: "Tech Park Office Building",
        client: "TechInvest LLC",
        address: "567 Innovation Way, Seattle, WA",
        dueDate: new Date("2024-03-10"),
        budget: 3450000,
        status: "pending" as ProjectStatus,
        progress: 0,
        description: "Six-story office building with smart technology integration throughout.",
        contactEmail: "projects@techinvest.com",
        contactPhone: "(206) 555-7890",
        tasks: [],
        team: [],
        documents: [],
        bids: []
      }
    ];
  };
  
  // Transform API project to frontend project structure
  const transformApiProject = (apiProject: any): Project => {
    console.log('Transforming project for edit:', apiProject);
    
    try {
      return {
        id: apiProject._id || apiProject.id || '',
        title: apiProject.projectName || apiProject.title || 'Untitled Project',
        client: apiProject.clientName || apiProject.client || 'Unknown Client',
        address: apiProject.location || apiProject.address || 'No address provided',
        dueDate: apiProject.estimatedStartDate ? new Date(apiProject.estimatedStartDate) : 
                 apiProject.dueDate ? new Date(apiProject.dueDate) : new Date(),
        budget: Number(apiProject.budget) || 0,
        status: (apiProject.status as any) || 'pending',
        progress: Number(apiProject.progress) || 0,
        description: apiProject.projectDescription || apiProject.description || '',
        contactEmail: apiProject.contactEmail || '',
        contactPhone: apiProject.contactPhone || '',
        tasks: Array.isArray(apiProject.tasks) ? apiProject.tasks : [],
        team: Array.isArray(apiProject.team) ? apiProject.team : [],
        documents: Array.isArray(apiProject.documents) ? apiProject.documents : [],
        bids: Array.isArray(apiProject.bids) ? apiProject.bids : [],
        notes: apiProject.notes || '',
        type: apiProject.projectType || apiProject.type || '',
        startDate: apiProject.startDate ? new Date(apiProject.startDate) : undefined,
        endDate: apiProject.endDate ? new Date(apiProject.endDate) : undefined,
        manager: apiProject.manager || ''
      };
    } catch (error) {
      console.error('Error transforming project for edit:', error, apiProject);
      throw error;
    }
  };

  // Load project data on component mount
  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        // Try to load from API first
        try {
          console.log("Loading project for edit with ID:", id);
          const apiProject = await projectAPI.getProjectById(id);
          console.log("API project data for edit:", apiProject);
          
          const transformedProject = transformApiProject(apiProject);
          console.log("Transformed project for edit:", transformedProject);
          
          setFormData({
            ...transformedProject,
            team: transformedProject.team || []
          });
        } catch (apiError) {
          console.error("API error, falling back to localStorage:", apiError);
          
          // Fallback to localStorage
          const projects = getProjectsFromStorage();
          const project = projects.find(p => p.id === id);
          
          if (project) {
            setFormData({
              ...project,
              team: project.team || []
            });
          } else {
            toast({
              title: "Project not found",
              description: "Unable to load project data.",
              variant: "destructive",
            });
            navigate('/projects');
          }
        }
      } catch (error) {
        console.error("Error loading project:", error);
        toast({
          title: "Failed to load project",
          description: "There was an error loading the project.",
          variant: "destructive",
        });
        navigate('/projects');
      }
    };
    
    loadProject();
  }, [id, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "budget" ? Number(value) : value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as ProjectStatus
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      dueDate: value ? new Date(value) : prev.dueDate
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.title || !formData.client || !formData.address || !formData.id) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Try to update via API first
      try {
        const updateData: UpdateProjectRequest = {
          title: formData.title,
          client: formData.client,
          address: formData.address,
          description: formData.description,
          status: formData.status,
          budget: formData.budget
        };
        
        await projectAPI.updateProject(formData.id, updateData);
        
        addNotification({
          title: "Project Updated",
          message: `Project "${formData.title}" has been updated successfully.`,
          type: "success"
        });
        
        toast({
          title: "Project updated successfully!",
          description: "Your project changes have been saved.",
        });
        
        navigate(`/projects/${formData.id}`);
      } catch (apiError) {
        console.error("API error, falling back to localStorage:", apiError);
        
        // Fallback to localStorage
        const projects = getProjectsFromStorage();
        const updatedProjects = projects.map((p: Project) => 
          p.id === formData.id ? { ...formData, id: formData.id } as Project : p
        );
        
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        addNotification({
          title: "Project Updated",
          message: `Project "${formData.title}" has been updated successfully.`,
          type: "success"
        });
        
        toast({
          title: "Project updated successfully!",
          description: "Your project changes have been saved locally.",
        });
        
        navigate(`/projects/${formData.id}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Failed to update project",
        description: "There was an error updating your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeamMember = () => {
    if (!newTeamMember.name || !newTeamMember.email) {
      toast({
        title: "Missing information",
        description: "Please provide name and email for the team member",
        variant: "destructive",
      });
      return;
    }
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newTeamMember.name,
      email: newTeamMember.email,
      role: newTeamMember.role as 'manager' | 'worker' | 'supervisor',
      avatar: ''
    };
    
    setFormData(prev => ({
      ...prev,
      team: [...(prev.team || []), newMember]
    }));
    
    setNewTeamMember({
      name: '',
      email: '',
      role: 'worker'
    });
    
    setIsAddingTeamMember(false);
    
    toast({
      title: "Team member added",
      description: `${newMember.name} has been added to the project team`,
    });
  };
  
  const handleRemoveTeamMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team?.filter(member => member.id !== memberId) || []
    }));
    
    toast({
      title: "Team member removed",
      description: "The team member has been removed from the project",
    });
  };
  
  const handleDeleteProject = () => {
    const projects = getProjectsFromStorage();
    const updatedProjects = projects.filter(p => p.id !== id);
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    addNotification({
      title: "Project Deleted",
      message: `Project "${formData.title}" has been deleted.`,
      type: "warning"
    });
    
    toast({
      title: "Project deleted",
      description: "The project has been permanently deleted.",
    });
    
    navigate('/projects');
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd");
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => navigate(`/projects/${id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
            </Button>
            
            <h1 className="text-2xl font-bold">Edit Project</h1>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project and all its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                    <Label htmlFor="title">Project Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter project name"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client">Client Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="client"
                      name="client"
                      placeholder="Enter client name"
                      value={formData.client}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Project Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        placeholder="Budget amount"
                        className="pl-10"
                        value={formData.budget}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Location <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        name="address"
                        placeholder="Project address"
                        className="pl-10"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        className="pl-10"
                        value={formatDateForInput(formData.dueDate)}
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      placeholder="Contact email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      placeholder="Contact phone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter project details, specific requirements, etc."
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="progress">Project Progress (%)</Label>
                  <Input
                    id="progress"
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Project progress"
                    value={formData.progress}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-bidgenius-600" />
                  Project Team
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500">Manage team members working on this project</p>
                  <Dialog open={isAddingTeamMember} onOpenChange={setIsAddingTeamMember}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-bidgenius-600 hover:bg-bidgenius-700 text-white">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Add a new team member to this project
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name"
                            value={newTeamMember.name}
                            onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter team member name"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email"
                            type="email"
                            value={newTeamMember.email}
                            onChange={(e) => setNewTeamMember(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select 
                            value={newTeamMember.role}
                            onValueChange={(value) => setNewTeamMember(prev => ({ ...prev, role: value }))}
                          >
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="worker">Worker</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingTeamMember(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddTeamMember}>
                          Add Member
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {formData.team && formData.team.length > 0 ? (
                  <div className="space-y-3">
                    {formData.team.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-bidgenius-100 dark:bg-bidgenius-900 rounded-full flex items-center justify-center text-bidgenius-600">
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleRemoveTeamMember(member.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">No team members yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add team members to help manage and work on this project
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/projects/${id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-bidgenius-600 hover:bg-bidgenius-700 text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Saving Changes...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default EditProject;
