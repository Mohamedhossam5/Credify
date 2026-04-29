import axios from 'axios';
import toast from 'react-hot-toast';
import { normalizeApiError } from '../utils/errorHandler';

// Create a single, centralized Axios instance
export const api = axios.create({
  // Use environment variables for production readiness
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the token to every outgoing request
api.interceptors.request.use(
  (config) => {
    // Assuming the token is stored in localStorage as 'credify_token'
    const token = localStorage.getItem('credify_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handling and Refresh Token mechanism
api.interceptors.response.use(
  (response) => {
    // Return successful responses directly
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        /*
          [PLACEHOLDER]: Backend Refresh Token Logic
          Once the backend is ready, uncomment and adjust this logic:
          
          const { data } = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
          localStorage.setItem('credify_token', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        */
        
        // Safety Fallback: If 401 occurs and no refresh logic exists, log out safely
        localStorage.removeItem('credify_token');
        
        // Avoid redirect loop if already on login page
        if (window.location.pathname !== '/login') {
          toast.error('Session expired. Please log in again.', { id: 'session-expired' });
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // If refresh fails, forcefully clear state and logout
        localStorage.removeItem('credify_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Normalize the error to our standard format
    const normalizedError = normalizeApiError(error);

    // Global Error Alerts (preventing component-level repetition)
    if (normalizedError.status >= 500) {
      toast.error('Server error. Our engineers are on it.', { id: 'server-error' });
    } else if (normalizedError.code === 'NETWORK_ERROR') {
      toast.error(normalizedError.message, { id: 'network-error' });
    }

    // Always reject with the normalized error
    return Promise.reject(normalizedError);
  }
);
