import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database,
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
  syncMode: boolean;
  setSyncMode: (mode: boolean) => void;
  syncToAPI: () => void;
  loading: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  dataLength,
  viewMode,
  setViewMode,
  syncMode,
  setSyncMode,
  syncToAPI,
  loading
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-bidgenius-600" />
        <h2 className="text-lg font-semibold">Price Sheet</h2>
        <Badge variant="secondary" className="ml-2">
          {dataLength} items
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {/* View Mode Buttons */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={viewMode === 'icons' ? 'default' : 'outline'}
            onClick={() => setViewMode('icons')}
            className="h-8 px-3"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Icons
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            className="h-8 px-3"
          >
            <Table className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
        </div>

        {/* API Sync Toggle */}
        <div className="flex items-center gap-2 ml-4 border-l pl-4">
          <label htmlFor="sync-toggle" className="text-sm font-medium">
            API Sync
          </label>
          <input
            id="sync-toggle"
            type="checkbox"
            checked={syncMode}
            onChange={(e) => setSyncMode(e.target.checked)}
            className="h-4 w-4 text-bidgenius-600 focus:ring-bidgenius-500 border-gray-300 rounded"
          />
          {syncMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={syncToAPI}
              disabled={loading}
              className="h-8 px-3"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Sync
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
