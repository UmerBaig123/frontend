import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { DataItem, EditingData } from "./types";
import { formatPrice } from "./utilities";

interface IconsViewProps {
  data: DataItem[];
  editingId: string | null;
  editingData: EditingData;
  setEditingData: (data: EditingData) => void;
  handleKeyPress: (e: React.KeyboardEvent, id: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  startEditing: (item: DataItem) => void;
  deleteRow: (id: string) => void;
  addNewRow: () => void;
}

const IconsView: React.FC<IconsViewProps> = ({
  data,
  editingId,
  editingData,
  setEditingData,
  handleKeyPress,
  saveEdit,
  cancelEdit,
  startEditing,
  deleteRow,
  addNewRow
}) => {
  return (
    <div className="space-y-4">
      {/* Add New Item Button */}
      <div className="flex justify-end">
        <Button 
          onClick={addNewRow}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
            {editingId === item.id ? (
              // Editing Mode
              <div className="space-y-3">
                <Input
                  value={editingData.name}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  placeholder="Item name"
                  className="text-sm"
                  onKeyDown={(e) => handleKeyPress(e, item.id)}
                  autoFocus
                />
                <Input
                  value={editingData.price}
                  onChange={(e) => setEditingData({ ...editingData, price: e.target.value })}
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="text-sm"
                  onKeyDown={(e) => handleKeyPress(e, item.id)}
                />
                <Input
                  value={editingData.category}
                  onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                  placeholder="Category (optional)"
                  className="text-sm"
                  onKeyDown={(e) => handleKeyPress(e, item.id)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveEdit(item.id)}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm truncate flex-1">
                    {item.name || 'Unnamed Item'}
                  </h4>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(item)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteRow(item.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(item.price)}
                </div>
                
                {item.category && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                    {item.category}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">No items found</div>
          <div className="text-sm">Click "Add Item" to get started</div>
        </div>
      )}
    </div>
  );
};

export default IconsView;
