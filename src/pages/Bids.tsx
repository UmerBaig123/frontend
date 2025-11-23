import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Filter, 
  Search,
  Plus,
  Calendar,
  Grid3X3,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import BidCard from "@/components/bids/BidCard";
import { bidAPI, Bid } from "@/api/bids";

const Bids = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadBids();
  }, []);

    const loadBids = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bidAPI.getBids();
      console.log('Get bids result:', typeof response);
      console.log('API response for bids:', JSON.stringify(response, null, 4));
      
      // Check for bids in the response structure
      let bidsData = null;
      if (response?.bids) {
        bidsData = response.bids;
      } else if (response?.data?.bids) {
        bidsData = response.data.bids;
      } else if (response?.data && Array.isArray(response.data)) {
        bidsData = response.data;
      } else if (Array.isArray(response)) {
        bidsData = response;
      }
      
      console.log('Extracted bids data:', bidsData);
      console.log('Bids data type:', typeof bidsData);
      console.log('Bids data length:', Array.isArray(bidsData) ? bidsData.length : 'not an array');
      
      if (Array.isArray(bidsData) && bidsData.length > 0) {
        const transformedBids = bidsData.map(transformApiBid);
        console.log('Transformed bids:', transformedBids);
        setBids(transformedBids);
      } else if (Array.isArray(bidsData) && bidsData.length === 0) {
        console.log('No bids found in response');
        setBids([]);
      } else {
        console.error('Expected bids to be an array, got:', typeof bidsData);
        console.error('Full response structure:', response);
        setError('Unexpected data format from server');
      }
    } catch (error) {
      console.error('Error loading bids:', error);
      setError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  // Transform API bid data to match frontend structure
  const transformApiBid = (apiBid: any) => {
    return {
      id: apiBid._id,
      projectName: apiBid.projectName || apiBid.aiExtractedData?.projectName || 'Untitled Project',
      client: apiBid.client || apiBid.aiExtractedData?.clientName || 'Unknown Client',
      amount: apiBid.amount || apiBid.aiExtractedData?.budgetEstimates?.totalEstimatedCost || 
              (typeof apiBid.aiExtractedData?.budgetEstimates === 'string' ? 
               apiBid.aiExtractedData.budgetEstimates : null) || '0',
      status: apiBid.status?.toLowerCase() || 'pending',
      createdDate: apiBid.createdAt || new Date().toISOString(),
      dueDate: apiBid.dueDate || apiBid.aiExtractedData?.estimatedStartDate || new Date().toISOString().split('T')[0],
      description: apiBid.description || apiBid.additionalNotes || apiBid.aiExtractedData?.description || '',
      projectType: apiBid.projectType || apiBid.aiExtractedData?.projectType || 'General',
      location: apiBid.location || apiBid.aiExtractedData?.location || 'Not specified',
      documents: Array.isArray(apiBid.documents) ? apiBid.documents.length : 0,
      documentsData: Array.isArray(apiBid.documents) ? apiBid.documents : [],
      aiExtractedData: apiBid.aiExtractedData || {},
      user: apiBid.user || {},
      updatedAt: apiBid.updatedAt
    };
  };  // Filter bids based on search and status
  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bid.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteBid = async (id: string) => {
    try {
      const response = await bidAPI.deleteBid(id);
      if (response.success) {
        setBids(bids.filter(bid => bid.id !== id));
        
        // Also remove from localStorage for backward compatibility
        const localBids = bids.filter(bid => bid.id !== id);
        localStorage.setItem('bids', JSON.stringify(localBids));
        
        toast({
          title: "Bid deleted",
          description: "The bid has been removed successfully.",
        });
      } else {
        throw new Error(response.message || "Failed to delete bid");
      }
    } catch (error) {
      console.error('Failed to delete bid:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete bid",
        variant: "destructive"
      });
    }
  };

  const handleDownloadBid = (id: string) => {
    const bid = bids.find(b => b.id === id);
    
    if (!bid) return;
    
    // In a real application, this would generate and download a PDF
    toast({
      title: "Downloading bid",
      description: "Your bid PDF is being generated and will download shortly.",
    });
    
    // Simulate PDF generation delay
    setTimeout(() => {
      toast({
        title: "Download complete",
        description: `Bid for ${bid.projectName} has been downloaded.`,
      });
    }, 2000);
  };
  
  const handleEditBid = (bid: Bid) => {
    setEditingBid({...bid});
  };

  const handleUpdateBid = async (updatedBid: Bid) => {
    try {
      const response = await bidAPI.updateBid(updatedBid.id, {
        projectName: updatedBid.projectName,
        client: updatedBid.client,
        amount: updatedBid.amount,
        description: updatedBid.description,
        location: updatedBid.location,
        status: updatedBid.status
      });

      if (response.success && response.bid) {
        setBids(bids.map(bid => bid.id === updatedBid.id ? response.bid! : bid));
        
        // Also update localStorage for backward compatibility
        const updatedLocalBids = bids.map(bid => 
          bid.id === updatedBid.id ? response.bid! : bid
        );
        localStorage.setItem('bids', JSON.stringify(updatedLocalBids));
        
        toast({
          title: "Bid updated",
          description: "The bid has been updated successfully.",
        });
        setEditingBid(null);
      } else {
        throw new Error(response.message || "Failed to update bid");
      }
    } catch (error) {
      console.error('Failed to update bid:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bid",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updatedBids = bids.map(bid => 
      bid.id === id ? {...bid, status: newStatus} : bid
    );
    
    setBids(updatedBids);
    localStorage.setItem('bids', JSON.stringify(updatedBids));
    
    toast({
      title: "Status updated",
      description: `Bid status has been changed to ${newStatus}.`,
    });
  };

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-primary font-sans">Bids</h1>
          <p className="text-base text-muted-foreground font-sans">Manage and track all your project bids</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/generate-bid">
            <Button className="bg-bidgenius-600 hover:bg-bidgenius-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Generate New Bid
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bid Summary</CardTitle>
          <CardDescription>Overview of your demolition bid statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col p-4 bg-bidgenius-50 dark:bg-gray-800/30 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Total Active Bids</span>
                <span className="text-3xl font-bold">{bids.filter(b => b.status === "pending").length}</span>
              </div>
              <div className="flex flex-col p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Approved Bids</span>
                <span className="text-3xl font-bold">{bids.filter(b => b.status === "approved").length}</span>
              </div>
              <div className="flex flex-col p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Rejected Bids</span>
                <span className="text-3xl font-bold">{bids.filter(b => b.status === "denied").length}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-extrabold text-primary mb-2">All Bids</CardTitle>
              <CardDescription>View and manage all your project bids</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                disabled={loading}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                disabled={loading}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bids by project or client..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading bids...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <FileText className="h-12 w-12 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Error loading bids
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {error}
              </p>
              <Button onClick={loadBids} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredBids.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredBids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onEdit={handleEditBid}
                  onDelete={handleDeleteBid}
                  onDownload={handleDownloadBid}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No bids found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No bids match your search criteria" 
                  : bids.length === 0 
                    ? "No bids available. Get started by creating your first bid."
                    : "No bids match your current filters"
                }
              </p>
              {bids.length === 0 && !searchTerm && statusFilter === "all" && (
                <Button asChild>
                  <Link to="/generate-bid">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Bid
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Bid Dialog */}
      <Dialog open={!!editingBid} onOpenChange={() => setEditingBid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bid</DialogTitle>
            <DialogDescription>
              Make changes to the bid details
            </DialogDescription>
          </DialogHeader>
          {editingBid && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project-name">Project Name</Label>
                <Input 
                  id="edit-project-name" 
                  value={editingBid.projectName}
                  onChange={(e) => setEditingBid({...editingBid, projectName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client">Client</Label>
                <Input 
                  id="edit-client" 
                  value={editingBid.client}
                  onChange={(e) => setEditingBid({...editingBid, client: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Bid Amount</Label>
                <Input 
                  id="edit-amount" 
                  value={editingBid.amount.replace(/[^0-9.]/g, '')}
                  onChange={(e) => setEditingBid({...editingBid, amount: `$${e.target.value}`})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  value={editingBid.description || ''}
                  onChange={(e) => setEditingBid({...editingBid, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingBid.status} 
                  onValueChange={(value) => setEditingBid({...editingBid, status: value})}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={() => editingBid && handleUpdateBid(editingBid)}>Save Changes</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Bids;
