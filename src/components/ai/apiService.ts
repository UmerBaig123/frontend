import { pricesheetAPI, PricesheetItem } from "@/api/pricesheet";
import { DataItem } from "./types";

// Map API response to DataItem
export const mapPricesheetItemToDataItem = (item: PricesheetItem): DataItem => ({
  id: item._id,
  name: item.name,
  price: item.price,
  category: item.category || '',
});

// Map DataItem to API request
export const mapDataItemToCreateRequest = (item: DataItem) => ({
  name: item.name,
  price: item.price,
  category: item.category || '',
});

export const mapDataItemToUpdateRequest = (item: DataItem) => ({
  name: item.name,
  price: item.price,
  category: item.category || '',
});

// Load data from API
export const loadDataFromAPI = async (
  setData: (data: DataItem[]) => void,
  setLoading: (loading: boolean) => void,
  onDataChange?: (data: DataItem[]) => void,
  toast?: any
): Promise<void> => {
  console.log('Loading data from API...');
  setLoading(true);
  
  try {
    const items = await pricesheetAPI.getPricesheetItems();
    console.log('Loaded items from API:', items);
    
    const mappedData: DataItem[] = items.map(mapPricesheetItemToDataItem);
    
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
    
    // Fallback to localStorage on API failure
    const savedData = localStorage.getItem('pricesheet-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        onDataChange?.(parsedData);
      } catch (parseError) {
        console.error('Error parsing localStorage data:', parseError);
        setData([]);
        onDataChange?.([]);
      }
    } else {
      setData([]);
      onDataChange?.([]);
    }
  } finally {
    setLoading(false);
  }
};

// Create new item via API
export const createItemViaAPI = async (
  item: DataItem,
  onSuccess: (newItem: DataItem) => void,
  toast?: any
): Promise<void> => {
  try {
    const createRequest = mapDataItemToCreateRequest(item);
    const createdItem = await pricesheetAPI.createPricesheetItem(createRequest);
    const mappedItem = mapPricesheetItemToDataItem(createdItem);
    
    onSuccess(mappedItem);
    
    if (toast) {
      toast({
        title: "Item Created",
        description: "The item has been created successfully",
      });
    }
  } catch (error) {
    console.error('Error creating item:', error);
    if (toast) {
      toast({
        title: "Create Failed",
        description: `Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
    throw error;
  }
};

// Update item via API
export const updateItemViaAPI = async (
  item: DataItem,
  onSuccess: (updatedItem: DataItem) => void,
  toast?: any
): Promise<void> => {
  try {
    const updateRequest = mapDataItemToUpdateRequest(item);
    const updatedItem = await pricesheetAPI.updatePricesheetItem(item.id, updateRequest);
    const mappedItem = mapPricesheetItemToDataItem(updatedItem);
    
    onSuccess(mappedItem);
    
    if (toast) {
      toast({
        title: "Item Updated",
        description: "The item has been updated successfully",
      });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    if (toast) {
      toast({
        title: "Update Failed",
        description: `Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
    throw error;
  }
};

// Delete item via API
export const deleteItemViaAPI = async (
  itemId: string,
  onSuccess: () => void,
  toast?: any
): Promise<void> => {
  try {
    await pricesheetAPI.deletePricesheetItem(itemId);
    
    onSuccess();
    
    if (toast) {
      toast({
        title: "Item Deleted",
        description: "The item has been deleted successfully",
      });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    if (toast) {
      toast({
        title: "Delete Failed",
        description: `Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
    throw error;
  }
};

// Save data to localStorage as backup
export const saveToLocalStorage = (data: DataItem[]): void => {
  try {
    localStorage.setItem('pricesheet-data', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};
