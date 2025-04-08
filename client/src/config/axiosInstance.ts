import axios from 'axios';
import { API_URL } from '../constants/baseUrl';

// Define the base URL and ensure type safety with environment variables
const axiosInstance = axios.create({
  baseURL: API_URL, // Use environment variables
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor with TypeScript type annotations
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Get the role (owner/patron)

    if (token) {
      if (role === 'owner') {
        if (config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`; // Owner authorization
        }
        // You can apply special headers for owners here if needed
      } else if (role === 'patron') {
        if (config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`; // Patron authorization
        }
        // You can apply special headers for patrons here if needed
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
