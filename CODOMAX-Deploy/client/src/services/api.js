import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear local session
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// Item endpoints
export const itemService = {
  getItems: (params) => api.get('/api/items', { params }),
  getItemById: (id) => api.get(`/api/items/${id}`),
  createItem: (formData) =>
    api.post('/api/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateItem: (id, formData) =>
    api.patch(`/api/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  markRecovered: (id) => api.patch(`/api/items/${id}/recover`),
  deleteItem: (id, reason) => api.delete(`/api/items/${id}`, { data: { reason } }),
  reportSuspectedMatch: (id, data) => api.post(`/api/items/${id}/suspect-match`, data),
  contactReporter: (id, data) => api.post(`/api/items/${id}/contact`, data),
};

// Student personal dashboard endpoints
export const userService = {
  getMyReports: () => api.get('/api/users/me/reports'),
  getMyProfile: () => api.get('/api/users/me/profile'),
  updateProfile: (data) => api.patch('/api/users/me/profile', data),
};

// Notifications endpoints
export const notificationService = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
};

// Admin endpoints
export const adminService = {
  getDashboardStats: () => api.get('/api/admin/dashboard'),
  getAllReports: (params) => api.get('/api/admin/reports', { params }),
  verifyReport: (id) => api.patch(`/api/admin/reports/${id}/verify`),
  rejectReport: (id, reason) => api.patch(`/api/admin/reports/${id}/reject`, { reason }),
  updateReportStatus: (id, status) => api.patch(`/api/admin/reports/${id}/status`, { status }),
  deleteReport: (id, reason) => api.delete(`/api/admin/reports/${id}`, { data: { reason } }),
};

export default api;
