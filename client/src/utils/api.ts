/**
 * API configuration module using axios.
 * Sets up base configuration and interceptors for API requests.
 */
import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: '/api',  // Uses Vite's proxy configuration
  withCredentials: true, // Required for session cookie handling
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
