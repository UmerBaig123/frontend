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

interface TableViewProps {
  data: DataItem[];
  editingId: string | null;
  editingData: EditingData;
  setEditingData: React.Dispatch<React.SetStateAction<EditingData>>;
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
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Name</th>
              <th className="border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Price</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="border-b border-gray-200 px-4 py-8 text-center text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to get started</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border-r border-gray-200 px-4 py-3">
                    {editingId === item.id ? (
                      <Input
                        value={editingData.name}
                        onChange={(e) => setEditingData(prev => ({ ...prev, name: e.target.value }))}
                        onKeyDown={(e) => handleKeyPress(e, item.id)}
                        placeholder="Enter item name *"
                        className="h-8 border-0 p-0 focus:ring-0 bg-transparent"
                        required
                      />
                    ) : (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </td>
                  <td className="border-r border-gray-200 px-4 py-3">
                    {editingId === item.id ? (
                      <Input
                        value={editingData.price}
                        onChange={(e) => setEditingData(prev => ({ ...prev, price: e.target.value }))}
                        onKeyDown={(e) => handleKeyPress(e, item.id)}
                        placeholder="0.00 *"
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-8 border-0 p-0 focus:ring-0 bg-transparent"
                        required
                      />
                    ) : (
                      <span className="text-sm font-mono text-gray-900">${item.price.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {editingId === item.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveEdit(item.id)}
                            className="h-6 w-6 p-0 hover:bg-green-100"
                            title="Save"
                          >
                            <Save className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            title="Cancel"
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(item)}
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            title="Edit"
                          >
                            <Edit3 className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteRow(item.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

export default TableView;
