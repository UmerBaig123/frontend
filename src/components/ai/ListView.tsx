import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface ListViewProps {
  listText: string;
  handleListTextChange: (text: string) => void;
}

const ListView: React.FC<ListViewProps> = ({
  listText,
  handleListTextChange
}) => {
  return (
    <div className="space-y-4">
      <Textarea
        value={listText}
        onChange={(e) => handleListTextChange(e.target.value)}
        placeholder="Enter your price list here...&#10;Format: Item Name - $Price&#10;Example:&#10;Office Chair - $299.99&#10;Desk Lamp - $89.50"
        className="min-h-[300px] font-mono text-sm"
      />
      <div className="text-xs text-gray-500">
        <p>Format: Item Name - $Price</p>
        <p>Example: Office Chair - $299.99</p>
      </div>
    </div>
  );
};

export default ListView;
