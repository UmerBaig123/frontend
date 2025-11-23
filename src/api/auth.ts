// Frontend API service for authentication
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

let API_BASE_URL = API_CONFIG.BASE_URL;

export interface User {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

class AuthAPI {
  // Common backend URLs to try
  private readonly fallbackUrls = [
    'http://localhost:5000/api',
    'http://localhost:3001/api',
    'http://localhost:3000/api', 
    'http://localhost:8000/api',
    'http://localhost:4000/api'
  ];

  // Test backend connectivity with multiple URLs
  async testConnection(): Promise<string | null> {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const testUrls = [
      API_BASE_URL,
      ...this.fallbackUrls.filter(url => url !== API_BASE_URL)
    ];

    console.log('Testing connection to multiple URLs:', testUrls);
    
    for (const url of testUrls) {
      try {
        console.log(`Testing: ${url}`);
        const response = await fetch(`${url}/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Don't include credentials for the test
        });
        console.log(`${url} responded with status:`, response.status);
        
        // If we get any response (even 401 is ok, means server is running)
        if (response.status === 401 || response.status === 200 || response.status === 404) {
          console.log(`Found working backend at: ${url}`);
          return url;
        }
      } catch (error) {
        console.log(`${url} failed:`, (error as any).message);
      }
    }
    
    console.error('No working backend found');
    return null;
  }

  // Update the base URL if we find a working backend
  setBaseUrl(url: string) {
    API_BASE_URL = url;
    console.log('Updated API base URL to:', API_BASE_URL);
  }

  private getHeaders(includeAuth = false): HeadersInit {
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

  private getFetchOptions(includeAuth = false): RequestInit {
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
      let errorDetails = '';
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          console.log('Failed to parse error JSON:', e);
        }
      } else {
        try {
          const textError = await response.text();
          console.log('Error response text:', textError);
          if (textError) errorMessage = textError;
          errorDetails = textError;
        } catch (e) {
          console.log('Failed to read error text:', e);
        }
      }
      
      console.error('API Error:', { status: response.status, message: errorMessage, details: errorDetails });
      throw new Error(errorMessage);
    }

    // Handle successful responses
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('Success JSON response:', jsonData);
      
      // Transform backend response format to our expected format
      if (jsonData.userId && jsonData.email) {
        // Backend returns: {"message":"...", "userId":"...", "email":"..."}
        // Transform to our format: {"success": true, "user": {...}, "message": "..."}
        return {
          success: true,
          user: {
            id: jsonData.userId,
            email: jsonData.email,
            fullName: jsonData.fullName || jsonData.name || '',
            createdAt: jsonData.createdAt || new Date().toISOString(),
            updatedAt: jsonData.updatedAt || new Date().toISOString()
          },
          message: jsonData.message,
          token: jsonData.token
        } as T;
      }
      
      // If response already has our expected format, return as is
      if (jsonData.success !== undefined) {
        return jsonData;
      }
      
      // For other JSON responses, wrap them in a success response
      return {
        success: true,
        message: jsonData.message || 'Operation successful',
        ...jsonData
      } as T;
    } else {
      // Handle text responses (like "Signed in successfully!")
      const textData = await response.text();
      console.log('Success text response:', textData);
      
      // For text responses, create a generic success response
      return { 
        success: true, 
        message: textData 
      } as T;
    }
  }

  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    console.log('Attempting signup with email:', data.email);
    
    // First, try to find a working backend if current one fails
    let currentUrl = API_BASE_URL;
    
    try {
      console.log('Using API URL:', `${currentUrl}/auth/signup`);
      console.log('Request data:', data);
      
      const response = await fetch(`${currentUrl}/auth/signup`, {
        method: 'POST',
        ...this.getFetchOptions(),
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await this.handleResponse<AuthResponse>(response);
      console.log('Signup result after handleResponse:', result);
      
      // Store token if provided
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        console.log('Signup successful, token stored');
      }

      return result;
    } catch (error) {
      console.error('Signup request failed with current URL:', currentUrl, error);
      
      // Try to find a working backend URL
      console.log('Attempting to find working backend...');
      const workingUrl = await this.testConnection();
      
      if (workingUrl && workingUrl !== currentUrl) {
        console.log('Found working backend, retrying signup...');
        this.setBaseUrl(workingUrl);
        
        // Retry the request with the working URL
        const response = await fetch(`${workingUrl}/auth/signup`, {
          method: 'POST',
          ...this.getFetchOptions(),
          body: JSON.stringify(data),
        });

        const result = await this.handleResponse<AuthResponse>(response);
        console.log('Signup retry result after handleResponse:', result);
        
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          console.log('Signup successful with alternative URL, token stored');
        }

        return result;
      }
      
      throw error;
    }
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    console.log('Attempting signin with email:', data.email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        ...this.getFetchOptions(),
        body: JSON.stringify(data),
      });

      console.log('Signin response status:', response.status);

      const result = await this.handleResponse<AuthResponse>(response);
      console.log('Signin result after handleResponse:', result);
      
      // Store token if provided (though it might come from cookies)
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        console.log('Signin successful, token stored');
      }

      return result;
    } catch (error) {
      console.error('Signin request failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<AuthResponse> {
    console.log('Attempting signout');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signout`, {
        method: 'POST',
        ...this.getFetchOptions(true),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      
      // Remove token from localStorage
      localStorage.removeItem('auth_token');
      console.log('Signout successful, token removed');

      return result;
    } catch (error) {
      console.error('Signout request failed:', error);
      // Even if signout fails on server, remove local token
      localStorage.removeItem('auth_token');
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthResponse> {
    console.log('Fetching current user...');
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      ...this.getFetchOptions(true),
    });

    console.log('getCurrentUser response status:', response.status);
    const result = await this.handleResponse<AuthResponse>(response);
    console.log('getCurrentUser result:', result);
    
    return result;
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No token found, user not authenticated');
        return false;
      }

      const result = await this.getCurrentUser();
      const isAuthenticated = result.success && !!result.user;
      console.log('Auth status check:', isAuthenticated ? 'authenticated' : 'not authenticated');
      return isAuthenticated;
    } catch (error) {
      console.log('Auth status check failed:', error);
      // Remove invalid token
      localStorage.removeItem('auth_token');
      return false;
    }
  }

  // Get user profile information (GET /api/user/profile)
  async getUserProfile(): Promise<AuthResponse> {
    console.log('Fetching user profile...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        ...this.getFetchOptions(true),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      console.log('getUserProfile result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update Account Information (PUT /api/user/account)
  async updateAccountInfo(data: {
    fullName?: string;
    companyName?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    console.log('Updating account info:', data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/account`, {
        method: 'PUT',
        ...this.getFetchOptions(true),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      console.log('updateAccountInfo result:', result);
      return result;
    } catch (error) {
      console.error('Error updating account info:', error);
      throw error;
    }
  }

  // Update Company Information (PUT /api/user/company)
  async updateCompanyInfo(data: {
    companyName?: string;
    website?: string;
    address?: string;
  }): Promise<AuthResponse> {
    console.log('Updating company info:', data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/company`, {
        method: 'PUT',
        ...this.getFetchOptions(true),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      console.log('updateCompanyInfo result:', result);
      return result;
    } catch (error) {
      console.error('Error updating company info:', error);
      throw error;
    }
  }

  // Update Notification Preferences (PUT /api/user/notifications)
  async updateNotificationPreferences(data: {
    emailNotifications?: boolean;
    bidUpdates?: boolean;
    marketingCommunications?: boolean;
  }): Promise<AuthResponse> {
    console.log('Updating notification preferences:', data);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/notifications`, {
        method: 'PUT',
        ...this.getFetchOptions(true),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      console.log('updateNotificationPreferences result:', result);
      return result;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Update Password (Security) (PUT /api/user/security)
  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    console.log('Updating password...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/security`, {
        method: 'PUT',
        ...this.getFetchOptions(true),
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      console.log('updatePassword result:', result);
      return result;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

export const authAPI = new AuthAPI();
