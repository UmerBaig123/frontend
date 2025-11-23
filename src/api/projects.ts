// Frontend API service for projects
import { API_CONFIG } from '../config/api';

let API_BASE_URL = API_CONFIG.BASE_URL;

export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  budget?: number;
  location?: string;
  projectType?: string;
  documents?: ProjectDocument[];
  userId?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  format: string;
  size?: number;
  url?: string;
}

export interface CreateProjectRequest {
  title: string;
  client: string;
  description: string;
  dueDate: string;
  budget?: number;
  location?: string;
  projectType?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'pending';
}

export interface UpdateProjectRequest {
  title?: string;
  client?: string;
  description?: string;
  dueDate?: string;
  budget?: number;
  location?: string;
  projectType?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'pending';
}

export interface ProjectResponse {
  success: boolean;
  project?: Project;
  projects?: Project[];
  message?: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  client?: string;
  dueDate?: string | Date;
  status?: string;
  budget?: number;
}

class ProjectAPI {
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

  async createProject(data: CreateProjectRequest): Promise<Project> {
    console.log('Creating project with data:', data);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Auth token exists:', !!localStorage.getItem('auth_token'));
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await this.handleResponse<ProjectResponse>(response);
      console.log('Create project result:', result);
      
      if (result.project) {
        return result.project;
      }
      
      throw new Error('No project returned from API');
    } catch (error) {
      console.error('Create project failed:', error);
      throw error;
    }
  }

  async getProjects(): Promise<ProjectResponse> {
    console.log('Fetching projects...');
    
    try {
      // Add cache-busting parameter
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/projects?${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<ProjectResponse>(response);
      console.log('Get projects result:', result);
      return result;
    } catch (error) {
      console.error('Get projects failed:', error);
      throw error;
    }
  }

  async getProjectById(id: string): Promise<any> {
    console.log('Fetching project by id:', id);
    console.log('API Base URL:', API_BASE_URL);
    
    try {
      // Add cache-busting parameter
      const cacheBuster = `_t=${Date.now()}`;
      const url = `${API_BASE_URL}/projects/${id}?${cacheBuster}`;
      console.log('Full API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await this.handleResponse<any>(response);
      console.log('Get project by id result:', result);
      
      // Handle different response structures
      if (result.data) {
        return result.data; // If the API returns { success: true, data: project }
      } else if (result.project) {
        return result.project; // If the API returns { project: project }
      } else if (result._id || result.id) {
        return result; // If the API returns the project directly
      } else {
        throw new Error('No project data found in API response');
      }
    } catch (error) {
      console.error('Get project by id failed:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectResponse> {
    console.log('Updating project:', id, data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<ProjectResponse>(response);
      console.log('Update project result:', result);
      return result;
    } catch (error) {
      console.error('Update project failed:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<ProjectResponse> {
    console.log('Deleting project:', id);
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse<ProjectResponse>(response);
      console.log('Delete project result:', result);
      return result;
    } catch (error) {
      console.error('Delete project failed:', error);
      throw error;
    }
  }
}

class ProjectsAPI {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try { const err = await response.json(); message = err?.message || message; } catch {}
      throw new Error(message);
    }
    return (await response.json()) as T;
  }

  async getRecentProjects(limit = 4): Promise<ProjectSummary[]> {
    const res = await fetch(`${API_BASE_URL}/projects?limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });
    const result: any = await this.handleResponse<any>(res);
    const items = result.data || result.items || result.projects || [];
    return items.map((p: any) => ({
      id: p.id || p._id,
      title: p.title || p.name,
      client: p.client || p.clientName,
      dueDate: p.dueDate || p.deadline,
      status: p.status || 'active',
      budget: typeof p.budget === 'number' ? p.budget : parseFloat(p.budget || '0')
    }));
  }
}

export const projectAPI = new ProjectAPI();
export const projectsAPI = new ProjectsAPI();
