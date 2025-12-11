import apiClient from '../../../api/client';

export const categoryEndpoints = {
  // Get all categories with pagination
  getAll: async (params = {}) => {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  // Get category by ID
  getById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Get category statistics
  getStats: async () => {
    const response = await apiClient.get('/categories/stats');
    return response.data;
  },

  // Create new category
  create: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  // Update category
  update: async (id, categoryData) => {
    const response = await apiClient.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Toggle category status
  toggleStatus: async (id) => {
    const response = await apiClient.patch(`/categories/${id}/toggle-status`);
    return response.data;
  },

  // Delete category
  delete: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
