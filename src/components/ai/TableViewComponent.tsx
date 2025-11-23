import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { DataItem, EditingData } from "./types";
import { formatPrice } from "./utilities";

interface TableViewProps {
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

const TableView: React.FC<TableViewProps> = ({
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

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-900">Name</th>
                <th className="text-left p-3 font-medium text-gray-900">Price</th>
                <th className="text-left p-3 font-medium text-gray-900">Category</th>
                <th className="text-center p-3 font-medium text-gray-900 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  {editingId === item.id ? (
                    // Editing Mode
                    <>
                      <td className="p-3">
                        <Input
                          value={editingData.name}
                          onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                          placeholder="Item name"
                          className="text-sm"
                          onKeyDown={(e) => handleKeyPress(e, item.id)}
                          autoFocus
                        />
                      </td>
                      <td className="p-3">
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
                      </td>
                      <td className="p-3">
                        <Input
                          value={editingData.category}
                          onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                          placeholder="Category"
                          className="text-sm"
                          onKeyDown={(e) => handleKeyPress(e, item.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveEdit(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Display Mode
                    <>
                      <td className="p-3">
                        <div className="font-medium">
                          {item.name || 'Unnamed Item'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-green-600">
                          {formatPrice(item.price)}
                        </div>
                      </td>
                      <td className="p-3">
                        {item.category && (
                          <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteRow(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500 border rounded-lg">
          <div className="text-lg mb-2">No items found</div>
          <div className="text-sm">Click "Add Item" to get started</div>
        </div>
      )}
    </div>
  );
};

export default TableView;
