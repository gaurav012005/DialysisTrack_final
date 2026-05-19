import api from './axiosConfig';

export const patientsAPI = {
  getAll: () => api.get('/patients/'),
  getById: (id) => api.get(`/patients/${id}/`),
  create: (data) => api.post('/patients/', data),
  update: (id, data) => api.put(`/patients/${id}/`, data),
  delete: (id) => api.delete(`/patients/${id}/`),
  getEmergencyCases: () => api.get('/patients/emergency_cases/'),
  
  // === Clinical Features ===
  getInfectionPositive: () => api.get('/patients/infection_positive/'),
  getConsentExpired: () => api.get('/patients/consent_expired/'),
  getScreeningOverdue: () => api.get('/patients/screening_overdue/'),
  
  // Prescriptions
  getPrescriptions: () => api.get('/patients/prescriptions/'),
  getPrescriptionById: (id) => api.get(`/patients/prescriptions/${id}/`),
  createPrescription: (data) => api.post('/patients/prescriptions/', data),
  updatePrescription: (id, data) => api.put(`/patients/prescriptions/${id}/`, data),
  deletePrescription: (id) => api.delete(`/patients/prescriptions/${id}/`),
  getActivePrescription: (patientId) => api.get(`/patients/prescriptions/patient/${patientId}/active/`),
  
  // Lab Results
  getLabResults: () => api.get('/patients/lab-results/'),
  getLabResultById: (id) => api.get(`/patients/lab-results/${id}/`),
  createLabResult: (data) => api.post('/patients/lab-results/', data),
  updateLabResult: (id, data) => api.put(`/patients/lab-results/${id}/`, data),
  deleteLabResult: (id) => api.delete(`/patients/lab-results/${id}/`),
  getPatientLabHistory: (patientId) => api.get(`/patients/lab-results/patient/${patientId}/history/`),
  getCriticalAlerts: () => api.get('/patients/lab-results/critical_alerts/'),
};