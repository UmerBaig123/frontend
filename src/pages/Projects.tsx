import React, { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, ArrowUpDown, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import ProjectCard from "@/components/projects/ProjectCard";
import { Project, ProjectStatus } from "@/types/project";
import { projectAPI } from "@/api/projects";
import { useToast } from "@/hooks/use-toast";

// Transform API project to frontend project structure
const transformApiProject = (apiProject: any): Project => {
  console.log('Transforming project:', apiProject);
  
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
    console.error('Error transforming project:', error, apiProject);
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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "budget" | "title">("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        console.log("Loading projects from API...");
        const response = await projectAPI.getProjects();
        console.log("API response:", response);
        
        if (response.success && response.data) {
          console.log("Successfully loaded projects from API:", response.data);
          // Transform API projects to frontend structure
          const transformedProjects = response.data.map(transformApiProject);
          console.log("Transformed projects:", transformedProjects);
          setProjects(transformedProjects);
        } else if (Array.isArray(response)) {
          // Handle case where API returns array directly
          console.log("API returned direct array:", response);
          const transformedProjects = response.map(transformApiProject);
          console.log("Transformed projects:", transformedProjects);
          setProjects(transformedProjects);
        } else {
          console.log("API response was not successful or no projects found");
          setProjects([]);
        }
      } catch (error) {
        console.error("Error loading projects from API:", error);
        
        // Try to load from localStorage as fallback, but don't use demo data
        try {
          const storedProjects = localStorage.getItem('projects');
          if (storedProjects) {
            const parsedProjects = JSON.parse(storedProjects);
            const validProjects = parsedProjects.map(transformApiProject);
            console.log("Loaded projects from localStorage:", validProjects);
            setProjects(validProjects);
          } else {
            console.log("No projects in localStorage either");
            setProjects([]);
          }
        } catch (localError) {
          console.error("Error loading from localStorage:", localError);
          setProjects([]);
        }
        
        toast({
          title: "Connection issue",
          description: "Could not load projects from server. Showing local data if available.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProjects();
    
    window.addEventListener('storage', loadProjects);
    
    return () => {
      window.removeEventListener('storage', loadProjects);
    };
  }, [toast]);

  const filteredProjects = projects
    .filter(project => 
      (statusFilter === "all" || project.status === statusFilter) &&
      (project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
       project.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "budget") {
        return sortDirection === "asc" ? a.budget - b.budget : b.budget - a.budget;
      } else {
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

  const handleSort = (field: "dueDate" | "budget" | "title") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary font-sans mb-1">Projects</h1>
          <p className="text-base text-muted-foreground font-sans">
            Manage and track all your construction projects
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button asChild>
            <Link to="/new-project">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => handleSort("title")}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Name {sortBy === "title" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
              <Button 
                variant="outline"
                className="flex items-center"
                onClick={() => handleSort("dueDate")}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Due Date {sortBy === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
              <Button 
                variant="outline"
                className="flex items-center"
                onClick={() => handleSort("budget")}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Budget {sortBy === "budget" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={statusFilter === "active" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("active")}
              className={statusFilter === "active" ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              Active
            </Button>
            <Button 
              variant={statusFilter === "pending" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              Pending
            </Button>
            <Button 
              variant={statusFilter === "completed" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("completed")}
              className={statusFilter === "completed" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Loading projects...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              {projects.length === 0 ? (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No projects found.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    Get started by creating your first project.
                  </p>
                  <Button asChild>
                    <Link to="/new-project">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Project
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No projects found matching your criteria.</p>
              )}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default Projects;
