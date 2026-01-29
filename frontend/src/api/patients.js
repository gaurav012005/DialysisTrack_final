import api from './axiosConfig';

export const patientsAPI = {
  getAll: () => api.get('/patients/'),
  getById: (id) => api.get(`/patients/${id}/`),
  create: (data) => api.post('/patients/', data),
  update: (id, data) => api.put(`/patients/${id}/`, data),
  delete: (id) => api.delete(`/patients/${id}/`),
  getEmergencyCases: () => api.get('/patients/emergency_cases/')
};