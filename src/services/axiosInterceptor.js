import axios from 'axios';
import { store } from '../store';
import { logout, loginSuccess } from '../store/authSlice';
import { API_BASE } from '../utils/constants';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth storage helper functions
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const getUserData = () => {
  try {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const setAuthData = (token, userData) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('authData');
  localStorage.removeItem('patsansthaData');
  
  // Clear sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('authData');
  sessionStorage.removeItem('patsansthaData');
  
  // Clear cookies
  const cookies = document.cookie.split(";");
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
  });
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from Redux store first, then fallback to local storage
    let token = store.getState()?.auth?.token || getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle JWT expiration and errors
apiClient.interceptors.response.use(
  (response) => {
    // Add response time for debugging
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date();
      response.config.metadata.duration = response.config.metadata.endTime - response.config.metadata.startTime;
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Network error occurred:', error);
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    // Handle 401 Unauthorized errors (JWT expiration)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      const isTokenError = errorMessage.includes('token') || 
                          errorMessage.includes('unauthorized') || 
                          errorMessage.includes('expired') ||
                          errorMessage.includes('invalid');
      
      if (isTokenError) {
        console.log('JWT token expired or invalid, attempting refresh...');
        
        // Try to refresh token
        try {
          const currentToken = getToken();
          if (!currentToken) {
            throw new Error('No token available for refresh');
          }
          
          const refreshResponse = await axios.post(
            `${API_BASE}/patsanstha/refresh-token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000 // 10 seconds for refresh
            }
          );
          
          if (refreshResponse.data?.token) {
            const newToken = refreshResponse.data.token;
            const userData = getUserData();
            
            // Update stored auth data
            setAuthData(newToken, userData);
            
            // Update Redux store
            store.dispatch(loginSuccess({
              user: userData,
              token: newToken,
              userType: 'patsanstha'
            }));
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            console.log('Token refreshed successfully, retrying original request...');
            return apiClient(originalRequest);
          } else {
            throw new Error('No token in refresh response');
          }
          
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
          
          // Refresh failed, logout user
          await handleTokenExpiration();
          
          return Promise.reject(new Error('Session expired. Please login again.'));
        }
      }
    }
    
    // Handle other 401 errors that are not token-related
    if (error.response?.status === 401 && originalRequest._retry) {
      await handleTokenExpiration();
      return Promise.reject(new Error('Authentication failed. Please login again.'));
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
    }
    
    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
      return Promise.reject(new Error('Requested resource not found.'));
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    
    // Handle other HTTP errors
    if (error.response?.status >= 400) {
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `HTTP Error: ${error.response.status}`;
      return Promise.reject(new Error(errorMessage));
    }
    
    // Return original error for unhandled cases
    return Promise.reject(error);
  }
);

// Handle token expiration - logout and redirect
const handleTokenExpiration = async () => {
  try {
    console.log('Handling token expiration - logging out user...');
    
    // Clear Redux store
    store.dispatch(logout());
    
    // Clear all auth data
    clearAuthData();
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Check if we're not already on login page to avoid infinite redirects
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }, 100);
    
  } catch (error) {
    console.error('Error during token expiration handling:', error);
  }
};

// Export the configured axios instance
export default apiClient;

// Export interceptor setup function if needed to be called manually
export const setupAxiosInterceptors = () => {
  console.log('Axios interceptors have been set up');
  return apiClient;
};

// Export helper functions for use in components
export {
  getToken,
  getUserData,
  setAuthData,
  clearAuthData,
  handleTokenExpiration
};