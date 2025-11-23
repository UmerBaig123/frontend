 
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, BarChart2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { projectsAPI, ProjectSummary } from "@/api/projects";

const ProjectsList = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await projectsAPI.getRecentProjects(4);
        setProjects(data);
      } catch (e) {
        console.error("Error loading projects:", e);
        toast({
          variant: "destructive",
          title: "Error loading projects",
          description: "Unable to load recent projects. Please refresh the page."
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatCurrency = (value?: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-bidgenius-600" />
            Recent Projects
          </div>
          <Link to="/projects" className="text-sm text-bidgenius-600 hover:text-bidgenius-700 flex items-center">
            See all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.client || '-'}</TableCell>
                    <TableCell>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(project.status || '')}>
                        {(project.status || 'active').charAt(0).toUpperCase() + (project.status || 'active').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(project.budget)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/projects/${project.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No projects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsList;
