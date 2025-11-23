// Frontend API service for dashboard
import { API_CONFIG } from '../config/api';

let API_BASE_URL = API_CONFIG.BASE_URL;

export interface DashboardDataResponse {
  success: boolean;
  data?: {
    totalRevenue?: number;
    activeProjects?: number;
    bidWinRate?: number;
    [key: string]: any;
  };
  message?: string;
}

export interface DashboardChartsResponse {
  success: boolean;
  data?: Array<{ name: string; value: number }>; // normalized chart points
  message?: string;
}

class DashboardAPI {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const err = contentType?.includes('application/json') ? await response.json() : await response.text();
        message = (err?.message as string) || (typeof err === 'string' ? err : message);
      } catch {}
      throw new Error(message);
    }
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return ({ success: true } as unknown) as T;
  }

  async getDashboardData(): Promise<DashboardDataResponse> {
    const res = await fetch(`${API_BASE_URL}/dashboard/data`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });
    return this.handleResponse<DashboardDataResponse>(res);
  }

  async getDashboardCharts(period: 'year' | 'month' | 'week' = 'month'): Promise<DashboardChartsResponse> {
    const res = await fetch(`${API_BASE_URL}/dashboard/charts?period=${encodeURIComponent(period)}`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });
    return this.handleResponse<DashboardChartsResponse>(res);
  }
}

export const dashboardAPI = new DashboardAPI();
