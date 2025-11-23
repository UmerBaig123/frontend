import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, MapPin, CheckSquare, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { Project } from "@/types/project";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500 hover:bg-blue-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  // Count completed tasks
  const completedTasks = project.tasks?.filter(task => task.completed).length || 0;
  const totalTasks = project.tasks?.length || 0;

  // Format date safely
  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };
  
  return (
    <Link 
      to={`/projects/${project.id}`} 
      className="block hover:opacity-95 transition-opacity"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault(); // Prevent navigation if we have an onClick handler
          onClick();
        }
      }}
    >
      <Card className="bg-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 h-full hover:shadow-xl transition-shadow">
        <CardContent className="pt-8 pb-4 px-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-extrabold text-xl text-text line-clamp-2">{project.title}</h3>
            <Badge className={`rounded-full px-4 py-1 text-xs font-semibold capitalize ${getStatusColor(project.status)}`}>{project.status}</Badge>
          </div>
          <p className="text-base text-muted-foreground mb-5 line-clamp-2">
            {project.description}
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-5 w-5 mr-2 text-accent" />
              <span>{formatCurrency(project.budget)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-5 w-5 mr-2 text-accent" />
              <span>Due: {formatDate(project.dueDate)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-5 w-5 mr-2 text-accent" />
              <span className="truncate">{project.address}</span>
            </div>
            {project.tasks && project.tasks.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <CheckSquare className="h-5 w-5 mr-2 text-accent" />
                <span>{completedTasks} of {totalTasks} tasks completed</span>
              </div>
            )}
            {project.team && project.team.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="h-5 w-5 mr-2 text-accent" />
                <span>{project.team.length} team members</span>
              </div>
            )}
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium text-muted-foreground">Progress</span>
              <span className="font-semibold text-text">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2 bg-accent/20" />
          </div>
        </CardContent>
        <CardFooter className="pt-2 pb-4 px-6 border-t border-gray-100 dark:border-gray-800">
          <div className="w-full text-sm text-muted-foreground">
            Client: <span className="font-semibold text-text">{project.client}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
