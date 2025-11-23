// Pricesheet API service
import { API_CONFIG } from '../config/api';

let API_BASE_URL = API_CONFIG.BASE_URL;

export interface PricesheetItem {
  _id: string;
  name: string;
  price: number;
  category?: string;
  createdBy: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreatePricesheetItemRequest {
  name: string;
  price: number;
  category?: string;
}

export interface UpdatePricesheetItemRequest {
  name: string;
  price: number;
  category?: string;
}

export interface PricesheetResponse {
  success: boolean;
  message?: string;
  data?: PricesheetItem | PricesheetItem[];
  error?: string;
}

class PricesheetAPI {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  // Create a new pricesheet item
  async createPricesheetItem(itemData: CreatePricesheetItemRequest): Promise<PricesheetItem> {
    console.log('Creating pricesheet item:', itemData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pricesheets`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(itemData),
      });

      const result = await this.handleResponse<PricesheetItem>(response);
      console.log('Create pricesheet item result:', result);
      
      return result;
    } catch (error) {
      console.error('Create pricesheet item failed:', error);
      throw error;
    }
  }

  // Get all pricesheet items for current user
  async getPricesheetItems(): Promise<PricesheetItem[]> {
    console.log('Fetching pricesheet items');
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/pricesheets?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const items = await this.handleResponse<PricesheetItem[]>(response);
      console.log('Get pricesheet items result:', items);
      
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Get pricesheet items failed:', error);
      throw error;
    }
  }

  // Get all pricesheet items (admin endpoint)
  async getAllPricesheetItems(): Promise<PricesheetItem[]> {
    console.log('Fetching all pricesheet items');
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/pricesheets/all?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<PricesheetResponse>(response);
      console.log('Get all pricesheet items result:', result);
      
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [result.data];
      }
      
      return [];
    } catch (error) {
      console.error('Get all pricesheet items failed:', error);
      throw error;
    }
  }

  // Get a specific pricesheet item by ID
  async getPricesheetItemById(id: string): Promise<PricesheetItem> {
    console.log('Fetching pricesheet item:', id);
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/pricesheets/${id}?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<PricesheetResponse>(response);
      console.log('Get pricesheet item by ID result:', result);
      
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data[0] : result.data;
      }
      
      throw new Error(result.message || 'Pricesheet item not found');
    } catch (error) {
      console.error('Get pricesheet item by ID failed:', error);
      throw error;
    }
  }

  // Update a pricesheet item
  async updatePricesheetItem(id: string, itemData: UpdatePricesheetItemRequest): Promise<PricesheetItem> {
    console.log('Updating pricesheet item:', id, itemData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pricesheets/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(itemData),
      });

      const result = await this.handleResponse<PricesheetItem>(response);
      console.log('Update pricesheet item result:', result);
      
      return result;
    } catch (error) {
      console.error('Update pricesheet item failed:', error);
      throw error;
    }
  }

  // Delete a pricesheet item
  async deletePricesheetItem(id: string): Promise<boolean> {
    console.log('Deleting pricesheet item:', id);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pricesheets/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<{message: string}>(response);
      console.log('Delete pricesheet item result:', result);
      
      return true;
    } catch (error) {
      console.error('Delete pricesheet item failed:', error);
      throw error;
    }
  }
}

export const pricesheetAPI = new PricesheetAPI();
