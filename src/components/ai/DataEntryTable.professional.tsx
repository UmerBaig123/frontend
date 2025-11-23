import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Import types
import { DataItem, ViewMode, DataEntryTableProps, EditingData } from "./types";

// Import services
import { 
  loadDataFromAPI,
  createItemViaAPI,
  updateItemViaAPI,
  deleteItemViaAPI,
  saveToLocalStorage
} from "./apiService";

// Import utilities
import { parseListText, validateFields, generateListText } from "./utilities";

// Import components
import HeaderSection from "./HeaderSection";
import GridView from "./GridView";
import TableViewComponent from "./TableViewComponent";
import TextAreaView from "./TextAreaView";

const DataEntryTable: React.FC<DataEntryTableProps> = ({ 
  onDataChange, 
  initialData = [] 
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<DataItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingData>({ 
    name: '', 
    price: '', 
    category: ''
  });
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [listText, setListText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Load data from API on component mount
  useEffect(() => {
    loadDataFromAPI(setData, setLoading, onDataChange, toast);
  }, [onDataChange, toast]);

  // Update listText when data changes (for list view)
  useEffect(() => {
    const text = generateListText(data);
    setListText(text);
  }, [data]);

  // Save to localStorage whenever data changes (as backup)
  useEffect(() => {
    if (data.length > 0) {
      saveToLocalStorage(data);
    }
  }, [data]);

  const refreshData = async () => {
    await loadDataFromAPI(setData, setLoading, onDataChange, toast);
  };

  const updateDataState = (newData: DataItem[]) => {
    setData(newData);
    onDataChange?.(newData);
    saveToLocalStorage(newData);
  };

  const handleListTextChange = (text: string) => {
    setListText(text);
    const parsedData = parseListText(text);
    updateDataState(parsedData);
  };

  const saveCurrentEdit = (): boolean => {
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
      const newData = data.map(item => 
        item.id === editingId 
          ? { ...item, name: editingData.name.trim(), price, category: editingData.category || '', isEditing: false }
          : item
      );
      updateDataState(newData);
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
    
    const newData = [...data, newItem];
    updateDataState(newData);
    
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

    // Check if this is a new item (no existing data before editing)
    const existingItem = data.find(item => item.id === id);
    const isNewItem = !existingItem || (existingItem.name === '' && existingItem.price === 0);

    try {
      if (isNewItem) {
        // Create new item via API
        await createItemViaAPI(updatedItem, (newItem) => {
          const newData = data.map(item => 
            item.id === id ? newItem : item
          );
          updateDataState(newData);
        }, toast);
      } else {
        // Update existing item via API
        await updateItemViaAPI(updatedItem, (updated) => {
          const newData = data.map(item => 
            item.id === id ? updated : item
          );
          updateDataState(newData);
        }, toast);
      }

      setEditingId(null);
      setEditingData({ name: '', price: '', category: '' });
    } catch (error) {
      // Keep the item in editing mode if API call failed
      console.error('Save failed:', error);
    }
  };

  const cancelEdit = () => {
    const existingItem = data.find(item => item.id === editingId);
    const isNewItem = !existingItem || (existingItem.name === '' && existingItem.price === 0);
    
    if (isNewItem) {
      // Remove the item if it was a new item being added
      const newData = data.filter(item => item.id !== editingId);
      updateDataState(newData);
    }
    
    setEditingId(null);
    setEditingData({ name: '', price: '', category: '' });
  };

  const deleteRow = async (id: string) => {
    try {
      await deleteItemViaAPI(id, () => {
        const newData = data.filter(item => item.id !== id);
        updateDataState(newData);
      }, toast);
    } catch (error) {
      // Keep the item if API call failed
      console.error('Delete failed:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleImport = () => {
    // Placeholder for import functionality
    toast({
      title: "Import",
      description: "Import functionality to be implemented",
    });
  };

  const handleExport = () => {
    // Export current data as text
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricesheet.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Pricesheet exported successfully",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <HeaderSection
          dataLength={data.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onRefresh={refreshData}
          loading={loading}
        />
      </CardHeader>
      
      <CardContent>
        {viewMode === 'icons' && (
          <GridView
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
        {viewMode === 'table' && (
          <TableViewComponent
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
          <TextAreaView
            listText={listText}
            handleListTextChange={handleListTextChange}
            onImport={handleImport}
            onExport={handleExport}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DataEntryTable;
