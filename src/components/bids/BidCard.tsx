import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, FileText, Download, Edit, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Bid {
  id: string;
  projectName: string;
  client: string;
  createdDate: string;
  amount: string;
  status: string;
  description?: string;
  documents?: number;
}

interface BidCardProps {
  bid: Bid;
  onEdit?: (bid: Bid) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const BidCard = ({ bid, onEdit, onDelete, onDownload, onStatusChange }: BidCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "denied":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "denied":
        return "Denied";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "denied":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Format date safely
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(bid.id, newStatus);
    }
  };

  return (
    <Card className="bg-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 h-full hover:shadow-xl transition-shadow">
      <CardContent className="pt-6 pb-4 px-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-extrabold text-xl text-text line-clamp-2 flex-1 mr-4">{bid.projectName}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`p-0 h-auto ${getStatusColor(bid.status)} text-white hover:opacity-80`}
              >
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold capitalize border-0">
                  {getStatusIcon(bid.status)}
                  <span className="ml-2">{getStatusText(bid.status)}</span>
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
                <Clock className="mr-2 h-4 w-4" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("denied")}>
                <XCircle className="mr-2 h-4 w-4" />
                Denied
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {bid.description && (
          <p className="text-base text-muted-foreground mb-5 line-clamp-2">
            {bid.description}
          </p>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-5 w-5 mr-2 text-accent" />
            <span className="font-semibold">${parseInt(bid.amount).toLocaleString()}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-5 w-5 mr-2 text-accent" />
            <span>Created: {formatDate(bid.createdDate)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <User className="h-5 w-5 mr-2 text-accent" />
            <span className="truncate">{bid.client}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <FileText className="h-5 w-5 mr-2 text-accent" />
            <span>{bid.documents || 0} documents</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center w-full">
          <Link 
            to={`/bids/${bid.id}`}
            className="text-sm text-primary hover:text-accent font-medium"
          >
            View Details
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-ellipsis-vertical h-4 w-4">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload?.(bid.id)}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(bid)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Bid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(bid.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Bid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BidCard; 