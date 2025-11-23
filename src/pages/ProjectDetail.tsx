import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProject, updateProject, addDocument, removeDocument, updateTask, removeTask, addTeamMember, removeTeamMember, deleteProject } from "@/services/projectService";
import { projectAPI } from "@/api/projects";
import { Project, ProjectStatus, ProjectDocument, Task, TeamMember } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, File, FileSpreadsheet, FilePlus, FileText, FileUp, Link2, Trash2, Loader2, PenLine, UserPlus, X } from "lucide-react";
import DocumentItem from "@/components/projects/DocumentItem";
import DocumentUpload from "@/components/projects/DocumentUpload";
import TaskItem from "@/components/projects/TaskItem";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const removeGenerateBidButton = () => {
  // Find all Generate New Bid buttons on project pages and remove them
  const generateBidButtons = document.querySelectorAll('[data-button-type="generate-bid"]');
  generateBidButtons.forEach(button => {
    button.remove();
  });
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus>("active");
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<{ name: string; type: "bid" | "plan" | "pricing" | "other" }>({
    name: "",
    type: "other"
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [teamMemberDialogOpen, setTeamMemberDialogOpen] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState<{ name: string; email: string; role: "manager" | "supervisor" | "worker" }>({
    name: "",
    email: "",
    role: "worker"
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      // Try to load project from API first
      try {
        console.log("Loading project from API with ID:", projectId);
        const apiResponse = await projectAPI.getProjectById(projectId);
        console.log("API response for project:", apiResponse);
        
        // Transform API response to frontend structure
        const transformedProject = transformApiProject(apiResponse);
        console.log("Transformed project:", transformedProject);
        setProject(transformedProject);
      } catch (apiError) {
        console.error("API error, falling back to local service:", apiError);
        // Fallback to local service
        const data = await getProject(projectId);
        setProject(data);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        variant: "destructive",
        title: "Failed to load project",
        description: "There was an error loading the project details.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform API project to frontend project structure
  const transformApiProject = (apiProject: any): Project => {
    console.log('Transforming individual project:', apiProject);
    
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
      console.error('Error transforming individual project:', error, apiProject);
      // Return a minimal valid project if transformation fails
      return {
        id: apiProject._id || apiProject.id || `temp-${Date.now()}`,
        title: apiProject.projectName || apiProject.title || 'Untitled Project',
        client: apiProject.clientName || apiProject.client || 'Unknown Client',
        address: 'No address provided',
        dueDate: new Date(),
        budget: 0,
        status: 'pending',
        progress: 0,
        description: '',
        contactEmail: '',
        contactPhone: '',
        tasks: [],
        team: [],
        documents: [],
        bids: []
      };
    }
  };

  const handleStatusChange = async () => {
    if (!project || !newStatus) return;
    
    try {
      // Try to update via API first
      try {
        const updatedProject = await projectAPI.updateProject(project.id, { 
          title: project.title,
          client: project.client,
          address: project.address,
          description: project.description || '',
          status: newStatus,
          budget: project.budget
        });
        setProject(updatedProject);
      } catch (apiError) {
        console.error("API error, falling back to local service:", apiError);
        // Fallback to local service
        const updatedProject = await updateProject(project.id, { ...project, status: newStatus });
        setProject(updatedProject);
      }
      
      setStatusDialogOpen(false);
      toast({
        title: "Status updated",
        description: `Project status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Status update failed",
        description: "There was an error updating the project status.",
      });
    }
  };

  const handleAddDocument = async () => {
    if (!project || !id || !newDocument.name) return;
    
    setIsUploading(true);
    
    try {
      // Simulate file upload with progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          if (next >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return next;
        });
      }, 300);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new document
      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        name: newDocument.name,
        type: newDocument.type,
        createdAt: new Date(),
        content: {
          fileUrl: "#"
        }
      };
      
      const updatedProject = await addDocument(id, newDoc);
      setProject(updatedProject);
      
      // Reset form
      setNewDocument({ name: "", type: "other" });
      setDocumentDialogOpen(false);
      setUploadProgress(0);
      
      toast({
        title: "Document added",
        description: "The document has been successfully added to the project.",
      });
    } catch (error) {
      console.error("Error adding document:", error);
      toast({
        variant: "destructive",
        title: "Failed to add document",
        description: "There was an error adding the document.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    if (!project || !id) return;
    
    try {
      const updatedProject = await removeDocument(id, documentId);
      setProject(updatedProject);
      
      toast({
        title: "Document removed",
        description: "The document has been removed from the project.",
      });
    } catch (error) {
      console.error("Error removing document:", error);
      toast({
        variant: "destructive",
        title: "Failed to remove document",
        description: "There was an error removing the document.",
      });
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!project || !id) return;
    
    try {
      const updatedProject = await updateTask(id, taskId, completed);
      setProject(updatedProject);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: "There was an error updating the task status.",
      });
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (!project || !id) return;
    
    try {
      const updatedProject = await removeTask(id, taskId);
      setProject(updatedProject);
      
      toast({
        title: "Task removed",
        description: "The task has been removed from the project.",
      });
    } catch (error) {
      console.error("Error removing task:", error);
      toast({
        variant: "destructive",
        title: "Failed to remove task",
        description: "There was an error removing the task.",
      });
    }
  };

  const handleAddTeamMember = async () => {
    if (!project || !id || !newTeamMember.name || !newTeamMember.email) return;
    
    try {
      const teamMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: newTeamMember.name,
        email: newTeamMember.email,
        role: newTeamMember.role,
        avatar: ""
      };
      
      const updatedProject = await addTeamMember(id, teamMember);
      setProject(updatedProject);
      
      // Reset form
      setNewTeamMember({ name: "", email: "", role: "worker" });
      setTeamMemberDialogOpen(false);
      
      toast({
        title: "Team member added",
        description: "The team member has been successfully added to the project.",
      });
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        variant: "destructive",
        title: "Failed to add team member",
        description: "There was an error adding the team member.",
      });
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!project || !id) return;
    
    try {
      const updatedProject = await removeTeamMember(id, memberId);
      setProject(updatedProject);
      
      toast({
        title: "Team member removed",
        description: "The team member has been removed from the project.",
      });
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        variant: "destructive",
        title: "Failed to remove team member",
        description: "There was an error removing the team member.",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    try {
      // Try to delete via API first
      try {
        await projectAPI.deleteProject(project.id);
      } catch (apiError) {
        console.error("API error, falling back to local service:", apiError);
        // Fallback to local service
        await deleteProject(project.id);
      }
      
      setDeleteDialogOpen(false);
      
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
      
      // Redirect to projects page
      navigate("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete project",
        description: "There was an error deleting the project.",
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Project Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                The project you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <PageContainer>
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-primary font-sans mb-2">{project.title}</h1>
        <p className="text-lg text-muted-foreground font-sans mb-4">Detailed overview and management for this project.</p>
        <div className="flex items-center gap-3 mt-1">
          <Badge className={`rounded-full px-4 py-1 text-xs font-semibold capitalize shadow-sm border flex items-center gap-1 ${getStatusColor(project.status)}`}>{project.status === 'completed' ? <Check className="inline h-3 w-3 mr-1" /> : null}{project.status}</Badge>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-full"
            onClick={() => setStatusDialogOpen(true)}
          >
            Change Status
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-extrabold text-primary font-sans">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[80px_1fr] gap-2 text-sm">
              <dt className="font-medium text-gray-500 dark:text-gray-400">Client:</dt>
              <dd>{project.client}</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Location:</dt>
              <dd>{project.address}</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Type:</dt>
              <dd>{project.description?.split(" ")[0] || "Construction"}</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Budget:</dt>
              <dd>{formatCurrency(project.budget)}</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Start Date:</dt>
              <dd>{formatDate(new Date())}</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">End Date:</dt>
              <dd>{formatDate(project.dueDate ?? new Date())}</dd>
            </dl>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3 flex justify-between items-center">
            <CardTitle className="text-xl font-extrabold text-primary font-sans">Project Team</CardTitle>
            <Button size="sm" className="rounded-full" onClick={() => setTeamMemberDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.team && project.team.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.team.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{member.role}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleRemoveTeamMember(member.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No team members assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-extrabold text-primary font-sans">Project Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
              <dt className="font-medium text-gray-500 dark:text-gray-400">Documents:</dt>
              <dd>{project.documents?.length ?? 0}</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Tasks:</dt>
              <dd>{project.tasks?.filter(task => !task.completed).length ?? 0} open</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Progress:</dt>
              <dd>{project.progress}%</dd>
              <dt className="font-medium text-gray-500 dark:text-gray-400">Due Date:</dt>
              <dd>{formatDate(project.dueDate ?? new Date())}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="documents" className="mb-10">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="mt-6">
          <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-800 bg-surface">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-3 flex justify-between items-center">
                <CardTitle className="text-lg font-extrabold text-primary font-sans">Project Documents</CardTitle>
                <Button className="rounded-full" onClick={() => setDocumentDialogOpen(true)}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </CardHeader>
              <CardContent>
                {project.documents.length > 0 ? (
                  <div className="grid gap-4">
                    {project.documents.map((doc) => (
                      <DocumentItem 
                        key={doc.id} 
                        document={doc} 
                        onRemoveDocument={handleRemoveDocument} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded for this project yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <div className="overflow-x-auto rounded-xl shadow border border-gray-200 dark:border-gray-800 bg-surface">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-3 flex justify-between items-center">
                <CardTitle className="text-lg font-extrabold text-primary font-sans">Project Tasks</CardTitle>
                <Button className="rounded-full">
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                {project.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {project.tasks.map((task: Task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggleComplete={handleToggleTask}
                        onRemoveTask={handleRemoveTask}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks created for this project yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Project Status</DialogTitle>
            <DialogDescription>
              Update the current status of this project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={(value: ProjectStatus) => setNewStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Document Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Document</DialogTitle>
            <DialogDescription>
              Upload a new document to this project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="docName">Document Name</Label>
              <Input 
                id="docName" 
                value={newDocument.name} 
                onChange={(e) => setNewDocument({...newDocument, name: e.target.value})} 
                placeholder="Enter document name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type</Label>
              <Select 
                value={newDocument.type} 
                onValueChange={(value: "bid" | "plan" | "pricing" | "other") => setNewDocument({
                  ...newDocument, 
                  type: value
                })}
              >
                <SelectTrigger id="docType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bid">Bid Document</SelectItem>
                  <SelectItem value="plan">Project Plan</SelectItem>
                  <SelectItem value="pricing">Pricing Information</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="block mb-2">Upload File</Label>
              <DocumentUpload 
                projectId={id}
                onDocumentAdded={(doc) => console.log("Document added:", doc)} 
              />
              
              {isUploading && (
                <div className="mt-4">
                  <Label className="text-xs text-gray-500">Upload Progress</Label>
                  <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDocument} disabled={!newDocument.name || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Team Member Dialog */}
      <Dialog open={teamMemberDialogOpen} onOpenChange={setTeamMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new team member to this project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberName">Name</Label>
              <Input 
                id="memberName" 
                value={newTeamMember.name} 
                onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})} 
                placeholder="Enter name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memberEmail">Email</Label>
              <Input 
                id="memberEmail" 
                type="email" 
                value={newTeamMember.email} 
                onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})} 
                placeholder="Enter email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memberRole">Role</Label>
              <Select 
                value={newTeamMember.role} 
                onValueChange={(value: "manager" | "supervisor" | "worker") => setNewTeamMember({
                  ...newTeamMember, 
                  role: value
                })}
              >
                <SelectTrigger id="memberRole">
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
            <Button variant="outline" onClick={() => setTeamMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTeamMember} 
              disabled={!newTeamMember.name || !newTeamMember.email}
            >
              Add Team Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteProject}
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default ProjectDetail;
