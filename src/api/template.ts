// Frontend API service for templates
import { API_CONFIG } from '../config/api';

let API_BASE_URL = API_CONFIG.BASE_URL;

export interface Template {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  size?: number;
  url?: string;
  userId?: string;
}

export interface TemplateResponse {
  success: boolean;
  template?: Template;
  templates?: Template[];
  message?: string;
}

class TemplateAPI {
  private getHeaders(includeAuth = true, includeContentType = true): HeadersInit {
    const headers: HeadersInit = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

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
      
      console.error('Template API Error:', { status: response.status, message: errorMessage });
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Template API Success response:', jsonData);
      return jsonData;
    } else {
      const textData = await response.text();
      console.log('Template API Success text response:', textData);
      return { success: true, message: textData } as T;
    }
  }

  async uploadTemplate(file: File): Promise<TemplateResponse> {
    console.log('Uploading template file:', file.name, file.size, file.type);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Auth token exists:', !!localStorage.getItem('auth_token'));
    
    try {
      const formData = new FormData();
      formData.append('template', file);

      const response = await fetch(`${API_BASE_URL}/templates/upload`, {
        method: 'POST',
        headers: this.getHeaders(true, false), // Auth but no Content-Type for FormData
        credentials: 'include',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

      const result = await this.handleResponse<TemplateResponse>(response);
      console.log('Upload template result:', result);
      return result;
    } catch (error) {
      console.error('Upload template failed:', error);
      throw error;
    }
  }

  async getTemplates(): Promise<TemplateResponse> {
    console.log('Fetching templates...');
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/templates?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<TemplateResponse>(response);
      console.log('Get templates result:', result);
      return result;
    } catch (error) {
      console.error('Get templates failed:', error);
      throw error;
    }
  }

  async getTemplateById(id: string): Promise<Template> {
    console.log('Fetching template by id:', id);
    
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/templates/${id}?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<TemplateResponse>(response);
      console.log('Get template by id result:', result);
      
      if (result.template) {
        return result.template;
      } else if (result.id) {
        return result as Template;
      } else {
        throw new Error('No template data found in API response');
      }
    } catch (error) {
      console.error('Get template by id failed:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<TemplateResponse> {
    console.log('Deleting template:', id);
    
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<TemplateResponse>(response);
      console.log('Delete template result:', result);
      return result;
    } catch (error) {
      console.error('Delete template failed:', error);
      throw error;
    }
  }
}

export const templateAPI = new TemplateAPI();