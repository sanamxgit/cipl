import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost/backend/api',
  headers: {
    'Accept': 'application/json'
  }
});

// Add request interceptor to handle different content types
axiosInstance.interceptors.request.use(config => {
  // For PUT requests, always use JSON
  if (config.method === 'put') {
    config.headers['Content-Type'] = 'application/json';
  }
  // For POST requests, use FormData
  else if (config.method === 'post' && config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  // Default to JSON
  else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default axiosInstance; 