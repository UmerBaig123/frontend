import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Grid3X3,
  Table,
  List,
  RefreshCw,
  Loader
} from "lucide-react";
import { ViewMode } from "./types";

interface TableHeaderProps {
  dataLength: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onRefresh: () => void;
  loading: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  dataLength,
  viewMode,
  setViewMode,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Price Sheet</h3>
        <Badge variant="secondary" className="text-sm">
          {dataLength} {dataLength === 1 ? 'item' : 'items'}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
        
        {/* View Mode Toggles */}
        <div className="flex items-center border border-gray-200 rounded-md p-1 bg-gray-50">
          <Button
            variant={viewMode === 'icons' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('icons')}
            className="h-8 px-3"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 px-3"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
