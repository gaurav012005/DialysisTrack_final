import api from './axiosConfig';

export const sessionAPI = {
  getAll: () => api.get('/queue/sessions/'),
  getById: (id) => api.get(`/queue/sessions/${id}/`),
  getPatientHistory: (patientId) => api.get(`/queue/sessions/patient/${patientId}/`),
  create: (data) => api.post('/queue/sessions/', data),
  update: (id, data) => api.patch(`/queue/sessions/${id}/`, data),
  completeSession: (id, data) => api.post(`/queue/sessions/${id}/complete_session/`, data),
  getRecentSessions: () => api.get('/queue/sessions/recent_sessions/'),
};
