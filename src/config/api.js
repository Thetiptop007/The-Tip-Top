// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const getApiUrl = (endpoint) => {
  // If endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // For production, use full URL. For development with proxy, use relative path
  if (import.meta.env.MODE === 'production' || import.meta.env.VITE_API_URL) {
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // In development with Vite proxy
  return `/${cleanEndpoint}`;
};

export default API_BASE_URL;
