import { pricesheetAPI, PricesheetItem, CreatePricesheetItemRequest, UpdatePricesheetItemRequest } from "@/api/pricesheet";
import { DataItem } from "./types";

export const loadFromLocalStorage = (
  setData: (data: DataItem[]) => void,
  onDataChange?: (data: DataItem[]) => void,
  initialData: DataItem[] = []
) => {
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

export const loadFromAPI = async (
  setData: (data: DataItem[]) => void,
  setLoading: (loading: boolean) => void,
  onDataChange?: (data: DataItem[]) => void,
  toast?: any,
  fallbackToLocalStorage?: () => void
) => {
  console.log('Loading data from API...');
  setLoading(true);
  try {
    const items = await pricesheetAPI.getPricesheetItems();
    console.log('Loaded items from API:', items);
    
    const mappedData: DataItem[] = items.map((item: PricesheetItem) => ({
      id: item._id,
      name: item.name,
      price: item.price,
      category: item.category || ''
    }));
    
    setData(mappedData);
    onDataChange?.(mappedData);
    
    if (toast) {
      toast({
        title: "Data Loaded",
        description: `Loaded ${items.length} items from server.`,
      });
    }
  } catch (error) {
    console.error('Error loading pricesheet items:', error);
    if (toast) {
      toast({
        title: "Load Failed",
        description: `Failed to load data from server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
    if (fallbackToLocalStorage) {
      fallbackToLocalStorage();
    }
  } finally {
    setLoading(false);
  }
};

export const syncToAPI = async (
  data: DataItem[],
  setLoading: (loading: boolean) => void,
  toast?: any,
  reloadFromAPI?: () => Promise<void>
) => {
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
    
    if (toast) {
      toast({
        title: "Sync Complete",
        description: `Created ${toCreate.length} and updated ${toUpdate.length} items.`,
      });
    }
    
    // Reload from API to get latest data
    if (reloadFromAPI) {
      await reloadFromAPI();
    }
  } catch (error) {
    console.error('Error syncing to API:', error);
    if (toast) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync data to server.",
        variant: "destructive"
      });
    }
  } finally {
    setLoading(false);
  }
};

export const saveItemToAPI = async (
  item: DataItem,
  isNew: boolean = false,
  syncMode: boolean,
  toast?: any
) => {
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
      
      if (toast) {
        toast({
          title: "Item Created",
          description: "Item saved to server successfully",
        });
      }
    } else {
      const updateData: UpdatePricesheetItemRequest = {
        name: item.name,
        price: item.price,
        category: item.category || ''
      };
      console.log('Updating item:', { id: item.id, updateData });
      const result = await pricesheetAPI.updatePricesheetItem(item.id, updateData);
      console.log('Item updated successfully:', result);
      
      if (toast) {
        toast({
          title: "Item Updated",
          description: "Item updated on server successfully",
        });
      }
    }
  } catch (error) {
    console.error('Error saving item to API:', error);
    if (toast) {
      toast({
        title: "Save Failed",
        description: `Failed to save to server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  }
};

export const deleteItemFromAPI = async (
  itemId: string,
  syncMode: boolean,
  toast?: any
) => {
  if (!syncMode) return;

  try {
    await pricesheetAPI.deletePricesheetItem(itemId);
  } catch (error) {
    console.error('Error deleting item from API:', error);
    if (toast) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete from server. Removed locally.",
        variant: "destructive"
      });
    }
  }
};
