import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Import types
import { DataItem, ViewMode, DataEntryTableProps, EditingData } from "./types";

// Import services
import { 
  loadFromLocalStorage, 
  loadFromAPI, 
  syncToAPI as syncToAPIService, 
  saveItemToAPI, 
  deleteItemFromAPI 
} from "./dataService";
import { parseListText, validateFields } from "./utils";

// Import components
import TableHeader from "./TableHeader";
import IconsView from "./IconsView";
import TableView from "./TableView";
import ListView from "./ListView";

const DataEntryTable: React.FC<DataEntryTableProps> = ({ 
  onDataChange, 
  initialData = [] 
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<DataItem[]>(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingData>({ 
    name: '', 
    price: '', 
    category: ''
  });
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [listText, setListText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [syncMode, setSyncMode] = useState<boolean>(false);

  // Load data from API or localStorage on component mount
  useEffect(() => {
    if (syncMode) {
      loadFromAPIWrapper();
    } else {
      loadFromLocalStorageWrapper();
    }
  }, [syncMode]);

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

  const loadFromLocalStorageWrapper = () => {
    loadFromLocalStorage(setData, onDataChange, initialData);
  };

  const loadFromAPIWrapper = async () => {
    await loadFromAPI(setData, setLoading, onDataChange, toast, loadFromLocalStorageWrapper);
  };

  const syncToAPI = async () => {
    if (!syncMode) return;
    await syncToAPIService(data, setLoading, toast, loadFromAPIWrapper);
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

  const handleListTextChange = (text: string) => {
    setListText(text);
    const parsedData = parseListText(text);
    setData(parsedData);
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
    await saveItemToAPI(updatedItem, isNewItem, syncMode, toast);

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
    await deleteItemFromAPI(id, syncMode, toast);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <TableHeader
          dataLength={data.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          syncMode={syncMode}
          setSyncMode={setSyncMode}
          syncToAPI={syncToAPI}
          loading={loading}
        />
      </CardHeader>
      
      <CardContent>
        {viewMode === 'icons' && (
          <IconsView
            data={data}
            editingId={editingId}
            editingData={editingData}
            syncMode={syncMode}
            setEditingData={setEditingData}
            handleKeyPress={handleKeyPress}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            startEditing={startEditing}
            deleteRow={deleteRow}
            addNewRow={addNewRow}
          />
        )}
        {viewMode === 'table' && (
          <TableView
            data={data}
            editingId={editingId}
            editingData={editingData}
            setEditingData={setEditingData}
            handleKeyPress={handleKeyPress}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            startEditing={startEditing}
            deleteRow={deleteRow}
            addNewRow={addNewRow}
          />
        )}
        {viewMode === 'list' && (
          <ListView
            listText={listText}
            handleListTextChange={handleListTextChange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DataEntryTable;
