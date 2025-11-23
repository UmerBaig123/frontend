import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  X,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { bidAPI, Bid, BidDocument, BidDetails, BidItem, DemolitionItem } from "@/api/bids";
import { totalProposedAmountAPI, TotalProposedAmountResponse } from "@/api/totalProposedAmount";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BidDataEntry from "@/components/bids/BidDataEntry";

const BidDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [bid, setBid] = useState<Bid | null>(null);
  const [bidDetails, setBidDetails] = useState<BidDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [demolitionItems, setDemolitionItems] = useState<BidItem[]>([]); // Changed to BidItem[] since getDemolitionItems now returns BidItem[]
  const [loadingDemolition, setLoadingDemolition] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [editingDemolitionId, setEditingDemolitionId] = useState<string | null>(null);
  const [editingDemolitionData, setEditingDemolitionData] = useState<{
    name: string;
    measurement: string;
    price: string;
    proposedBid: string;
    notes: string;
  }>({
    name: '',
    measurement: '',
    price: '',
    proposedBid: '',
    notes: ''
  });
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateDataRef = useRef<BidItem[]>([]);
  const [manualItems, setManualItems] = useState<BidItem[]>([]);
  
  // Total Proposed Amount state management
  const [totalProposedAmount, setTotalProposedAmount] = useState<number>(0);
  const [totalProposedAmountLoading, setTotalProposedAmountLoading] = useState(false);
  const [totalProposedAmountError, setTotalProposedAmountError] = useState<string | null>(null);
  const totalProposedAmountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      loadBid(id);
      loadBidDetails(id);
      loadTotalProposedAmount(id);
      // Note: loadDemolitionItems is now integrated into loadBidDetails
    }
  }, [id]);

  const loadDemolitionItems = async (bidId: string) => {
    setLoadingDemolition(true);
    try {
      const items = await bidAPI.getDemolitionItems(bidId); // Now returns BidItem[] format
      setDemolitionItems(items);
    } catch (error) {
      console.error("Error loading demolition items:", error);
    } finally {
      setLoadingDemolition(false);
    }
  };

  const loadBidDetails = async (bidId: string) => {
    try {
      const details = await bidAPI.getBidDetails(bidId);
      setBidDetails(details);
      
      // Set bid items from AI extracted data or existing items
      const regularItems = details.items || details.aiExtractedData?.extractedItems || details.aiExtractedData?.budgetEstimates?.breakdown || [];
      
      // Load demolition items - they now come back as BidItem[] format ready for the data sheet
      try {
        const demolitionData = await bidAPI.getDemolitionItems(bidId);
        console.log('🔍 Loaded demolition data:', demolitionData);
        console.log('🔍 First demolition item structure:', demolitionData[0]);
        setDemolitionItems(demolitionData); // demolitionData is already in BidItem[] format
        
      } catch (demolitionError) {
        console.error("Error loading demolition items in bid details:", demolitionError);
      }
    } catch (error) {
      console.error("Error loading bid details:", error);
    }
  };

  const loadBid = async (bidId: string) => {
    setLoading(true);
    try {
      console.log("Loading bid from API with ID:", bidId);
      const response = await bidAPI.getBidById(bidId);
      console.log("API response for bid:", response);
      
      if (response.success && response.bid) {
        console.log("Successfully loaded bid from API:", response.bid);
        const transformedBid = transformApiBid(response.bid);
        setBid(transformedBid);
      } else if (response._id || response.id) {
        // Handle case where API returns bid directly
        console.log("API returned bid directly:", response);
        const transformedBid = transformApiBid(response);
        setBid(transformedBid);
      } else {
        console.log("API response was not successful or no bid found");
        // Fallback to localStorage for backward compatibility
        const storedBids = localStorage.getItem('bids');
        if (storedBids) {
          const bids = JSON.parse(storedBids);
          const foundBid = bids.find((b: any) => b.id.toString() === bidId);
          if (foundBid) {
            const transformedBid = transformApiBid(foundBid);
            setBid(transformedBid);
          } else {
            toast({
              title: "Bid not found",
              description: "The requested bid could not be found.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Bid not found",
            description: "The requested bid could not be found.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error loading bid:", error);
      toast({
        title: "Error",
        description: "Failed to load bid details.",
        variant: "destructive"
      });
      
      // Fallback to localStorage
      try {
        const storedBids = localStorage.getItem('bids');
        if (storedBids) {
          const bids = JSON.parse(storedBids);
          const foundBid = bids.find((b: any) => b.id.toString() === bidId);
          if (foundBid) {
            const transformedBid = transformApiBid(foundBid);
            setBid(transformedBid);
          }
        }
      } catch (localError) {
        console.error("Error loading from localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load total proposed amount from API
  const loadTotalProposedAmount = async (bidId: string) => {
    setTotalProposedAmountLoading(true);
    setTotalProposedAmountError(null);
    
    try {
      const response = await totalProposedAmountAPI.getTotalProposedAmount(bidId);
      if (response.success && response.data) {
        setTotalProposedAmount(response.data.totalProposedAmount);
        console.log('Loaded total proposed amount:', response.data.totalProposedAmount);
      } else {
        // If no saved total, calculate from current items
        calculateAndSetTotalProposedAmount();
      }
    } catch (error) {
      console.error('Error loading total proposed amount:', error);
      setTotalProposedAmountError('Failed to load total proposed amount');
      // Fallback to calculating from current items
      calculateAndSetTotalProposedAmount();
    } finally {
      setTotalProposedAmountLoading(false);
    }
  };

  // Calculate total proposed amount from current items
  const calculateAndSetTotalProposedAmount = () => {
    const calculatedTotal = totalProposedAmountAPI.calculateTotalFromItems(
      demolitionItems, 
      manualItems, 
      getItemProposedBid
    );
    setTotalProposedAmount(calculatedTotal);
    console.log('Calculated total proposed amount:', calculatedTotal);
  };

  // Save total proposed amount to API with debouncing
  const saveTotalProposedAmount = useCallback(async (bidId: string, amount: number, source: 'manual' | 'calculated' | 'api' = 'calculated') => {
    // Clear existing timeout
    if (totalProposedAmountTimeoutRef.current) {
      clearTimeout(totalProposedAmountTimeoutRef.current);
    }

    // Set new timeout for debounced save
    totalProposedAmountTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await totalProposedAmountAPI.setTotalProposedAmount(bidId, {
          totalProposedAmount: amount,
          source,
          notes: `Auto-saved from ${source} calculation`
        });
        
        if (response.success) {
          console.log('Total proposed amount saved successfully:', amount);
          setTotalProposedAmountError(null);
        } else {
          throw new Error(response.message || 'Failed to save total proposed amount');
        }
      } catch (error) {
        console.error('Error saving total proposed amount:', error);
        setTotalProposedAmountError('Failed to save total proposed amount');
        toast({
          title: "Save Error",
          description: "Failed to save total proposed amount. Please try again.",
          variant: "destructive"
        });
      }
    }, 1000); // 1 second debounce
  }, []);

  // Effect to recalculate and save total when items change
  useEffect(() => {
    if (id && (demolitionItems.length > 0 || manualItems.length > 0)) {
      const newTotal = totalProposedAmountAPI.calculateTotalFromItems(
        demolitionItems, 
        manualItems, 
        getItemProposedBid
      );
      
      if (newTotal !== totalProposedAmount) {
        setTotalProposedAmount(newTotal);
        saveTotalProposedAmount(id, newTotal, 'calculated');
      }
    }
  }, [demolitionItems, manualItems, id, saveTotalProposedAmount, totalProposedAmount]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (totalProposedAmountTimeoutRef.current) {
        clearTimeout(totalProposedAmountTimeoutRef.current);
      }
    };
  }, []);

  // Transform API bid to frontend bid structure
  const transformApiBid = (apiBid: any): Bid => {
    console.log('Transforming individual bid:', apiBid);
    
    try {
      return {
        id: apiBid._id || apiBid.id || '',
        projectName: apiBid.projectName || apiBid.aiExtractedData?.projectName || 'Untitled Project',
        client: apiBid.client || apiBid.aiExtractedData?.clientName || 'Unknown Client',
        createdDate: apiBid.createdAt || new Date().toISOString(),
        amount: String(apiBid.amount || apiBid.aiExtractedData?.budgetEstimates?.totalEstimatedCost || 0),
        status: (apiBid.status?.toLowerCase() as any) || 'pending',
        description: apiBid.description || apiBid.additionalNotes || apiBid.aiExtractedData?.description || '',
        documents: Array.isArray(apiBid.documents) ? apiBid.documents.length : 0,
        documentsData: Array.isArray(apiBid.documents) ? apiBid.documents : [],
        location: apiBid.location || apiBid.aiExtractedData?.location || 'Not specified',
        dueDate: apiBid.dueDate || apiBid.aiExtractedData?.estimatedStartDate || '',
        userId: apiBid.user?._id || ''
      };
    } catch (error) {
      console.error('Error transforming individual bid:', error, apiBid);
      throw error;
    }
  };

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

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!bid) return;

    try {
      // Update via API
      await bidAPI.updateBid(bid.id, { status: newStatus as any });
      
      // Update local state
      const updatedBid = { ...bid, status: newStatus as 'pending' | 'approved' | 'denied' };
      setBid(updatedBid);

      // Update in localStorage for backward compatibility
      const storedBids = localStorage.getItem('bids');
      if (storedBids) {
        const bids = JSON.parse(storedBids);
        const updatedBids = bids.map((b: Bid) => 
          b.id === bid.id ? updatedBid : b
        );
        localStorage.setItem('bids', JSON.stringify(updatedBids));
      }

      toast({
        title: "Status updated",
        description: `Bid status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating bid status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update bid status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadBid = async () => {
    if (!bid) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Your bid PDF is being generated...",
      });

      const blob = await bidAPI.downloadBidDocument(bid.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${bid.projectName}_bid.pdf`;
      
      // Trigger download
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download complete",
        description: `Bid PDF for ${bid.projectName} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading bid PDF:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the bid PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);


  // Helper function to get the correct price value from item
  const getItemPrice = (item: BidItem): number => {
    // Check multiple possible price fields in order of priority
    // Priority 1: calculatedTotalPrice (most accurate)
    if ((item as any).calculatedTotalPrice && !isNaN(Number((item as any).calculatedTotalPrice))) {
      return Number((item as any).calculatedTotalPrice);
    }
    // Priority 2: calculatedUnitPrice
    if ((item as any).calculatedUnitPrice && !isNaN(Number((item as any).calculatedUnitPrice))) {
      return Number((item as any).calculatedUnitPrice);
    }
    // Priority 3: priceCalculation.totalPrice
    if ((item as any).priceCalculation?.totalPrice && !isNaN(Number((item as any).priceCalculation.totalPrice))) {
      return Number((item as any).priceCalculation.totalPrice);
    }
    // Priority 4: priceCalculation.unitPrice
    if ((item as any).priceCalculation?.unitPrice && !isNaN(Number((item as any).priceCalculation.unitPrice))) {
      return Number((item as any).priceCalculation.unitPrice);
    }
    // Priority 5: pricing field
    if (item.pricing && !isNaN(Number(item.pricing))) return Number(item.pricing);
    // Priority 6: price field
    if (item.price && !isNaN(Number(item.price))) return Number(item.price);
    // Priority 7: unitPrice
    if ((item as any).unitPrice && !isNaN(Number((item as any).unitPrice))) return Number((item as any).unitPrice);
    // Priority 8: totalPrice
    if ((item as any).totalPrice && !isNaN(Number((item as any).totalPrice))) return Number((item as any).totalPrice);
    return 0;
  };

  // Helper function to get the correct proposed bid value from item
  const getItemProposedBid = (item: BidItem): number => {
    // Check multiple possible proposed bid fields in order of priority
    // Priority 1: proposedBid (user input)
    if (item.proposedBid && !isNaN(Number(item.proposedBid))) return Number(item.proposedBid);
    // Priority 2: calculatedTotalPrice (calculated value)
    if ((item as any).calculatedTotalPrice && !isNaN(Number((item as any).calculatedTotalPrice))) {
      return Number((item as any).calculatedTotalPrice);
    }
    // Priority 3: priceCalculation.totalPrice
    if ((item as any).priceCalculation?.totalPrice && !isNaN(Number((item as any).priceCalculation.totalPrice))) {
      return Number((item as any).priceCalculation.totalPrice);
    }
    // Priority 4: totalPrice
    if ((item as any).totalPrice && !isNaN(Number((item as any).totalPrice))) return Number((item as any).totalPrice);
    // Priority 5: pricing field
    if (item.pricing && !isNaN(Number(item.pricing))) return Number(item.pricing);
    // Priority 6: price field
    if (item.price && !isNaN(Number(item.price))) return Number(item.price);
    return 0;
  };

  // Helper function to get the calculated total price specifically
  const getCalculatedTotalPrice = (item: BidItem): number => {
    // console.log('🔍 Getting calculated total price for item:', item);
    // console.log('🔍 Item calculatedTotalPrice:', (item as any).calculatedTotalPrice);
    
    if ((item as any).calculatedTotalPrice && !isNaN(Number((item as any).calculatedTotalPrice))) {
      const value = Number((item as any).calculatedTotalPrice);
      // console.log('✅ Found calculatedTotalPrice:', value);
      return value;
    }
    
    // Fallback to priceCalculation.totalPrice
    if ((item as any).priceCalculation?.totalPrice && !isNaN(Number((item as any).priceCalculation.totalPrice))) {
      const value = Number((item as any).priceCalculation.totalPrice);
      console.log('✅ Found priceCalculation.totalPrice:', value);
      return value;
    }
    
    console.log('❌ No calculated total price found');
    return 0;
  };

  // Helper function to get the calculated unit price
  const getCalculatedUnitPrice = (item: BidItem): number => {
    console.log('🔍 Getting calculated unit price for item:', item);
    console.log('🔍 Item calculatedUnitPrice:', (item as any).calculatedUnitPrice);
    
    if ((item as any).calculatedUnitPrice && !isNaN(Number((item as any).calculatedUnitPrice))) {
      const value = Number((item as any).calculatedUnitPrice);
      // console.log('✅ Found calculatedUnitPrice:', value);
      return value;
    }
    
    // Fallback to priceCalculation.unitPrice
    if ((item as any).priceCalculation?.unitPrice && !isNaN(Number((item as any).priceCalculation.unitPrice))) {
      const value = Number((item as any).priceCalculation.unitPrice);
      console.log('✅ Found priceCalculation.unitPrice:', value);
      return value;
    }
    
    console.log('❌ No calculated unit price found');
    return 0;
  };

  // Demolition item editing functions
  const startEditingDemolition = (item: BidItem) => {
    console.log('🔧 Starting to edit demolition item:', item.id);
    setEditingDemolitionId(item.id);
    setEditingDemolitionData({
      name: item.name || '',
      measurement: item.measurement || '',
      // Use calculated unit price explicitly for the Unit Price field
      price: String(getCalculatedUnitPrice(item) || 0),
      // Proposed Bid remains the total/proposed amount
      proposedBid: String(getItemProposedBid(item) || 0),
      notes: item.notes || ''
    });
  };

  const cancelEditingDemolition = () => {
    console.log('❌ Cancelling demolition item edit');
    setEditingDemolitionId(null);
    setEditingDemolitionData({
      name: '',
      measurement: '',
      price: '',
      proposedBid: '',
      notes: ''
    });
  };

  const saveDemolitionEdit = async () => {
    if (!editingDemolitionId || !bid) {
      console.error('No editing ID or bid found');
      return;
    }

    // Validate required fields
    if (!editingDemolitionData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    if (!editingDemolitionData.measurement.trim()) {
      toast({
        title: "Validation Error",
        description: "Measurement is required",
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(editingDemolitionData.price);
    const proposedBid = parseFloat(editingDemolitionData.proposedBid);

    if (isNaN(price) || price < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(proposedBid) || proposedBid < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid proposed bid",
        variant: "destructive"
      });
      return;
    }

    console.log('💾 Saving demolition item edit:', editingDemolitionId);

    try {
      // Prepare the update data with proper field mapping
      const updateData = {
        name: editingDemolitionData.name.trim(),
        measurement: editingDemolitionData.measurement.trim(),
        price: price,
        proposedBid: proposedBid,
        pricing: price, // Keep pricing as number to match BidItem interface
        notes: editingDemolitionData.notes.trim(),
        // Include calculated fields for backend processing
        calculatedUnitPrice: price,
        calculatedTotalPrice: proposedBid, // Use proposedBid as the calculated total
        unitPrice: price,
        totalPrice: proposedBid
      };

      console.log('📦 Update data prepared:', updateData);

      // Update the item via API
      await bidAPI.updateDemolitionItem(bid.id, editingDemolitionId, updateData);

      // Refresh demolition items from backend to ensure we get the latest saved data
      try {
        console.log('🔄 Refreshing demolition items after update...');
        const refreshedDemolitionItems = await bidAPI.getDemolitionItems(bid.id);
        console.log('✅ Refreshed demolition items:', refreshedDemolitionItems);
        
        setDemolitionItems(refreshedDemolitionItems);
        
      } catch (refreshError) {
        console.error('❌ Error refreshing demolition items after update:', refreshError);
        // Fallback to local state update if refresh fails
        setDemolitionItems(prev => prev.map(item =>
          item.id === editingDemolitionId
            ? { ...item, ...updateData }
            : item
        ));
      }

      toast({
        title: "Item Updated",
        description: "Demolition item has been updated successfully.",
      });

      // Clear editing state
      cancelEditingDemolition();

    } catch (error) {
      console.error('Error updating demolition item:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update demolition item. Please try again.",
        variant: "destructive"
      });
    }
  };





  const handleDownloadDocument = async (doc: BidDocument) => {
    try {
      // Create a temporary anchor element to trigger download
      const response = await fetch(doc.url);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = doc.originalName || 'document';
      
      // Append to body, click, and remove
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `Downloading ${doc.originalName}...`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the document. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle individual proposed bid updates for demolition items
  const handleUpdateItemProposedBid = async (itemId: string, newProposedBid: number) => {
    if (!bid) return;
    
    try {
      // Update via API - use the existing updateDemolitionItem method
      await bidAPI.updateDemolitionItem(bid.id, itemId, { proposedBid: newProposedBid });
      
      // Update local state
      setDemolitionItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              proposedBid: newProposedBid,
              calculatedTotalPrice: newProposedBid,
              totalPrice: String(newProposedBid)
            }
          : item
      ));
      
      
      toast({
        title: "Proposed bid updated",
        description: `Proposed bid updated to $${newProposedBid.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Error updating item proposed bid:", error);
      toast({
        title: "Update failed",
        description: "Failed to update proposed bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading bid details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!bid) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Bid not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The requested bid could not be found.
          </p>
          <Link to="/bids">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bids
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }



  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/bids">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bids
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-primary font-sans">{bid.projectName}</h1>
            <p className="text-base text-muted-foreground font-sans">
              Bid details and management
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={`p-0 h-auto ${getStatusColor(bid.status)} text-white hover:opacity-80`}
            >
              <Badge className="rounded-full px-4 py-2 text-sm font-semibold capitalize border-0">
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

      {/* Bid Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bid Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-accent" />
              <span className="font-medium">Client:</span>
              <span className="ml-2">{bid.client}</span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-2 text-accent" />
              <span className="font-medium">Original Amount:</span>
              <span className="ml-2 font-semibold">${parseInt(bid.amount).toLocaleString()}</span>
            </div>
            {demolitionItems.length > 0 && (
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Total Proposed:</span>
                <span className="ml-2 font-bold text-green-600">
                  ${totalProposedAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-accent" />
              <span className="font-medium">Created:</span>
              <span className="ml-2">{formatDate(bid.createdDate)}</span>
            </div>
            {bid.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-accent" />
                <span className="font-medium">Location:</span>
                <span className="ml-2">{bid.location}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-accent" />
                <span className="text-2xl font-bold">{bid.documents || 0}</span>
                <span className="ml-2 text-sm text-muted-foreground">documents</span>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {/* Document List */}
            {bid.documentsData && bid.documentsData.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Uploaded Files:</h4>
                {bid.documentsData.map((doc, index) => (
                  <div key={doc._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{doc.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.mimeType} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadDocument(doc)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleDownloadBid} className="w-full" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Bid
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Extracted Data Section */}
      {bidDetails?.aiExtractedData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">AI Extracted Information</CardTitle>
            <CardDescription>
              Information automatically extracted from uploaded documents. Demolition items are integrated into the Bid Data Sheet below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bidDetails.aiExtractedData.projectName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                  <p className="text-sm">{bidDetails.aiExtractedData.projectName}</p>
                </div>
              )}
              {bidDetails.aiExtractedData.clientName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-sm">{bidDetails.aiExtractedData.clientName}</p>
                </div>
              )}
              {bidDetails.aiExtractedData.location && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-sm">{bidDetails.aiExtractedData.location}</p>
                </div>
              )}
              {bidDetails.aiExtractedData.budgetEstimates?.totalEstimatedCost && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Cost</label>
                  <p className="text-sm font-semibold">${bidDetails.aiExtractedData.budgetEstimates.totalEstimatedCost.toLocaleString()}</p>
                </div>
              )}
            </div>
            {bidDetails.aiExtractedData.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1">{bidDetails.aiExtractedData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price Sheet Section */}
      {([...(demolitionItems || []), ...(manualItems || [])].length > 0) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Price Sheet</CardTitle>
            <CardDescription>
              Detailed breakdown of items and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Measurement</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Calculated Total</TableHead>
                    <TableHead>Proposed Bid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Combined Items (Demolition + Manual) */}
                  {[...demolitionItems, ...manualItems].map((item, index) => (
                    <TableRow key={`demolition-${item.id || index}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {((item as any)?.pricesheetMatch && (item as any).pricesheetMatch.matched === false) && (
                            <span className="inline-flex items-center text-xs text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 mr-1">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 6a1 1 0 012 0v5a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                              </svg>
                              No Pricesheet Match
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.measurement || '-'}</TableCell>
                      <TableCell>
                        ${getCalculatedUnitPrice(item).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${getCalculatedTotalPrice(item).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${getItemProposedBid(item).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  <TableRow className="border-t-2 border-primary/20">
                    <TableCell colSpan={4} className="font-bold text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>Total Proposed Amount:</span>
                        {totalProposedAmountLoading && (
                          <span className="text-xs text-muted-foreground">(Loading...)</span>
                        )}
                        {totalProposedAmountError && (
                          <span className="text-xs text-red-500">(Error: {totalProposedAmountError})</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => id && loadTotalProposedAmount(id)}
                          disabled={totalProposedAmountLoading}
                          className="h-6 w-6 p-0"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      ${totalProposedAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            {loadingDemolition && (
              <div className="mt-4 text-sm text-muted-foreground">
                Loading latest demolition items...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {demolitionItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Demolition Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Count:</span>
                  <span className="font-semibold">{demolitionItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Value:</span>
                  <span className="font-semibold">
                    ${totalProposedAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Project Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Items:</span>
                  <span className="font-semibold">{demolitionItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Grand Total:</span>
                  <span className="text-lg font-bold text-primary">
                    ${totalProposedAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Section - Remove this after testing */}
      {/* {demolitionItems.length > 0 && (
        <Card className="mb-4 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Debug: Demolition Item Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(demolitionItems[0], null, 2)}
            </pre>
          </CardContent>
        </Card>
      )} */}

      {/* Demolition Items Management */}
      {demolitionItems.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Demolition Items Management</CardTitle>
            <CardDescription>
              Manage and update individual demolition items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demolitionItems.map((item, index) => (
                <div key={item.id || index} className="border rounded-lg p-4">
                  {editingDemolitionId === item.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={editingDemolitionData.name}
                            onChange={(e) => setEditingDemolitionData(prev => ({ 
                              ...prev, 
                              name: e.target.value 
                            }))}
                            placeholder="Enter item name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Measurement <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={editingDemolitionData.measurement}
                            onChange={(e) => setEditingDemolitionData(prev => ({ 
                              ...prev, 
                              measurement: e.target.value 
                            }))}
                            placeholder="Enter measurement"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Unit Price
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingDemolitionData.price}
                            onChange={(e) => setEditingDemolitionData(prev => ({ 
                              ...prev, 
                              price: e.target.value 
                            }))}
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Proposed Bid <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingDemolitionData.proposedBid}
                            onChange={(e) => setEditingDemolitionData(prev => ({ 
                              ...prev, 
                              proposedBid: e.target.value 
                            }))}
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      {/* Show calculated values */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Calculated Values</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Calculated Unit Price</label>
                            <p className="text-sm font-medium">${getCalculatedUnitPrice(demolitionItems.find(item => item.id === editingDemolitionId) || {} as BidItem).toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Calculated Total Price</label>
                            <p className="text-sm font-semibold text-green-600">${getCalculatedTotalPrice(demolitionItems.find(item => item.id === editingDemolitionId) || {} as BidItem).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                        <Textarea
                          value={editingDemolitionData.notes}
                          onChange={(e) => setEditingDemolitionData(prev => ({ 
                            ...prev, 
                            notes: e.target.value 
                          }))}
                          placeholder="Optional notes"
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-3 border-t">
                        <Button
                          size="sm"
                          onClick={saveDemolitionEdit}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditingDemolition}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <span>{item.name}</span>
                          {((item as any)?.pricesheetMatch && (item as any).pricesheetMatch.matched === false) && (
                            <span className="inline-flex items-center text-xs text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 mr-1">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 6a1 1 0 012 0v5a1 1 0 11-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                              </svg>
                              Enter price
                            </span>
                          )}
                        </h4>
                        <span className="text-sm text-muted-foreground">{item.measurement || '—'}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                          <p className="text-sm">
                            ${getCalculatedUnitPrice(item).toLocaleString()}
                            <span className="text-xs text-gray-500 ml-2">
                              (calculatedUnitPrice: {(item as any).calculatedUnitPrice})
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Calculated Total</label>
                          <p className="text-sm font-semibold text-green-600">
                            ${getCalculatedTotalPrice(item).toLocaleString()}
                            <span className="text-xs text-gray-500 ml-2">
                              (calculatedTotalPrice: {(item as any).calculatedTotalPrice})
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Proposed Bid</label>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-primary">
                              ${getItemProposedBid(item).toLocaleString()}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newBid = prompt('Enter new proposed bid amount:', getItemProposedBid(item).toString());
                                if (newBid && !isNaN(parseFloat(newBid)) && parseFloat(newBid) >= 0) {
                                  handleUpdateItemProposedBid(item.id || '', parseFloat(newBid));
                                }
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {item.notes && (
                        <div className="mt-3">
                          <label className="text-sm font-medium text-muted-foreground">Notes</label>
                          <p className="text-sm mt-1">{item.notes}</p>
                        </div>
                      )}
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingDemolition(item)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bid Data Entry (Manual items) */}
      <div className="mt-6">
        <BidDataEntry
          initialData={manualItems.map(mi => ({
            id: mi.id,
            name: mi.name,
            measurement: mi.measurement,
            price: Number(mi.price || 0),
            proposedBid: Number(getItemProposedBid(mi) || 0),
            category: mi.category || 'Regular'
          }))}
          backend={{ bidId: bid?.id }}
          onDataChange={(simpleItems) => {
            // Map simple items to BidItem for display and totals
            const mapped: BidItem[] = simpleItems.map(si => ({
              id: si.id,
              name: si.name,
              measurement: si.measurement,
              price: Number(si.price || 0),
              pricing: Number(si.price || 0),
              proposedBid: Number(si.proposedBid || 0),
              category: si.category || 'Regular',
              quantity: 1,
              unit: si.measurement?.split(' ')?.[1] || undefined,
              description: si.name
            } as any));
            setManualItems(mapped);
          }}
        />
      </div>

    </PageContainer>
  );
};

export default BidDetail;
