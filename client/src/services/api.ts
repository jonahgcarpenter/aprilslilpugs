import axios from 'axios';

// Request cache implementation
const cache: { [key: string]: { promise: Promise<any>, timestamp: number } } = {};
const CACHE_DURATION = 1000; // 1 second cache

const getCachedRequest = <T>(key: string, request: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const cached = cache[key];
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.promise;
  }

  const promise = request();
  cache[key] = { promise, timestamp: now };
  
  // Clean up cache entry after request completes
  promise.finally(() => {
    setTimeout(() => {
      delete cache[key];
    }, CACHE_DURATION);
  });

  return promise;
};

const api = axios.create({
  baseURL: '/api',  // This will use the Vite proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  if (import.meta.env.DEV) console.log('Starting Request:', request);
  return request;
});

api.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) window.location.href = '/login';
    return Promise.reject(error.response?.data || error);
  }
);

export const get = <T>(url: string) => 
  getCachedRequest<T>(url, () => api.get<T>(url).then(res => res.data));

export const put = <T>(url: string, data: any) => {
  const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  return api.put<T>(url, data, { headers }).then(res => res.data);
};

export const post = <T>(url: string, data?: any) => {
  const headers = data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  return api.post<T>(url, data, { headers }).then(res => res.data);
};

export default api;