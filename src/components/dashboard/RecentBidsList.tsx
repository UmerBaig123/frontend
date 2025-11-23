 
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Edit, Bot, ExternalLink, ArrowRight } from "lucide-react";
import { bidAPI } from "@/api/bids";

interface BidRow {
  id: string;
  projectName: string;
  client: string;
  amount: string;
  date: Date;
  status: "approved" | "pending" | "rejected";
  isAiGenerated?: boolean;
}

const RecentBidsList = () => {
  const [bids, setBids] = useState<BidRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res: any = await bidAPI.getBids();
        // Normalize to an array safely
        let list: any[] = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.items)) list = res.items;
        else if (Array.isArray(res?.bids)) list = res.bids;
        else if (Array.isArray(res?.data?.bids)) list = res.data.bids;
        // Take first 4
        const items = list.slice(0, 4);
        const mapped: BidRow[] = items.map((b: any) => ({
          id: b.id || b._id,
          projectName: b.projectName || b.project?.name || b.name || 'Untitled',
          client: b.client || b.clientName || b.project?.client || '-',
          amount: (() => {
            const n = Number(b.totalAmount ?? b.amount ?? b.proposedAmount ?? 0);
            if (Number.isFinite(n) && n > 0) return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
            const s = String(b.amount || b.proposedBid || '');
            return s ? s : '$0';
          })(),
          date: new Date(b.createdAt || b.date || Date.now()),
          status: ((b.status || 'pending').toLowerCase()) as any,
          isAiGenerated: Boolean(b.aiGenerated || b.ai || b.extractedByAI)
        }));
        setBids(mapped);
      } catch (e) {
        console.error('Failed to load bids:', e);
        setBids([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-bidgenius-600" />
            Recent Bids
          </div>
          <Link to="/bids" className="text-sm text-bidgenius-600 hover:text-bidgenius-700 flex items-center">
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
                <TableHead>Date</TableHead>
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
              ) : bids.length > 0 ? (
                bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-1.5">
                        <span>{bid.projectName}</span>
                        {bid.isAiGenerated && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded-sm flex items-center">
                            <Bot className="h-3 w-3 mr-0.5" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{bid.client}</TableCell>
                    <TableCell>{bid.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(bid.status)}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{bid.amount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={`/bids/${bid.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No bids found
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

export default RecentBidsList;
