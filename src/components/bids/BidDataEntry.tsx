import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Database,
  Grid3X3,
  Table,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bidAPI } from "@/api/bids";

interface BackendContext {
  bidId?: string;
}

interface BidItem {
  id: string;
  name: string;
  measurement: string;
  price: number;
  proposedBid: number;
  isEditing?: boolean;
  category?: string;
}

type ViewMode = 'icons' | 'table' | 'list';

interface BidDataEntryProps {
  onDataChange?: (data: BidItem[]) => void;
  initialData?: BidItem[];
  onAddItem?: (item: Omit<BidItem, 'id'>) => void;
  onUpdateItem?: (itemId: string, updates: Partial<BidItem>) => void;
  onRemoveItem?: (itemId: string) => void;
  onDuplicateItem?: (itemId: string) => void;
  backend?: BackendContext; // { bidId } to enable backend sync
}

const BidDataEntry: React.FC<BidDataEntryProps> = ({ 
  onDataChange, 
  initialData = [],
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onDuplicateItem,
  backend
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<BidItem[]>(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{ 
    name: string; 
    measurement: string; 
    price: string; 
    proposedBid: string; 
  }>({ name: '', measurement: '', price: '', proposedBid: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [listText, setListText] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItemData, setNewItemData] = useState<{
    name: string;
    measurement: string;
    price: string;
    proposedBid: string;
    category: string;
    quantity: string;
    unit: string;
    description: string;
  }>({
    name: '',
    measurement: '',
    price: '',
    proposedBid: '',
    category: 'Regular',
    quantity: '1',
    unit: 'Each',
    description: ''
  });
  const onDataChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (onDataChangeTimeoutRef.current) {
        clearTimeout(onDataChangeTimeoutRef.current);
      }
    };
  }, []);

  // Debounced onDataChange to prevent rapid API calls
  const debouncedOnDataChange = useCallback((newData: BidItem[]) => {
    // Clear any existing timeout
    if (onDataChangeTimeoutRef.current) {
      clearTimeout(onDataChangeTimeoutRef.current);
    }
    
    // Debounce the callback by 500ms
    onDataChangeTimeoutRef.current = setTimeout(() => {
      onDataChange?.(newData);
    }, 500);
  }, [onDataChange]);

  // Validation function for edit data
  const validateData = (name: string, measurement: string, price: string, proposedBid: string): string | null => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (!measurement.trim()) {
      return "Measurement is required";
    }
    
    const numPrice = parseFloat(price);
    const numProposedBid = parseFloat(proposedBid);
    
    if (isNaN(numPrice) || numPrice < 0) {
      return "Price must be a valid positive number";
    }
    if (isNaN(numProposedBid) || numProposedBid < 0) {
      return "Proposed bid must be a valid positive number";
    }
    
    return null; // No validation errors
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('bid-data-entry');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const validatedData = parsedData.map((item: any) => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : 0,
          proposedBid: typeof item.proposedBid === 'number' ? item.proposedBid : 0,
          measurement: item.measurement || 'TBD',
          category: item.category || 'Regular'
        }));
        setData(validatedData);
        updateListText(validatedData);
        // Don't call onDataChange on mount to prevent infinite loops
      } catch (error) {
        console.error('Error loading saved bid data:', error);
      }
    } else if (initialData && initialData.length > 0) {
      // Process initial data to ensure proper formatting
      const processedData = initialData.map(item => ({
        ...item,
        price: typeof item.price === 'number' ? item.price : 0,
        proposedBid: typeof item.proposedBid === 'number' ? item.proposedBid : 0,
        measurement: item.measurement || 'TBD',
        category: item.category || 'Regular'
      }));
      setData(processedData);
      updateListText(processedData);
      // Don't call onDataChange when receiving initialData to prevent loops
    }
  }, [initialData]); // Remove onDataChange from dependency array

  const updateListText = (items: BidItem[]) => {
    const text = items.map(item => 
      `${item.name} - ${item.measurement} - $${item.price.toLocaleString()} - $${item.proposedBid.toLocaleString()}`
    ).join('\n');
    setListText(text);
  };

  const parseListText = (text: string): BidItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const parts = line.split(' - ');
      const name = parts[0]?.trim() || `Item ${index + 1}`;
      const measurement = parts[1]?.trim() || '';
      const price = parseFloat(parts[2]?.replace(/[$,]/g, '') || '0') || 0;
      const proposedBid = parseFloat(parts[3]?.replace(/[$,]/g, '') || '0') || 0;
      return {
        id: crypto.randomUUID(),
        name,
        measurement,
        price,
        proposedBid
      };
    });
  };

  const handleListTextChange = (text: string) => {
    setListText(text);
    const parsedData = parseListText(text);
    setData(parsedData);
    // Notify parent component with debouncing for text changes
    debouncedOnDataChange(parsedData);
  };

  const validateFields = (name: string, measurement: string, price: string, proposedBid: string): string | null => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (!measurement.trim()) {
      return "Measurement is required";
    }
    if (!price.trim()) {
      return "Price is required";
    }
    if (!proposedBid.trim()) {
      return "Proposed Bid is required";
    }
    const priceValue = parseFloat(price);
    const proposedBidValue = parseFloat(proposedBid);
    if (isNaN(priceValue) || priceValue < 0) {
      return "Price must be a valid positive number";
    }
    if (isNaN(proposedBidValue) || proposedBidValue < 0) {
      return "Proposed Bid must be a valid positive number";
    }
    return null;
  };

  // Add item form functions
  const openAddForm = () => {
    setShowAddForm(true);
    setNewItemData({
      name: '',
      measurement: '',
      price: '',
      proposedBid: '',
      category: 'Regular',
      quantity: '1',
      unit: 'Each',
      description: ''
    });
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setNewItemData({
      name: '',
      measurement: '',
      price: '',
      proposedBid: '',
      category: 'Regular',
      quantity: '1',
      unit: 'Each',
      description: ''
    });
  };

  const submitAddForm = async () => {
    // Validate required fields
    const validationError = validateFields(
      newItemData.name,
      newItemData.measurement,
      newItemData.price,
      newItemData.proposedBid
    );

    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    // If a backend bidId is provided, default category to Demolition so it persists server-side
    const effectiveCategory = backend?.bidId ? 'Demolition' : (newItemData.category || 'Regular');

    const newItem: BidItem = {
      id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newItemData.name.trim(),
      measurement: newItemData.measurement.trim(),
      price: parseFloat(newItemData.price),
      proposedBid: parseFloat(newItemData.proposedBid),
      category: effectiveCategory
    } as any;

    console.log('[BidDataEntry] Adding item (local):', newItem);

    // Backend sync if bidId provided (treat as demolition add)
    if (backend?.bidId) {
      try {
        console.log('[BidDataEntry] POST → /api/bids/:id/demolition-items', {
          bidId: backend.bidId,
          body: {
            name: newItem.name,
            measurement: newItem.measurement,
            unitPrice: newItem.price,
            proposedBid: newItem.proposedBid,
          }
        });
        const resp: any = await bidAPI.addDemolitionItem(backend.bidId, {
          name: newItem.name,
          measurement: newItem.measurement,
          unitPrice: newItem.price,
          proposedBid: newItem.proposedBid,
        });
        console.log('[BidDataEntry] POST result:', resp);
        const created = resp?.item || resp?.data?.item || resp?.data || resp;
        const backendId = created?._id || created?.id;
        if (backendId) {
          console.log('[BidDataEntry] Mapped created backend id:', backendId);
          newItem.id = String(backendId);
        } else {
          console.warn('[BidDataEntry] No backend id found in response; keeping temporary id');
        }
        toast({ title: 'Demolition item added', description: `${newItem.name} saved to backend.` });
      } catch (e:any) {
        console.error('[BidDataEntry] Backend add failed:', e);
        toast({ title: 'Backend add failed', description: e?.message || 'Could not add item', variant: 'destructive' });
      }
    } else {
      console.log('[BidDataEntry] Skipping backend add: no bidId provided');
    }

    // Use parent helper if available, otherwise handle locally
    if (onAddItem) {
      const itemToAdd: Omit<BidItem, 'id'> = {
        name: newItem.name,
        measurement: newItem.measurement,
        price: newItem.price,
        proposedBid: newItem.proposedBid,
        category: newItem.category
      } as any;
      onAddItem(itemToAdd);
    } else {
      setData(prev => {
        const newData = [...prev, newItem];
        console.log('[BidDataEntry] Local add, new data length:', newData.length);
        localStorage.setItem('bid-data-entry', JSON.stringify(newData));
        debouncedOnDataChange(newData);
        return newData;
      });
    }

    toast({
      title: "Item Added",
      description: `${newItem.name} has been added successfully.`,
    });

    closeAddForm();
  };

  const saveCurrentEdit = () => {
    if (editingId && editingData.name.trim() && editingData.measurement.trim() && 
        editingData.price.trim() && editingData.proposedBid.trim()) {
      const validationError = validateFields(
        editingData.name, 
        editingData.measurement, 
        editingData.price, 
        editingData.proposedBid
      );
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive"
        });
        return false;
      }

      const price = parseFloat(editingData.price);
      const proposedBid = parseFloat(editingData.proposedBid);
      setData(prev => {
        const newData = prev.map(item => 
          item.id === editingId 
            ? { 
                ...item, 
                name: editingData.name.trim(), 
                measurement: editingData.measurement.trim(),
                price, 
                proposedBid,
                isEditing: false 
              }
            : item
        );
        // Update localStorage immediately
        localStorage.setItem('bid-data-entry', JSON.stringify(newData));
        // Notify parent component with debouncing
        debouncedOnDataChange(newData);
        return newData;
      });
      setEditingId(null);
      setEditingData({ name: '', measurement: '', price: '', proposedBid: '' });
      return true;
    }
    return true;
  };

  const addNewRow = () => {
    // Auto-save current editing item if there is one
    if (editingId) {
      const saved = saveCurrentEdit();
      if (!saved) return; // Don't open add form if current edit failed
    }

    // Open the add form instead of creating a blank row
    openAddForm();
  };

  const startEditing = (item: BidItem) => {
    // Auto-save current editing item if there is one
    if (editingId) {
      const saved = saveCurrentEdit();
      if (!saved) return; // Don't start editing new item if current edit failed
    }

    setEditingId(item.id);
    setEditingData({ 
      name: item.name, 
      measurement: item.measurement,
      price: item.price.toString(), 
      proposedBid: item.proposedBid.toString() 
    });
  };

    const saveEdit = async (id: string) => {
    const validationError = validateData(
      editingData.name, 
      editingData.measurement, 
      editingData.price, 
      editingData.proposedBid
    );
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return false;
    }

    const price = parseFloat(editingData.price);
    const proposedBid = parseFloat(editingData.proposedBid);
    
    const updatedItemData = {
      name: editingData.name.trim(), 
      measurement: editingData.measurement.trim(),
      price, 
      proposedBid,
      isEditing: false 
    };

    console.log('[BidDataEntry] Saving edit for id:', id, 'payload:', updatedItemData);

    // Backend sync if bidId provided and the edited row is Demolition
    const existing = data.find(d => d.id === id);
    if (backend?.bidId && existing?.category?.toLowerCase() === 'demolition') {
      try {
        console.log('[BidDataEntry] PUT → updateDemolitionItem', {
          bidId: backend.bidId,
          itemId: id,
          body: {
            name: updatedItemData.name,
            measurement: updatedItemData.measurement,
            price: updatedItemData.price,
            proposedBid: updatedItemData.proposedBid,
          }
        });
        const resp: any = await bidAPI.updateDemolitionItem(backend.bidId, id, {
          name: updatedItemData.name,
          measurement: updatedItemData.measurement,
          price: updatedItemData.price,
          proposedBid: updatedItemData.proposedBid,
        } as any);
        console.log('[BidDataEntry] PUT result:', resp);
        toast({ title: 'Demolition item updated', description: `${updatedItemData.name} saved.` });
      } catch (e:any) {
        console.error('[BidDataEntry] Backend update failed:', e);
        toast({ title: 'Backend update failed', description: e?.message || 'Could not update item', variant: 'destructive' });
      }
    } else {
      if (!backend?.bidId) console.log('[BidDataEntry] Skipping backend update: no bidId provided');
      if (existing && (existing.category || '').toLowerCase() !== 'demolition') console.log('[BidDataEntry] Skipping backend update: category is not Demolition');
    }

    // Use parent helper if available, otherwise handle locally
    if (onUpdateItem) {
      onUpdateItem(id, updatedItemData);
    } else {
      setData(prev => {
        const newData = prev.map(item => 
          item.id === id ? { ...item, ...updatedItemData } : item
        );
        console.log('[BidDataEntry] Local update for id:', id);
        // Update localStorage immediately
        localStorage.setItem('bid-data-entry', JSON.stringify(newData));
        // Notify parent component with debouncing
        debouncedOnDataChange(newData);
        return newData;
      });
    }
    
    setEditingId(null);
    setEditingData({ name: '', measurement: '', price: '', proposedBid: '' });

    toast({
      title: "Item Updated",
      description: "The item has been saved successfully",
    });
    
    return true;
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({ name: '', measurement: '', price: '', proposedBid: '' });
    // Remove the item if it was a new item being added
    setData(prev => {
      const newData = prev.filter(item => item.id !== editingId);
      // Update localStorage immediately
      localStorage.setItem('bid-data-entry', JSON.stringify(newData));
      // Notify parent component with debouncing
      debouncedOnDataChange(newData);
      return newData;
    });
  };

  const deleteRow = (id: string) => {
    // Use parent helper if available, otherwise handle locally
    if (onRemoveItem) {
      onRemoveItem(id);
    } else {
      setData(prev => {
        const newData = prev.filter(item => item.id !== id);
        // Update localStorage immediately
        localStorage.setItem('bid-data-entry', JSON.stringify(newData));
        // Notify parent component with debouncing
        debouncedOnDataChange(newData);
        return newData;
      });
    }
    
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
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
        <div className="col-span-2">Category</div>
        <div className="col-span-3">Name</div>
        <div className="col-span-2">Measurement</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-2">Proposed Bid</div>
        <div className="col-span-1 text-center">Actions</div>
      </div>

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
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="col-span-2">
                <Badge 
                  variant={item.category === 'Demolition' ? 'destructive' : 'default'}
                  className="text-xs"
                >
                  {item.category || 'Regular'}
                </Badge>
              </div>
              <div className="col-span-3">
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
              <div className="col-span-2">
                {editingId === item.id ? (
                  <Input
                    value={editingData.measurement}
                    onChange={(e) => setEditingData(prev => ({ ...prev, measurement: e.target.value }))}
                    onKeyDown={(e) => handleKeyPress(e, item.id)}
                    placeholder="Enter measurement *"
                    className="h-8"
                    required
                  />
                ) : (
                  <span className="text-sm">{item.measurement}</span>
                )}
              </div>
              <div className="col-span-2">
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
              <div className="col-span-2">
                {editingId === item.id ? (
                  <Input
                    value={editingData.proposedBid}
                    onChange={(e) => setEditingData(prev => ({ ...prev, proposedBid: e.target.value }))}
                    onKeyDown={(e) => handleKeyPress(e, item.id)}
                    placeholder="0.00 *"
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-8"
                    required
                  />
                ) : (
                  <span className="text-sm">${item.proposedBid.toLocaleString()}</span>
                )}
              </div>
              <div className="col-span-1 flex items-center justify-center gap-1">
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

      {/* Add Item Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 bg-blue-50 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Add New Item</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeAddForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={newItemData.name}
                onChange={(e) => setNewItemData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
                className="w-full"
              />
            </div>

            {/* Measurement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement <span className="text-red-500">*</span>
              </label>
              <Input
                value={newItemData.measurement}
                onChange={(e) => setNewItemData(prev => ({ ...prev, measurement: e.target.value }))}
                placeholder="Enter measurement"
                className="w-full"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newItemData.price}
                onChange={(e) => setNewItemData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="w-full"
              />
            </div>

            {/* Proposed Bid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Bid <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newItemData.proposedBid}
                onChange={(e) => setNewItemData(prev => ({ ...prev, proposedBid: e.target.value }))}
                placeholder="0.00"
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newItemData.category}
                onChange={(e) => setNewItemData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Regular">Regular</option>
                <option value="Demolition">Demolition</option>
                <option value="Construction">Construction</option>
                <option value="Material">Material</option>
                <option value="Labor">Labor</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={newItemData.quantity}
                onChange={(e) => setNewItemData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="1"
                className="w-full"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <Input
                value={newItemData.unit}
                onChange={(e) => setNewItemData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="Each, sq ft, etc."
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                value={newItemData.description}
                onChange={(e) => setNewItemData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button
              onClick={submitAddForm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button
              variant="outline"
              onClick={closeAddForm}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

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
              <th className="border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Category</th>
              <th className="border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Name</th>
              <th className="border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Measurement</th>
              <th className="border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Price</th>
              <th className="border-r border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 bg-gray-50">Proposed Bid</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="border-b border-gray-200 px-4 py-8 text-center text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to get started</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border-r border-gray-200 px-4 py-3">
                    <Badge 
                      variant={item.category === 'Demolition' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {item.category || 'Regular'}
                    </Badge>
                  </td>
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
                        value={editingData.measurement}
                        onChange={(e) => setEditingData(prev => ({ ...prev, measurement: e.target.value }))}
                        onKeyDown={(e) => handleKeyPress(e, item.id)}
                        placeholder="Enter measurement *"
                        className="h-8 border-0 p-0 focus:ring-0 bg-transparent"
                        required
                      />
                    ) : (
                      <span className="text-sm">{item.measurement}</span>
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
                  <td className="border-r border-gray-200 px-4 py-3">
                    {editingId === item.id ? (
                      <Input
                        value={editingData.proposedBid}
                        onChange={(e) => setEditingData(prev => ({ ...prev, proposedBid: e.target.value }))}
                        onKeyDown={(e) => handleKeyPress(e, item.id)}
                        placeholder="0.00 *"
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-8 border-0 p-0 focus:ring-0 bg-transparent"
                        required
                      />
                    ) : (
                      <span className="text-sm font-mono text-gray-900">${item.proposedBid.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
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
        placeholder="Enter your bid data here...&#10;Format: Name - Measurement - $Price - $ProposedBid&#10;Example:&#10;Concrete Foundation - 500 sq ft - $15,000 - $18,500&#10;Electrical Wiring - 2000 ft - $8,500 - $9,200"
        className="min-h-[300px] font-mono text-sm"
      />
      <div className="text-xs text-gray-500">
        <p>Format: Name - Measurement - $Price - $ProposedBid</p>
        <p>Example: Concrete Foundation - 500 sq ft - $15,000 - $18,500</p>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-bidgenius-600" />
            <CardTitle className="text-lg">Bid Data Sheet</CardTitle>
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

export default BidDataEntry; 