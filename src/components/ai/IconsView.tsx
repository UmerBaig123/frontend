import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Database
} from "lucide-react";
import { DataItem, EditingData } from "./types";

interface IconsViewProps {
  data: DataItem[];
  editingId: string | null;
  editingData: EditingData;
  syncMode: boolean;
  setEditingData: React.Dispatch<React.SetStateAction<EditingData>>;
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
  syncMode,
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
      {/* Table Header */}
      {syncMode ? (
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-3">Price</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
          <div className="col-span-6">Name</div>
          <div className="col-span-4">Price</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
      )}

      {/* Table Body */}
      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No items added yet</p>
            <p className="text-sm">Click "Add Item" to get started</p>
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className={`${syncMode ? 'grid grid-cols-12 gap-2' : 'grid grid-cols-12 gap-4'} items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors`}>
              {/* Name Column */}
              <div className={syncMode ? "col-span-4" : "col-span-6"}>
                {editingId === item.id ? (
                  <Input
                    value={editingData.name}
                    onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => handleKeyPress(e, item.id)}
                    placeholder="Enter item name *"
                    className="h-8"
                    required
                  />
                ) : (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </div>

              {/* Category Column - Only show in sync mode */}
              {syncMode && (
                <div className="col-span-3">
                  {editingId === item.id ? (
                    <Input
                      value={editingData.category}
                      onChange={(e) => setEditingData(prev => ({ ...prev, category: e.target.value }))}
                      onKeyDown={(e) => handleKeyPress(e, item.id)}
                      placeholder="Category"
                      className="h-8"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{item.category || '-'}</span>
                  )}
                </div>
              )}

              {/* Price Column */}
              <div className={syncMode ? "col-span-2" : "col-span-4"}>
                {editingId === item.id ? (
                  <Input
                    value={editingData.price}
                    onChange={(e) => setEditingData(prev => ({ ...prev, price: e.target.value }))}
                    onKeyDown={(e) => handleKeyPress(e, item.id)}
                    placeholder="0.00 *"
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-8"
                    required
                  />
                ) : (
                  <span className="text-sm">${item.price.toLocaleString()}</span>
                )}
              </div>

              {/* Actions Column */}
              <div className="col-span-2 flex items-center justify-center gap-1">
                {editingId === item.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveEdit(item.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
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
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Item Button */}
      <div className="pt-2">
        <Button
          onClick={addNewRow}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
};

export default IconsView;
