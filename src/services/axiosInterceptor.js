// axiosInterceptor.js
import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';
import { API_BASE } from '../utils/constants';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth storage helper functions
const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

const getUserData = () => {
  try {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const setAuthData = (token, userData) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
  } catch {}
};

const clearAuthData = () => {
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
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState()?.auth?.token || getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date();
      response.config.metadata.duration =
        response.config.metadata.endTime - response.config.metadata.startTime;
    }
    return response;
  },
  async (error) => {
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    if (error.response?.status === 401) {
      await handleTokenExpiration();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Access denied. You do not have permission to perform this action.'));
    }
    if (error.response?.status === 404) {
      return Promise.reject(new Error('Requested resource not found.'));
    }
    if (error.response?.status === 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    if (error.response?.status >= 400) {
      const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `HTTP Error: ${error.response.status}`;
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.reject(error);
  }
);

const handleTokenExpiration = async () => {
  try {
    store.dispatch(logout());
    clearAuthData();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
  } catch {
    if (typeof window !== 'undefined') window.location.href = '/login';
  }
};

export default apiClient;
export { getToken, getUserData, setAuthData, clearAuthData, handleTokenExpiration };
