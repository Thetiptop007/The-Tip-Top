import apiClient from './client';

// ==================== AUTH ====================
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.patch('/auth/me', data),
  changePassword: (data) => apiClient.patch('/auth/change-password', data),
};

// ==================== ORDERS ====================
export const ordersAPI = {
  getAll: (params) => apiClient.get('/orders', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  getPending: (params) => apiClient.get('/orders/pending/all', { params }),
  getByStatus: (status, params) => apiClient.get(`/orders/status/${status}`, { params }),
  updateStatus: (id, data) => apiClient.patch(`/orders/${id}/status`, data),
  assignDelivery: (id, deliveryPartnerId) => 
    apiClient.patch(`/orders/${id}/assign`, { deliveryPartnerId }),
  cancelOrder: (id, reason) => apiClient.patch(`/orders/${id}/cancel`, { reason }),
  getStats: () => apiClient.get('/orders/stats/overview'),
  trackOrder: (id) => apiClient.get(`/orders/${id}/track`),
};

// ==================== MENU ====================
export const menuAPI = {
  getAll: (params) => apiClient.get('/menu', { params }),
  getById: (id) => apiClient.get(`/menu/${id}`),
  getBySlug: (slug) => apiClient.get(`/menu/slug/${slug}`),
  getByCategory: (category, params) => apiClient.get(`/menu/category/${category}`, { params }),
  getCategories: () => apiClient.get('/menu/categories/all'),
  getPopular: (params) => apiClient.get('/menu/popular/items', { params }),
  create: (data) => apiClient.post('/menu', data),
  update: (id, data) => apiClient.patch(`/menu/${id}`, data),
  delete: (id) => apiClient.delete(`/menu/${id}`),
  permanentlyDelete: (id) => apiClient.delete(`/menu/${id}/permanent`),
  restore: (id) => apiClient.patch(`/menu/${id}/restore`),
  updateAvailability: (id, isAvailable) => 
    apiClient.patch(`/menu/${id}/availability`, { isAvailable }),
  getStats: () => apiClient.get('/menu/stats/overview'),
};

// ==================== USERS ====================
export const usersAPI = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  getByRole: (role, params) => apiClient.get(`/users/role/${role}`, { params }),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
  permanentlyDelete: (id) => apiClient.delete(`/users/${id}/permanent`),
  restore: (id) => apiClient.patch(`/users/${id}/restore`),
  toggleBlock: (id, data) => apiClient.patch(`/users/${id}/block`, data),
  updateRole: (id, role) => apiClient.patch(`/users/${id}/role`, { role }),
  getStats: () => apiClient.get('/users/stats/overview'),
};

// ==================== DELIVERY ====================
export const deliveryAPI = {
  getAll: (params) => apiClient.get('/delivery/partners', { params }),
  getAvailable: (params) => apiClient.get('/delivery/available', { params }),
  register: (data) => apiClient.post('/delivery/register', data),
  delete: (id) => apiClient.delete(`/delivery/partner/${id}`),
  getStats: () => apiClient.get('/delivery/stats/overview'),
  getSessions: (params) => apiClient.get('/delivery/sessions', { params }),
  getActiveSessions: (params) => apiClient.get('/delivery/sessions/active', { params }),
  getUnsettledSessions: (params) => apiClient.get('/delivery/sessions/unsettled', { params }),
  settleSession: (id, data) => apiClient.patch(`/delivery/session/${id}/settle`, data),
};

// ==================== SETTINGS ====================
export const settingsAPI = {
  get: () => apiClient.get('/settings'),
  update: (data) => apiClient.put('/settings', data),
};

export default {
  auth: authAPI,
  orders: ordersAPI,
  menu: menuAPI,
  users: usersAPI,
  delivery: deliveryAPI,
  settings: settingsAPI,
};
