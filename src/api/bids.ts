// Frontend API service for bids
import { API_CONFIG } from '../config/api';

let API_BASE_URL = API_CONFIG.BASE_URL;

export interface BidItem {
  id: string;
  name: string;
  measurement: string;
  price: number;
  pricing: number;
  proposedBid: number;
  quantity?: number;
  unit?: string;
  description?: string;
  category?: string;
  notes?: string;
}

export interface DemolitionItem {
  id: string;
  name: string;
  measurement: string;
  price: number;
  proposedBid: number;
  category?: string;
  notes?: string;
}

export interface BidDetails {
  id: string;
  projectName: string;
  client: string;
  createdDate: string;
  amount: string;
  status: 'pending' | 'approved' | 'denied';
  description?: string;
  documents?: number;
  documentsData?: BidDocument[];
  location?: string;
  dueDate?: string;
  userId?: string;
  items?: BidItem[];
  aiExtractedData?: {
    projectName?: string;
    clientName?: string;
    description?: string;
    location?: string;
    estimatedStartDate?: string;
    budgetEstimates?: {
      totalEstimatedCost?: number;
      breakdown?: BidItem[];
    };
    extractedItems?: BidItem[];
  };
}

export interface BidDocument {
  _id: string;
  public_id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Bid {
  id: string;
  projectName: string;
  client: string;
  createdDate: string;
  amount: string;
  status: 'pending' | 'approved' | 'denied';
  description?: string;
  documents?: number;
  documentsData?: BidDocument[];
  location?: string;
  dueDate?: string;
  userId?: string;
}

export interface CreateBidRequest {
  projectName: string;
  client: string;
  amount: string;
  description?: string;
  location?: string;
  dueDate?: string;
}

export interface CreateBidWithDocumentRequest extends CreateBidRequest {
  document: File;
}

export interface BidResponse {
  success: boolean;
  bid?: Bid;
  bids?: Bid[];
  message?: string;
}

export interface UpdateBidRequest {
  projectName?: string;
  client?: string;
  amount?: string;
  description?: string;
  location?: string;
  dueDate?: string;
  status?: 'pending' | 'approved' | 'denied';
}

export interface BidItemOperation {
  type: 'add' | 'update' | 'delete';
  item?: BidItem | Partial<BidItem>;
  itemId?: string;
}

export interface BulkUpdateBidItemsRequest {
  operations: BidItemOperation[];
  timestamp?: string;
}

class BidAPI {
  // Helper method to map demolition items to BidItem format for Bid Data Sheet
  private mapDemolitionItemsToBidItems(demolitionData: any[]): BidItem[] {
    console.log('🔍 Starting mapDemolitionItemsToBidItems with data:', demolitionData);
    
    return demolitionData.map((item: any, index: number) => {
      console.log(`🔍 Mapping item ${index + 1}:`, item);
      
      // Handle the structure from the demo file and backend saved data
      const originalData = item.originalData || {};
      const itemName = item.name || item.description || originalData.description || 'Unnamed Item';
      const category = originalData.category || item.category || 'Demolition';
      
      // Extract measurements first
      const measurements = item.measurements || originalData.measurements || {};
      const quantity = parseInt(measurements.quantity || item.quantity || '1') || 1;
      const unit = measurements.unit || item.unit || originalData.measurements?.unit || 'Each';
      const measurement = item.measurement || unit || 'TBD';
      
      // Extract price data with priority for calculated values
      // Priority 1: calculatedUnitPrice (most accurate)
      // Priority 2: priceCalculation.unitPrice
      // Priority 3: pricesheetMatch.itemPrice
      // Priority 4: Legacy fields
      let unitPrice = 0;
      if (item.calculatedUnitPrice && !isNaN(Number(item.calculatedUnitPrice))) {
        unitPrice = Number(item.calculatedUnitPrice);
      } else if (item.priceCalculation?.unitPrice && !isNaN(Number(item.priceCalculation.unitPrice))) {
        unitPrice = Number(item.priceCalculation.unitPrice);
      } else if (item.pricesheetMatch?.itemPrice && !isNaN(Number(item.pricesheetMatch.itemPrice))) {
        unitPrice = Number(item.pricesheetMatch.itemPrice);
      } else {
        // Fallback to legacy fields
        const priceFields = [item.pricing, item.unitPrice, item.price, originalData.price];
        unitPrice = priceFields.reduce((result, field) => {
          if (result > 0) return result;
          const parsed = parseFloat(String(field || '0'));
          return !isNaN(parsed) && parsed > 0 ? parsed : result;
        }, 0);
      }
      
      // Extract total price with priority for calculated values
      // Priority 1: calculatedTotalPrice (most accurate)
      // Priority 2: priceCalculation.totalPrice
      // Priority 3: Calculate from unitPrice * quantity
      // Priority 4: Legacy fields
      let totalPrice = 0;
      if (item.calculatedTotalPrice && !isNaN(Number(item.calculatedTotalPrice))) {
        totalPrice = Number(item.calculatedTotalPrice);
      } else if (item.priceCalculation?.totalPrice && !isNaN(Number(item.priceCalculation.totalPrice))) {
        totalPrice = Number(item.priceCalculation.totalPrice);
      } else if (unitPrice > 0) {
        totalPrice = unitPrice * quantity;
      } else {
        // Fallback to legacy fields
        const proposedBidFields = [item.totalPrice, item.proposedBid, item.pricing, originalData.proposedBid];
        totalPrice = proposedBidFields.reduce((result, field) => {
          if (result > 0) return result;
          const parsed = parseFloat(String(field || '0'));
          return !isNaN(parsed) && parsed > 0 ? parsed : result;
        }, 0);
      }
      
      const mappedItem = {
        id: item.itemNumber || item.id || item._id || crypto.randomUUID(),
        name: itemName,
        measurement: measurement,
        price: unitPrice, // Use calculated unit price
        pricing: unitPrice, // Also set pricing field
        proposedBid: totalPrice, // Use calculated total price
        category: category,
        quantity: quantity,
        unit: unit,
        description: item.notes || item.description || originalData.description || itemName,
        // Preserve all the new backend structure fields for proper price display
        calculatedUnitPrice: item.calculatedUnitPrice,
        calculatedTotalPrice: item.calculatedTotalPrice,
        pricesheetMatch: item.pricesheetMatch,
        priceCalculation: item.priceCalculation,
        measurements: item.measurements
      };
      
      console.log(`✅ Mapped item ${index + 1}:`, mappedItem);
      console.log(`💰 Unit price: ${unitPrice}, Total price: ${totalPrice}`);
      console.log(`📊 Quantity: ${quantity}, Unit: ${unit}`);
      console.log(`🔍 Original calculated values:`, {
        calculatedUnitPrice: item.calculatedUnitPrice,
        calculatedTotalPrice: item.calculatedTotalPrice,
        pricesheetMatch: item.pricesheetMatch,
        priceCalculation: item.priceCalculation
      });
      console.log(`🎯 Final mapped values:`, {
        price: mappedItem.price,
        pricing: mappedItem.pricing,
        proposedBid: mappedItem.proposedBid,
        calculatedUnitPrice: mappedItem.calculatedUnitPrice,
        calculatedTotalPrice: mappedItem.calculatedTotalPrice
      });
      
      return mappedItem;
    });
  }

  // Helper method to map BidItem categories to backend demolitionItem categories
  private mapCategoryForBackend(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'General': 'other',
      'Regular': 'other',
      'Demolition': 'structural',
      'Electrical': 'electrical',
      'Plumbing': 'plumbing',
      'HVAC': 'hvac',
      'MEP': 'electrical',
      'Mechanical': 'mechanical',
      'Storefront': 'storefront',
      'Signage': 'signage',
      'Fire Protection': 'fire protection',
      'Wall': 'wall',
      'Ceiling': 'ceiling',
      'Floor': 'floor',
      'Door': 'door',
      'Window': 'window',
      'Fixture': 'fixture',
      'Cleanup': 'cleanup',
      'Structural': 'structural',
      'Interior': 'interior',
      'Exterior': 'exterior'
    };
    
    // Normalize the category
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    return categoryMap[normalizedCategory] || 'other';
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private getFetchOptions(includeAuth = true): RequestInit {
    return {
      headers: this.getHeaders(includeAuth),
      credentials: 'include', // Always include cookies for session management
      mode: 'cors',
      cache: 'no-cache',
    };
  }

  private getMultipartHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.log('Failed to parse error JSON:', e);
        }
      } else {
        try {
          const textError = await response.text();
          console.log('Error response text:', textError);
          if (textError) errorMessage = textError;
        } catch (e) {
          console.log('Failed to read error text:', e);
        }
      }
      
      console.error('API Error:', { status: response.status, message: errorMessage });
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Success response:', jsonData);
      return jsonData;
    } else {
      const textData = await response.text();
      console.log('Success text response:', textData);
      return { success: true, message: textData } as T;
    }
  }

  async createBid(data: CreateBidRequest): Promise<BidResponse> {
    console.log('Creating bid:', data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Create bid result:', result);
      return result;
    } catch (error) {
      console.error('Create bid failed:', error);
      throw error;
    }
  }

  async createBidWithDocument(data: CreateBidWithDocumentRequest): Promise<BidResponse> {
    console.log('Creating bid with document:', data.projectName);
    
    try {
      const formData = new FormData();
      formData.append('projectName', data.projectName);
      formData.append('client', data.client);
      formData.append('amount', data.amount);
      if (data.description) formData.append('description', data.description);
      if (data.location) formData.append('location', data.location);
      if (data.dueDate) formData.append('dueDate', data.dueDate);
      formData.append('document', data.document);

      const response = await fetch(`${API_BASE_URL}/bids/with-document`, {
        method: 'POST',
        headers: this.getMultipartHeaders(),
        credentials: 'include',
        body: formData,
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Create bid with document result:', result);
      return result;
    } catch (error) {
      console.error('Create bid with document failed:', error);
      throw error;
    }
  }

  async getBids(): Promise<any> {
    console.log('Fetching bids...');
    console.log('API Base URL:', API_BASE_URL);
    
    try {
      // Add cache-busting parameter
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/bids?${cacheBuster}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await this.handleResponse<any>(response);
      console.log('Get bids result:', result);
      return result;
    } catch (error) {
      console.error('Get bids failed:', error);
      throw error;
    }
  }

  async getBidById(id: string): Promise<any> {
    console.log('Fetching bid by id:', id);
    console.log('API Base URL:', API_BASE_URL);
    
    try {
      // Add cache-busting parameter
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/bids/${id}?${cacheBuster}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await this.handleResponse<any>(response);
      console.log('Get bid by id result:', result);
      
      // Handle different response structures
      if (result.data) {
        return result.data; // If the API returns { success: true, data: bid }
      } else if (result.bid) {
        return result.bid; // If the API returns { bid: bid }
      } else if (result._id || result.id) {
        return result; // If the API returns the bid directly
      } else {
        throw new Error('No bid data found in API response');
      }
    } catch (error) {
      console.error('Get bid by id failed:', error);
      throw error;
    }
  }

  async updateBid(id: string, data: UpdateBidRequest): Promise<BidResponse> {
    console.log('Updating bid:', id, data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Update bid result:', result);
      return result;
    } catch (error) {
      console.error('Update bid failed:', error);
      throw error;
    }
  }

  async deleteBid(id: string): Promise<BidResponse> {
    console.log('Deleting bid:', id);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Delete bid result:', result);
      return result;
    } catch (error) {
      console.error('Delete bid failed:', error);
      throw error;
    }
  }

  // Get bid details with items and AI data for sheet/table display
  async getBidDetails(id: string): Promise<BidDetails> {
    console.log('Fetching bid details:', id);
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/bids/${id}/details?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<any>(response);
      console.log('Get bid details result:', result);
      
      return result.data || result;
    } catch (error) {
      console.error('Get bid details failed:', error);
      throw error;
    }
  }

  // Update bid items array after user modifications (handles both editing existing items and adding new ones)
  // Data flow: Frontend BidItem[] -> Backend aiExtractedData.demolitionItems[]
  // This stores the updated/new items in the aiExtractedData.demolitionItems field instead of root demolitionItems
  async updateBidItems(id: string, items: BidItem[]): Promise<BidResponse> {
    console.log('🔄 Starting updateBidItems:', { bidId: id, itemCount: items.length });
    
    // Validate input data
    if (!id || !Array.isArray(items)) {
      const error = new Error('Invalid parameters: bidId and items array are required');
      console.error('❌ Validation failed:', error.message);
      throw error;
    }

    // Process items and convert BidItem format to demolitionItem format for backend
    const demolitionItems = items.map((item, index) => {
      // Check if this is a new item (no ID, temp ID, or new_ prefix)
      const isNewItem = !item.id || item.id.startsWith('temp_') || item.id.startsWith('new_');
      const itemId = isNewItem ? `bid_item_${Date.now()}_${index}` : item.id;
      
      // Convert BidItem to demolitionItem format expected by backend
      const demolitionItem = {
        itemNumber: itemId,
        description: (item.description || item.name || '').trim() || 'No description',
        category: this.mapCategoryForBackend(item.category || 'other'),
        action: 'Remove', // Default action, can be customized later
        measurements: {
          quantity: String(item.quantity || 1),
          unit: (item.unit || item.measurement || '').trim() || 'Each',
          dimensions: null
        },
        pricing: String(item.price || 0),
        location: null,
        specifications: null,
        notes: (item.description || '').trim() || null,
        unitPrice: String(item.price || 0),
        totalPrice: String(item.proposedBid || item.price || 0),
        isActive: true,
        // Keep original data for reference
        originalBidItem: {
          id: item.id,
          name: item.name,
          measurement: item.measurement,
          price: item.price,
          proposedBid: item.proposedBid,
          category: item.category
        }
      };
      
      console.log(`📋 Converted item ${index + 1}:`, {
        bidItem: { id: item.id, name: item.name },
        demolitionItem: { itemNumber: demolitionItem.itemNumber, description: demolitionItem.description }
      });
      
      return demolitionItem;
    });
    
    console.log('📊 Converted items breakdown:', {
      total: demolitionItems.length,
      categories: [...new Set(demolitionItems.map(item => item.category))]
    });
    
    try {
      const requestPayload = { 
        // Send in the format the current backend expects
        demolitionItems: demolitionItems,
        // Also provide the target location for the backend to store
        targetLocation: 'aiExtractedData.demolitionItems',
        operation: 'update_ai_extracted_demolition_items',
        summary: {
          total: demolitionItems.length,
          timestamp: new Date().toISOString(),
          target: 'aiExtractedData.demolitionItems'
        }
      };
      
      console.log('🚀 Sending PUT request to:', `${API_BASE_URL}/bids/${id}/items`);
      console.log('📦 Request payload (compatible format):', JSON.stringify(requestPayload, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/bids/${id}/items`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(requestPayload),
      });

      console.log('📡 PUT API response status:', response.status);
      console.log('📡 PUT API response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PUT API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API Error ${response.status}: ${response.statusText}. ${errorText}`);
      }

      const result = await this.handleResponse<BidResponse>(response);
      console.log('✅ Update bid items successful:', {
        success: true,
        itemsUpdated: demolitionItems.length,
        result: result
      });
      
      return result;
    } catch (error) {
      console.error('❌ Update bid items failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  // Add a single new bid item to an existing bid
  async addBidItem(bidId: string, item: Omit<BidItem, 'id'>): Promise<BidResponse> {
    console.log('Adding new bid item:', bidId, item);
    
    // Validate input data
    if (!bidId || !item) {
      throw new Error('Invalid parameters: bidId and item data are required');
    }

    // Convert BidItem to demolitionItem format for backend
    const demolitionItem = {
      itemNumber: `new_${Date.now()}`,
      description: (item.description || item.name || '').trim() || 'New Item',
      category: this.mapCategoryForBackend(item.category || 'other'),
      action: 'Remove',
      measurements: {
        quantity: String(item.quantity || 1),
        unit: (item.unit || item.measurement || '').trim() || 'Each',
        dimensions: null
      },
      pricing: String(item.price || 0),
      location: null,
      specifications: null,
      notes: (item.description || '').trim() || null,
      unitPrice: String(item.price || 0),
      totalPrice: String(item.proposedBid || item.price || 0),
      isActive: true
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${bidId}/items`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ 
          // Send in the format the current backend expects
          demolitionItems: [demolitionItem],
          targetLocation: 'aiExtractedData.demolitionItems',
          operation: 'add_to_ai_extracted_demolition_items',
          timestamp: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Add bid item result:', result);
      return result;
    } catch (error) {
      console.error('Add bid item failed:', error);
      throw error;
    }
  }

  // Update a single existing bid item
  async updateSingleBidItem(bidId: string, itemId: string, item: Partial<BidItem>): Promise<BidResponse> {
    console.log('Updating single bid item:', bidId, itemId, item);
    
    // Validate input data
    if (!bidId || !itemId || !item) {
      throw new Error('Invalid parameters: bidId, itemId, and item data are required');
    }

    // Convert partial BidItem updates to demolitionItem format
    const demolitionUpdate: any = {};
    
    if (item.name !== undefined) demolitionUpdate.description = item.name;
    if (item.description !== undefined) demolitionUpdate.description = item.description;
    if (item.category !== undefined) demolitionUpdate.category = this.mapCategoryForBackend(item.category);
    if (item.price !== undefined) {
      demolitionUpdate.pricing = String(item.price);
      demolitionUpdate.unitPrice = String(item.price);
    }
    if (item.proposedBid !== undefined) demolitionUpdate.totalPrice = String(item.proposedBid);
    if (item.quantity !== undefined || item.unit !== undefined || item.measurement !== undefined) {
      demolitionUpdate.measurements = {
        quantity: item.quantity ? String(item.quantity) : undefined,
        unit: item.unit || item.measurement || undefined,
        dimensions: null
      };
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${bidId}/items/${itemId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ 
          // Send in the format the current backend expects
          demolitionItems: [demolitionUpdate],
          targetLocation: 'aiExtractedData.demolitionItems',
          operation: 'update_single_ai_extracted_item',
          itemId: itemId,
          timestamp: new Date().toISOString()
        }),
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Update single bid item result:', result);
      return result;
    } catch (error) {
      console.error('Update single bid item failed:', error);
      throw error;
    }
  }

  // Delete a bid item
  async deleteBidItem(bidId: string, itemId: string): Promise<BidResponse> {
    console.log('Deleting bid item:', bidId, itemId);
    
    // Validate input data
    if (!bidId || !itemId) {
      throw new Error('Invalid parameters: bidId and itemId are required');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${bidId}/items/${itemId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Delete bid item result:', result);
      return result;
    } catch (error) {
      console.error('Delete bid item failed:', error);
      throw error;
    }
  }

  // Bulk update bid items with specific operations
  async bulkUpdateBidItems(bidId: string, operations: BidItemOperation[]): Promise<BidResponse> {
    console.log('Bulk updating bid items:', bidId, operations);
    
    // Validate input data
    if (!bidId || !Array.isArray(operations)) {
      throw new Error('Invalid parameters: bidId and operations array are required');
    }

    const request: BulkUpdateBidItemsRequest = {
      operations,
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${bidId}/items/bulk`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('Bulk update bid items result:', result);
      return result;
    } catch (error) {
      console.error('Bulk update bid items failed:', error);
      throw error;
    }
  }

  // Download bid document as PDF
  async downloadBidDocument(id: string): Promise<Blob> {
    console.log('Downloading bid document:', id);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${id}/document`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Download bid document result: blob received');
      return blob;
    } catch (error) {
      console.error('Download bid document failed:', error);
      throw error;
    }
  }

  // Get demolition items from AI extracted data, mapped to BidItem format for Bid Data Sheet
  async getDemolitionItems(id: string): Promise<BidItem[]> {
    console.log('Fetching demolition items:', id);
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/bids/${id}/demolition-items?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<any>(response);
      console.log('Get demolition items result:', result);
      
      // Extract the demolition items from the response structure
      // Check multiple possible locations including aiExtractedData
      let demolitionData = [];
      if (result.aiExtractedData && result.aiExtractedData.demolitionItems && Array.isArray(result.aiExtractedData.demolitionItems)) {
        // Priority: Check aiExtractedData.demolitionItems first (new structure)
        demolitionData = result.aiExtractedData.demolitionItems;
        console.log('📍 Found demolition items in aiExtractedData.demolitionItems');
      } else if (result.demolitionItems && Array.isArray(result.demolitionItems)) {
        // Fallback: Check root level demolitionItems (old structure)
        demolitionData = result.demolitionItems;
        console.log('📍 Found demolition items in root demolitionItems');
      } else if (result.data && Array.isArray(result.data)) {
        demolitionData = result.data;
        console.log('📍 Found demolition items in data array');
      } else if (result.items && Array.isArray(result.items)) {
        demolitionData = result.items;
        console.log('📍 Found demolition items in items array');
      } else if (Array.isArray(result)) {
        demolitionData = result;
        console.log('📍 Found demolition items as direct array');
      }
      
      console.log('Extracted demolition data:', demolitionData);
      
      // Map demolition items to BidItem format for Bid Data Sheet
      const mappedItems = Array.isArray(demolitionData) 
        ? this.mapDemolitionItemsToBidItems(demolitionData) 
        : [];
      
      console.log('Mapped demolition items for Bid Data Sheet:', mappedItems);
      return mappedItems;
    } catch (error) {
      console.error('Get demolition items failed:', error);
      throw error;
    }
  }

  // Get demolition items in original DemolitionItem format
  async getDemolitionItemsOriginal(id: string): Promise<DemolitionItem[]> {
    console.log('Fetching demolition items (original format):', id);
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/bids/${id}/demolition-items?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<any>(response);
      console.log('Get demolition items (original format) result:', result);
      
      return result.data || result.items || result;
    } catch (error) {
      console.error('Get demolition items (original format) failed:', error);
      throw error;
    }
  }

  // Update specific demolition item
  async updateDemolitionItem(bidId: string, itemId: string, itemData: Partial<DemolitionItem>): Promise<BidResponse> {
    console.log('🔄 Updating demolition item:', { bidId, itemId, itemData });
    
    // Transform the data to match backend schema structure
    const backendData = {
      // Core item data
      description: itemData.name || '',
      action: 'Remove', // Default action
      category: itemData.category || 'demolition',
      
      // Measurements object structure
      measurements: {
        quantity: '1', // Default quantity
        unit: itemData.measurement || 'Each',
        dimensions: null
      },
      
      // Pricing as strings (backend expects strings)
      pricing: String(itemData.price || 0),
      unitPrice: String(itemData.price || 0),
      totalPrice: String(itemData.proposedBid || itemData.price || 0),
      
      // Additional fields
      location: null,
      specifications: null,
      notes: itemData.notes || null,
      isActive: true,
      
      // Keep original structure for compatibility
      name: itemData.name || '',
      measurement: itemData.measurement || '',
      price: Number(itemData.price || 0),
      proposedBid: Number(itemData.proposedBid || 0)
    };
    
    console.log('📦 Transformed data for backend:', backendData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${bidId}/demolition-items/${itemId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(backendData),
      });

      const result = await this.handleResponse<BidResponse>(response);
      console.log('✅ Update demolition item result:', result);
      return result;
    } catch (error) {
      console.error('❌ Update demolition item failed:', error);
      throw error;
    }
  }

  // Create a new demolition item
  async addDemolitionItem(bidId: string, itemData: { name: string; measurement: string; unitPrice: string | number; proposedBid: number; }): Promise<BidResponse> {
    console.log('➕ Adding demolition item:', { bidId, itemData });
    const backendData = {
      description: itemData.name || '',
      action: 'Remove',
      category: 'demolition',
      measurements: {
        quantity: (itemData.measurement?.split(' ')?.[0] || '1'),
        unit: (itemData.measurement?.split(' ')?.[1] || 'EA'),
        dimensions: null
      },
      pricing: String(itemData.unitPrice || 0),
      unitPrice: String(itemData.unitPrice || 0),
      totalPrice: String(itemData.proposedBid || 0),
      location: null,
      specifications: null,
      notes: null,
      isActive: true,
      name: itemData.name,
      measurement: itemData.measurement,
      price: Number(itemData.unitPrice || 0),
      proposedBid: Number(itemData.proposedBid || 0)
    };
    try {
      const response = await fetch(`${API_BASE_URL}/bids/${bidId}/demolition-items`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(backendData)
      });
      const result = await this.handleResponse<BidResponse>(response);
      console.log('✅ Add demolition item result:', result);
      return result;
    } catch (error) {
      console.error('❌ Add demolition item failed:', error);
      throw error;
    }
  }
}

export const bidAPI = new BidAPI();
