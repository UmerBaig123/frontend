 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { authAPI, User as ApiUser } from '@/api/auth';

interface User {
  id: string;
  email: string;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        // First check if we have a token in localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token found, user not authenticated');
          setIsLoading(false);
          return;
        }

        // Try to get current user with the token
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse.success && userResponse.user) {
          console.log('User authenticated successfully:', userResponse.user);
          setUser(userResponse.user);
        } else {
          console.log('User authentication failed, clearing token');
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear any invalid stored tokens
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.signIn({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Show success toast
        toast({
          title: 'Login successful',
          description: `Welcome back, ${response.user.fullName || response.user.email}!`,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
      
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error; // Re-throw the error to be caught by the component
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.signUp({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Show success toast
        toast({
          title: 'Account created successfully',
          description: `Welcome to BidPro, ${response.user.fullName || response.user.email}!`,
        });
      } else {
        throw new Error(response.message || 'Signup failed');
      }
      
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error; // Re-throw the error to be caught by the component
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // This would need to be implemented in the API
      // For now, just show a message that it's not implemented
      toast({
        title: 'Feature not available',
        description: 'Password update functionality will be available soon',
        variant: 'destructive',
      });
      return false;
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Password update failed',
        description: 'An error occurred while updating your password',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
    
    // Clear user data
    setUser(null);
    
    // Show success toast
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup,
      logout, 
      isAuthenticated: !!user,
      updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};
