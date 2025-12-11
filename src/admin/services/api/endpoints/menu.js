import apiClient from '../../../api/client';

export const menuEndpoints = {
  // Get all menu items with pagination
  getAll: async (params = {}) => {
    const response = await apiClient.get('/menu', { params });
    return response.data;
  },

  // Get menu item by ID
  getById: async (id) => {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  },

  // Get menu statistics
  getStats: async () => {
    const response = await apiClient.get('/menu/stats/overview');
    return response.data;
  },

  // Create new menu item
  create: async (menuData) => {
    const response = await apiClient.post('/menu', menuData);
    return response.data;
  },

  // Update menu item
  update: async (id, menuData) => {
    const response = await apiClient.patch(`/menu/${id}`, menuData);
    return response.data;
  },

  // Update availability
  updateAvailability: async (id, isAvailable) => {
    const response = await apiClient.patch(`/menu/${id}/availability`, { isAvailable });
    return response.data;
  },

  // Delete menu item
  delete: async (id) => {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },
};
