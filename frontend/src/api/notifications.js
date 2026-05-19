import api from './axiosConfig';

// Fetch all notifications for the current user
export const getNotifications = () => api.get('/notifications/');

// Mark a single notification as read
export const markNotificationRead = (id) => api.post(`/notifications/${id}/read/`);

// Mark all notifications as read
export const markAllNotificationsRead = () => api.post('/notifications/mark-all-read/');

// Create a test notification for yourself (debug / seed)
export const createTestNotification = () => api.post('/notifications/test/');

// Fetch audit logs (admin only)
export const getAuditLogs = ({ module = '', action = '', limit = 200 } = {}) => {
  const params = new URLSearchParams({ limit });
  if (module) params.append('module', module);
  if (action) params.append('action', action);
  return api.get(`/notifications/audit-logs/?${params.toString()}`);
};

// Request password reset email
export const forgotPassword = (email) =>
  api.post('/notifications/forgot-password/', { email });

// Complete password reset with token
export const resetPassword = (token, new_password) =>
  api.post('/notifications/reset-password/', { token, new_password });
