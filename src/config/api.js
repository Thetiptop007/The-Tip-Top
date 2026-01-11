// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const getApiUrl = (endpoint) => {
  // If endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // For production, use full URL directly (endpoint already includes api/v1)
  if (import.meta.env.MODE === 'production') {
    // Get base URL without /api/v1 suffix
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  // For development, check if we should use proxy or direct URL
  if (import.meta.env.VITE_API_URL) {
    const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  // In development with Vite proxy
  return `/${cleanEndpoint}`;
};

export default API_BASE_URL;
