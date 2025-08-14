import axios from 'axios';
import { API_BASE } from '../utils/constants';
import { store } from '../store';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for JWT expiration handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if it's a token expiration error
      const errorMessage = error.response?.data?.message?.toLowerCase();
      if (errorMessage?.includes('token') && (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
        
        // Try to refresh token first
        try {
          const refreshResponse = await axios.post(`${API_BASE}/patsanstha/refresh-token`, {}, {
            headers: {
              Authorization: `Bearer ${store.getState().auth.token}`
            }
          });

          if (refreshResponse.data.token) {
            // Update token in storage and store
            const { user } = authStorage.getAuthData();
            authStorage.setAuthData(refreshResponse.data.token, user);
            
            // Update Redux store
            const { loginSuccess } = await import('../store/authSlice');
            store.dispatch(loginSuccess({
              user: user,
              token: refreshResponse.data.token,
              userType: 'patsanstha'
            }));

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }

        // If refresh fails or no refresh token, logout user
        await handleLogout();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    // Return the original error for other cases
    return Promise.reject(error);
  }
);

// Helper function to handle logout
const handleLogout = async () => {
  try {
    // Clear Redux store
    const { logout } = await import('../store/authSlice');
    store.dispatch(logout());
    
    // Clear all authentication data
    authStorage.clearAuthData();
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// API Helper Functions
export const apiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      ...options,
    };

    // Handle request body
    if (options.body) {
      if (typeof options.body === 'string') {
        config.data = JSON.parse(options.body);
      } else {
        config.data = options.body;
      }
    }

    // Set default content type for JSON requests
    if (config.data && !(config.data instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    // Re-throw the processed error from interceptor
    throw error;
  }
};

// File Upload API Helper (without Content-Type header for FormData)
export const fileApiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'POST',
      data: options.body,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...options.headers,
      },
    };

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    // Customize error message for file uploads
    if (error.response?.status >= 400) {
      throw new Error(error.response.data?.message || `File upload failed! status: ${error.response.status}`);
    }
    throw error;
  }
};

// File Download API Helper (for downloading collection files)
export const downloadApiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      responseType: 'text', // For .txt files
      ...options,
    };

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    // Customize error message for downloads
    if (error.response?.status >= 400) {
      const errorMessage = error.response.data?.message || `Download failed! status: ${error.response.status}`;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// Authentication Storage Management
export const authStorage = {
  // Store authentication data
  setAuthData: (token, userData) => {
    try {
      // Store in localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authData', JSON.stringify({ token, user: userData, timestamp: Date.now() }));
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      // Store in cookies for additional security (httpOnly should be set by backend)
      document.cookie = `auth_token=${token}; path=/; max-age=86400; secure; samesite=strict`;
      
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  },

  // Get authentication data
  getAuthData: () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      return {
        token,
        user: userData ? JSON.parse(userData) : null
      };
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      return { token: null, user: null };
    }
  },

  // Clear all authentication data
  clearAuthData: () => {
    try {
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
      
      // Clear all cookies
      const cookies = document.cookie.split(";");
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Clear cookie for current domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        
        // Also try with leading dot for subdomain cookies
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      });
      
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const { token } = authStorage.getAuthData();
    return !!token;
  }
};

// Auth API Functions
export const authAPI = {
  // Login and store auth data
  loginPatsanstha: async (mobilenumber, password, dispatch = null) => {
    try {
      const response = await apiCall('/patsanstha/login', {
        method: 'POST',
        body: JSON.stringify({ mobilenumber, password }),
      });
      
      // Store authentication data after successful login
      if (response.token) {
        authStorage.setAuthData(response.token, response.user || response.patsanstha);
        
        // Update Redux store if dispatch is provided
        if (dispatch) {
          const { loginSuccess } = await import('../store/authSlice');
          dispatch(loginSuccess({
            user: response.user || response.patsanstha,
            token: response.token,
            userType: 'patsanstha'
          }));
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout and clear all auth data
  logoutPatsanstha: async (dispatch = null) => {
    try {
      // Call logout API
      await apiCall('/patsanstha/logout', { method: 'POST' });
      
      // Clear Redux store if dispatch is provided
      if (dispatch) {
        const { logout } = await import('../store/authSlice');
        dispatch(logout());
      }
      
      // Clear all authentication data regardless of API response
      authStorage.clearAuthData();
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      // Even if API call fails, clear local auth data for security
      if (dispatch) {
        const { logout } = await import('../store/authSlice');
        dispatch(logout());
      }
      authStorage.clearAuthData();
      
      // Don't throw error, always return success for logout
      return { success: true, message: 'Logged out successfully' };
    }
  },

  // Refresh token if needed
  refreshToken: async (dispatch = null) => {
    try {
      const response = await apiCall('/patsanstha/refresh-token', { method: 'POST' });
      
      if (response.token) {
        const { user } = authStorage.getAuthData();
        authStorage.setAuthData(response.token, user);
        
        // Update Redux store if dispatch is provided
        if (dispatch) {
          const { loginSuccess } = await import('../store/authSlice');
          dispatch(loginSuccess({
            user: user,
            token: response.token,
            userType: 'patsanstha'
          }));
        }
      }
      
      return response;
    } catch (error) {
      // If refresh fails, clear auth data
      if (dispatch) {
        const { logout } = await import('../store/authSlice');
        dispatch(logout());
      }
      authStorage.clearAuthData();
      throw error;
    }
  }
};

// Patsanstha API Functions
export const patsansthaAPI = {
  viewData: () =>
    apiCall('/patsanstha/view-data'),
  
  addAgent: (data) =>
    apiCall('/patsanstha/add-agent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  editAgent: (agentno, data) =>
    apiCall(`/patsanstha/edit-agent/${agentno}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteAgent: (agentno) =>
    apiCall(`/patsanstha/delete-agent/${agentno}`, {
      method: 'DELETE',
    }),

  getAdminMessage: () =>
    apiCall('/patsanstha/admin-message'),

  // File upload for agent - Updated to match backend route
  uploadAgentFile: (agentno, formData) => 
    fileApiCall(`/patsanstha/upload-file/${agentno}`, {
      method: 'POST',
      body: formData,
    }),

  // Get agent collection status - Updated to match backend
  getAgentCollectionStatus: (date = null) => {
    const queryParams = date ? `?date=${date}` : '';
    return apiCall(`/patsanstha/collection-status${queryParams}`);
  },

  // Download agent collection file - Updated to match backend
  downloadAgentCollection: (agentno, date = null) => {
    const queryParams = date ? `?date=${date}` : '';
    return downloadApiCall(`/patsanstha/download-collection/${agentno}${queryParams}`);
  },

  // Get transactions with optional filters
  getTransactions: (filters = {}) => {
    const { agentno, agentId, date, submitted } = filters;
    const queryParams = new URLSearchParams();
    
    if (agentno) queryParams.append('agentno', agentno);
    if (agentId) queryParams.append('agentId', agentId);
    if (date) queryParams.append('date', date);
    
    const queryString = queryParams.toString();
    return apiCall(`/patsanstha/transactions${queryString ? `?${queryString}` : ''}`);
  },
};

// Initialize auth state on app load
export const initializeAuth = () => {
  const { token, user } = authStorage.getAuthData();
  
  if (token && user) {
    // You might want to validate the token with the server here
    return { token, user };
  }
  
  return null;
};