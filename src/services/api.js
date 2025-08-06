import { API_BASE } from '../utils/constants';
import { store } from '../store';

// API Helper Functions
export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = store.getState().auth.token;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    // Better error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// File Upload API Helper (without Content-Type header for FormData)
export const fileApiCall = async (endpoint, options = {}) => {
  try {
    const token = store.getState().auth.token;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `File upload failed! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// File Download API Helper (for downloading collection files)
export const downloadApiCall = async (endpoint, options = {}) => {
  try {
    const token = store.getState().auth.token;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Download failed! status: ${response.status}`;
      } catch {
        errorMessage = `Download failed! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // Return the response text for .txt files
    return await response.text();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// Auth API Functions
export const authAPI = {
  loginPatsanstha: (mobilenumber, password) =>
    apiCall('/patsanstha/login', {
      method: 'POST',
      body: JSON.stringify({ mobilenumber, password }),
    }),
  
  logoutPatsanstha: () =>
    apiCall('/patsanstha/logout', { method: 'POST' }),
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
};