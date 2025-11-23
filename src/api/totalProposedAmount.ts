// API service for Total Proposed Amount endpoints
import { API_CONFIG } from '../config/api';

let API_BASE_URL = API_CONFIG.BASE_URL;

export interface TotalProposedAmountResponse {
  success: boolean;
  data?: {
    bidId: string;
    totalProposedAmount: number;
    lastUpdated: string;
    calculatedFrom?: {
      demolitionItems: number;
      manualItems: number;
      totalItems: number;
    };
  };
  message?: string;
}

export interface SetTotalProposedAmountRequest {
  totalProposedAmount: number;
  source?: 'manual' | 'calculated' | 'api';
  notes?: string;
}

export interface CalculateTotalProposedAmountRequest {
  demolitionItems: any[];
  manualItems: any[];
  forceRecalculate?: boolean;
}

class TotalProposedAmountAPI {
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
      
      console.error('Total Proposed Amount API Error:', { status: response.status, message: errorMessage });
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Total Proposed Amount API Success response:', jsonData);
      return jsonData;
    } else {
      const textData = await response.text();
      console.log('Total Proposed Amount API Success text response:', textData);
      return { success: true, message: textData } as T;
    }
  }

  /**
   * Get the current total proposed amount for a bid
   */
  async getTotalProposedAmount(bidId: string): Promise<TotalProposedAmountResponse> {
    console.log('Getting total proposed amount for bid:', bidId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/total-proposed-amount/${bidId}`, {
        method: 'GET',
        ...this.getFetchOptions(),
      });

      const result = await this.handleResponse<TotalProposedAmountResponse>(response);
      console.log('Get total proposed amount result:', result);
      return result;
    } catch (error) {
      console.error('Get total proposed amount failed:', error);
      throw error;
    }
  }

  /**
   * Set/update the total proposed amount for a bid
   */
  async setTotalProposedAmount(bidId: string, data: SetTotalProposedAmountRequest): Promise<TotalProposedAmountResponse> {
    console.log('Setting total proposed amount for bid:', bidId, data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/total-proposed-amount/${bidId}`, {
        method: 'POST',
        ...this.getFetchOptions(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<TotalProposedAmountResponse>(response);
      console.log('Set total proposed amount result:', result);
      return result;
    } catch (error) {
      console.error('Set total proposed amount failed:', error);
      throw error;
    }
  }

  /**
   * Update the total proposed amount for a bid
   */
  async updateTotalProposedAmount(bidId: string, data: SetTotalProposedAmountRequest): Promise<TotalProposedAmountResponse> {
    console.log('Updating total proposed amount for bid:', bidId, data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/total-proposed-amount/${bidId}`, {
        method: 'PUT',
        ...this.getFetchOptions(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<TotalProposedAmountResponse>(response);
      console.log('Update total proposed amount result:', result);
      return result;
    } catch (error) {
      console.error('Update total proposed amount failed:', error);
      throw error;
    }
  }

  /**
   * Calculate total proposed amount based on demolition and manual items
   */
  async calculateTotalProposedAmount(bidId: string, data: CalculateTotalProposedAmountRequest): Promise<TotalProposedAmountResponse> {
    console.log('Calculating total proposed amount for bid:', bidId, data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/total-proposed-amount/${bidId}/calculate`, {
        method: 'POST',
        ...this.getFetchOptions(),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<TotalProposedAmountResponse>(response);
      console.log('Calculate total proposed amount result:', result);
      return result;
    } catch (error) {
      console.error('Calculate total proposed amount failed:', error);
      throw error;
    }
  }

  /**
   * Clear/reset the total proposed amount for a bid
   */
  async clearTotalProposedAmount(bidId: string): Promise<TotalProposedAmountResponse> {
    console.log('Clearing total proposed amount for bid:', bidId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/total-proposed-amount/${bidId}`, {
        method: 'DELETE',
        ...this.getFetchOptions(),
      });

      const result = await this.handleResponse<TotalProposedAmountResponse>(response);
      console.log('Clear total proposed amount result:', result);
      return result;
    } catch (error) {
      console.error('Clear total proposed amount failed:', error);
      throw error;
    }
  }

  /**
   * Helper method to calculate total from items (client-side calculation)
   * This can be used as a fallback or for immediate UI updates
   */
  calculateTotalFromItems(demolitionItems: any[], manualItems: any[], getItemProposedBid: (item: any) => number): number {
    const total = [...demolitionItems, ...manualItems]
      .reduce((total, item) => total + getItemProposedBid(item), 0);
    
    console.log('Client-side total calculation:', {
      demolitionItems: demolitionItems.length,
      manualItems: manualItems.length,
      total
    });
    
    return total;
  }
}

export const totalProposedAmountAPI = new TotalProposedAmountAPI();
