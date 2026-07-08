import axios from 'axios';

// Create an Axios instance with preconfigured settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors (like token expiration, rate limits)
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Unauthorized request. Token might have expired.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
