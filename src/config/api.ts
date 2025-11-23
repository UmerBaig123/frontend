// API Configuration
export const API_CONFIG = {
  // API Base URL from environment variables
  // In development, use relative path for proxy
  // In production, use full URL
  BASE_URL: import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://your-api-domain.com/api')
    : '/api', // Use relative path in development to leverage Vite proxy
  TIMEOUT: 30000, // 30 seconds
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'BidPro',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // Debug Configuration
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // CORS and Credentials Configuration
  WITH_CREDENTIALS: true,
  CORS_MODE: 'cors' as RequestMode,
};

// Log the current API configuration for debugging (only in development)
if (API_CONFIG.DEBUG || API_CONFIG.APP_ENV === 'development') {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    APP_ENV: API_CONFIG.APP_ENV,
    APP_VERSION: API_CONFIG.APP_VERSION,
    DEBUG: API_CONFIG.DEBUG,
    ENV_VAR: import.meta.env.VITE_API_BASE_URL
  });
}

export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    SIGNOUT: '/auth/signout',
    ME: '/auth/me',
  },
} as const;
