import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight,
  Database,
  Grid3X3,
  Table,
  List,
  RefreshCw,
  Loader,
  Download,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pricesheetAPI, PricesheetItem, CreatePricesheetItemRequest, UpdatePricesheetItemRequest } from "@/api/pricesheet";

interface DataItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  isEditing?: boolean;
}

type ViewMode = 'icons' | 'table' | 'list';

interface DataEntryTableProps {
  onDataChange?: (data: DataItem[]) => void;
  initialData?: DataItem[];
}

const DataEntryTable: React.FC<DataEntryTableProps> = ({ 
  onDataChange, 
  initialData = [] 
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<DataItem[]>(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ 
    name: string; 
    price: string; 
    category: string; 
  }>({ 
    name: '', 
    price: '', 
    category: ''
  });
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [listText, setListText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [syncMode, setSyncMode] = useState<boolean>(false); // Toggle between localStorage and API

  // Load data from API or localStorage on component mount
  useEffect(() => {
    if (syncMode) {
      loadFromAPI();
    } else {
      loadFromLocalStorage();
    }
  }, [syncMode]); // Remove initialData dependency to prevent infinite loops

  // Separate effect to handle initial data changes
  useEffect(() => {
    if (!syncMode && initialData && initialData.length > 0) {
      setData(initialData);
      onDataChange?.(initialData);
    }
  }, [initialData, syncMode, onDataChange]);

  // Update listText when data changes (for list view)
  useEffect(() => {
    const text = data.map(item => `${item.name} - $${item.price.toLocaleString()}`).join('\n');
    setListText(text);
  }, [data]);

  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem('ai-analysis-table-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        onDataChange?.(parsedData);
      } catch (error) {
        console.error('Error loading saved table data:', error);
      }
    } else if (initialData.length > 0) {
      setData(initialData);
      onDataChange?.(initialData);
    }
  };

  const loadFromAPI = async () => {
    console.log('Loading data from API...');
    setLoading(true);
    try {
      const items = await pricesheetAPI.getPricesheetItems();
      console.log('Loaded items from API:', items);
      
      const mappedData: DataItem[] = items.map(item => ({
        id: item._id,
        name: item.name,
        price: item.price,
        category: item.category || ''
      }));
      
      setData(mappedData);
      onDataChange?.(mappedData);
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${items.length} items from server.`,
      });
    } catch (error) {
      console.error('Error loading pricesheet items:', error);
      toast({
        title: "Load Failed",
        description: `Failed to load data from server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const syncToAPI = async () => {
    if (!syncMode) return;
    
    setLoading(true);
    try {
      // Get current API data
      const apiItems = await pricesheetAPI.getPricesheetItems();
      const apiItemIds = new Set(apiItems.map(item => item._id));
      
      // Find items to create, update, or delete
      const toCreate = data.filter(item => !apiItemIds.has(item.id));
      const toUpdate = data.filter(item => apiItemIds.has(item.id));
      
      // Create new items
      for (const item of toCreate) {
        const createData: CreatePricesheetItemRequest = {
          name: item.name,
          price: item.price,
          category: item.category
        };
        await pricesheetAPI.createPricesheetItem(createData);
      }
      
      // Update existing items
      for (const item of toUpdate) {
        const updateData: UpdatePricesheetItemRequest = {
          name: item.name,
          price: item.price,
          category: item.category
        };
        await pricesheetAPI.updatePricesheetItem(item.id, updateData);
      }
      
      toast({
        title: "Sync Complete",
        description: `Created ${toCreate.length} and updated ${toUpdate.length} items.`,
      });
      
      // Reload from API to get latest data
      await loadFromAPI();
    } catch (error) {
      console.error('Error syncing to API:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync data to server.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: DataItem[]) => {
    setData(newData);
    onDataChange?.(newData);

    if (syncMode) {
      // Save to API - we'll use a different approach for individual operations
      // For now, just save to localStorage as backup
      localStorage.setItem('ai-analysis-table-data', JSON.stringify(newData));
    } else {
      // Save to localStorage
      localStorage.setItem('ai-analysis-table-data', JSON.stringify(newData));
    }
  };

  const saveItemToAPI = async (item: DataItem, isNew: boolean = false) => {
    if (!syncMode) {
      console.log('Sync mode is disabled, skipping API save');
      return;
    }

    console.log('Saving item to API:', { item, isNew, syncMode });

    try {
      if (isNew) {
        const createData: CreatePricesheetItemRequest = {
          name: item.name,
          price: item.price,
          category: item.category || ''
        };
        console.log('Creating new item:', createData);
        const result = await pricesheetAPI.createPricesheetItem(createData);
        console.log('Item created successfully:', result);
        
        toast({
          title: "Item Created",
          description: "Item saved to server successfully",
        });
      } else {
        const updateData: UpdatePricesheetItemRequest = {
          name: item.name,
          price: item.price,
          category: item.category || ''
        };
        console.log('Updating item:', { id: item.id, updateData });
        const result = await pricesheetAPI.updatePricesheetItem(item.id, updateData);
        console.log('Item updated successfully:', result);
        
        toast({
          title: "Item Updated",
          description: "Item updated on server successfully",
        });
      }
    } catch (error) {
      console.error('Error saving item to API:', error);
      toast({
        title: "Save Failed",
        description: `Failed to save to server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const deleteItemFromAPI = async (itemId: string) => {
    if (!syncMode) return;

    try {
      await pricesheetAPI.deletePricesheetItem(itemId);
    } catch (error) {
      console.error('Error deleting item from API:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete from server. Removed locally.",
        variant: "destructive"
      });
    }
  };

  const parseListText = (text: string): DataItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const parts = line.split(' - $');
      const name = parts[0]?.trim() || `Item ${index + 1}`;
      const price = parseFloat(parts[1]?.replace(/,/g, '') || '0') || 0;
      return {
        id: crypto.randomUUID(),
        name,
        price
      };
    });
  };

  const handleListTextChange = (text: string) => {
    setListText(text);
    const parsedData = parseListText(text);
    setData(parsedData);
  };

  const validateFields = (name: string, price: string): string | null => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (!price.trim()) {
      return "Price is required";
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      return "Price must be a valid positive number";
    }
    return null;
  };

  const saveCurrentEdit = () => {
    if (editingId && editingData.name.trim() && editingData.price.trim()) {
      const validationError = validateFields(editingData.name, editingData.price);
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive"
        });
        return false;
      }

      const price = parseFloat(editingData.price);
      setData(prev => {
        const newData = prev.map(item => 
          item.id === editingId 
            ? { ...item, name: editingData.name.trim(), price, isEditing: false }
            : item
        );
        // Update localStorage immediately
        localStorage.setItem('ai-analysis-table-data', JSON.stringify(newData));
        return newData;
      });
      setEditingId(null);
      setEditingData({ name: '', price: '', category: '' });
      return true;
    }
    return true;
  };

  const addNewRow = () => {
    // Auto-save current editing item if there is one
    if (editingId) {
      const saved = saveCurrentEdit();
      if (!saved) return; // Don't add new row if current edit failed
    }

    const newItem: DataItem = {
      id: crypto.randomUUID(),
      name: '',
      price: 0,
      category: '',
      isEditing: true
    };
    
    // Batch the state updates to prevent flickering
    setData(prev => {
      const newData = [...prev, newItem];
      // Update localStorage immediately to prevent useEffect from triggering
      localStorage.setItem('ai-analysis-table-data', JSON.stringify(newData));
      return newData;
    });
    
    setEditingId(newItem.id);
    setEditingData({ name: '', price: '', category: '' });
  };

  const startEditing = (item: DataItem) => {
    // Auto-save current editing item if there is one
    if (editingId) {
      const saved = saveCurrentEdit();
      if (!saved) return; // Don't start editing new item if current edit failed
    }

    setEditingId(item.id);
    setEditingData({ 
      name: item.name, 
      price: item.price.toString(),
      category: item.category || ''
    });
  };

  const saveEdit = async (id: string) => {
    const validationError = validateFields(editingData.name, editingData.price);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    const price = parseFloat(editingData.price);
    const updatedItem: DataItem = {
      id,
      name: editingData.name.trim(),
      price,
      category: editingData.category || '',
      isEditing: false
    };

    // Update local state first
    setData(prev => {
      const newData = prev.map(item => 
        item.id === id ? updatedItem : item
      );
      // Update localStorage immediately
      localStorage.setItem('ai-analysis-table-data', JSON.stringify(newData));
      return newData;
    });

    // Check if this is a new item (no existing data before editing)
    const existingItem = data.find(item => item.id === id);
    const isNewItem = !existingItem || (existingItem.name === '' && existingItem.price === 0);

    // Save to API if in sync mode
    await saveItemToAPI(updatedItem, isNewItem);

    setEditingId(null);
    setEditingData({ name: '', price: '', category: '' });

    toast({
      title: "Item Updated",
      description: "The item has been saved successfully",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({ name: '', price: '', category: '' });
    // Remove the item if it was a new item being added
    setData(prev => {
      const newData = prev.filter(item => item.id !== editingId);
      // Update localStorage immediately
      localStorage.setItem('ai-analysis-table-data', JSON.stringify(newData));
      return newData;
    });
  };

  const deleteRow = async (id: string) => {
    // Delete from API first if in sync mode
    await deleteItemFromAPI(id);

    // Update local state
    setData(prev => {
      const newData = prev.filter(item => item.id !== id);
      // Update localStorage immediately
      localStorage.setItem('ai-analysis-table-data', JSON.stringify(newData));
      return newData;
    });
    
    toast({
      title: "Item Deleted",
      description: "The item has been removed successfully",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const renderIconsView = () => (
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

  const renderTableView = () => (
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

  const renderListView = () => (
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-bidgenius-600" />
            <CardTitle className="text-lg">Price Sheet</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {data.length} items
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
      </CardHeader>
      
      <CardContent>
        {viewMode === 'icons' && renderIconsView()}
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'list' && renderListView()}
      </CardContent>
    </Card>
  );
};

export default DataEntryTable; 