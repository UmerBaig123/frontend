import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

interface ListViewProps {
  listText: string;
  handleListTextChange: (text: string) => void;
  onImport: () => void;
  onExport: () => void;
}

const ListView: React.FC<ListViewProps> = ({
  listText,
  handleListTextChange,
  onImport,
  onExport
}) => {
  return (
    <div className="space-y-4">
      {/* Import/Export Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Format: Item Name - $Price (one per line)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Text Area */}
      <Textarea
        value={listText}
        onChange={(e) => handleListTextChange(e.target.value)}
        placeholder="Enter your price list here...&#10;Format: Item Name - $Price&#10;Example:&#10;Office Chair - $299.99&#10;Desk Lamp - $89.50&#10;Standing Desk - $599.99"
        className="min-h-[400px] font-mono text-sm"
      />
      
      {/* Helper Text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <strong>Tips:</strong>
        <ul className="mt-1 space-y-1">
          <li>• Use format: "Item Name - $Price"</li>
          <li>• One item per line</li>
          <li>• Price will be automatically parsed</li>
          <li>• Changes are applied in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default ListView;
