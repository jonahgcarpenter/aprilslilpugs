import axios from 'axios';
import type { ApiResponse, BreederData, AboutUsData } from './types';

// API Configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Services
export const services = {
  breeder: {
    getProfile: () => api.get<ApiResponse<BreederData>>('/breeder/profile')
  },
  about: {
    getAboutInfo: () => api.get<ApiResponse<AboutUsData>>('/aboutus/')
  }
};

// Exports
export * from './types';
export { default as api } from './api';
export * from './authService';
export * from './breederService';
export * from './aboutService';
