import api from './axiosConfig';

export const queueAPI = {
  getAll: () => api.get('/queue/'),
  getCurrentQueue: () => api.get('/queue/current_queue/'),
  getDashboardStats: () => api.get('/queue/dashboard_stats/'),
  create: (data) => api.post('/queue/', data),
  update: (id, data) => api.put(`/queue/${id}/`, data),
  updateStatus: (id, status) => api.patch(`/queue/${id}/`, { status })
};