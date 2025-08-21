// api.js
import axios from 'axios';
import { API_BASE } from '../utils/constants';
import { store } from '../store';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If it's a network or timeout error, keep these special messages
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return Promise.reject(new Error('Please check your internet connection.'));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    // If backend sent a response
    if (error.response) {
      const backendMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `HTTP Error: ${error.response.status}`;

      if (error.response.status === 401) {
        await handleLogout();
      }

      return Promise.reject(new Error(backendMessage));
    }

    return Promise.reject(error);
  }
);


const handleLogout = async () => {
  try {
    const { logout } = await import('../store/authSlice');
    store.dispatch(logout());
    authStorage.clearAuthData();
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const apiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      ...options,
    };
    if (options.body) {
      config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    }
    if (config.data && !(config.data instanceof FormData)) {
      config.headers = { 'Content-Type': 'application/json', ...config.headers };
    }
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fileApiCall = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'POST',
      data: options.body,
      headers: { ...options.headers },
    };
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    if (error.response?.status >= 400) {
      throw new Error(error.response.data?.message || `File upload failed! status: ${error.response.status}`);
    }
    throw error;
  }
};
export const downloadApiCall = async (endpoint, options = {}) => {
  try {
    const config = { url: endpoint, method: options.method || 'GET', responseType: 'json', ...options };
    const response = await apiClient(config);
    return response.data; // { filename, fileContent }
  } catch (error) {
    if (error.response?.status >= 400) {
      const errorMessage = error.response.data?.message || `Download failed! status: ${error.response.status}`;
      throw new Error(errorMessage);
    }
    throw error;
  }
};


export const authStorage = {
  setAuthData: (token, userData) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authData', JSON.stringify({ token, user: userData, timestamp: Date.now() }));
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      document.cookie = `auth_token=${token}; path=/; max-age=86400; secure; samesite=strict`;
    } catch {}
  },
  getAuthData: () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      return { token, user: userData ? JSON.parse(userData) : null };
    } catch {
      return { token: null, user: null };
    }
  },
  clearAuthData: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authData');
      localStorage.removeItem('patsansthaData');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authData');
      sessionStorage.removeItem('patsansthaData');
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      });
    } catch {}
  },
  isAuthenticated: () => !!authStorage.getAuthData().token
};

export const authAPI = {
  loginPatsanstha: async (mobilenumber, password, dispatch = null) => {
    try {
      const response = await apiCall('/patsanstha/login', {
        method: 'POST',
        body: JSON.stringify({ mobilenumber, password }),
      });
      if (response.token) {
        authStorage.setAuthData(response.token, response.user || response.patsanstha);
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
  logoutPatsanstha: async (dispatch = null) => {
    try {
      await apiCall('/patsanstha/logout', { method: 'POST' });
      if (dispatch) {
        const { logout } = await import('../store/authSlice');
        dispatch(logout());
      }
      authStorage.clearAuthData();
      return { success: true, message: 'Logged out successfully' };
    } catch {
      if (dispatch) {
        const { logout } = await import('../store/authSlice');
        dispatch(logout());
      }
      authStorage.clearAuthData();
      return { success: true, message: 'Logged out successfully' };
    }
  }
};

export const patsansthaAPI = {
  viewData: () => apiCall('/patsanstha/view-data'),
  addAgent: (data) => apiCall('/patsanstha/add-agent', { method: 'POST', body: JSON.stringify(data) }),
  editAgent: (agentno, data) => apiCall(`/patsanstha/edit-agent/${agentno}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAgent: (agentno) => apiCall(`/patsanstha/delete-agent/${agentno}`, { method: 'DELETE' }),
  getAdminMessage: () => apiCall('/patsanstha/admin-message'),
  uploadAgentFile: (agentno, formData) => fileApiCall(`/patsanstha/upload-file/${agentno}`, { method: 'POST', body: formData }),
  getAgentCollectionStatus: (date = null) => {
    const queryParams = date ? `?date=${date}` : '';
    return apiCall(`/patsanstha/collection-status${queryParams}`);
  },
  downloadAgentCollection: (agentno, date = null) => {
    const queryParams = date ? `?date=${date}` : '';
    return downloadApiCall(`/patsanstha/download-collection/${agentno}${queryParams}`);
  },
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

export const initializeAuth = () => {
  const { token, user } = authStorage.getAuthData();
  return token && user ? { token, user } : null;
};
