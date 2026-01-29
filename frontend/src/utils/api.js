// API utility functions for authenticated requests
import config from '../config/environment';

const BASE_URL = config.API_BASE_URL;

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          errorMessage = Object.values(errorData).flat().join(', ');
        }
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses (like DELETE requests)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Dashboard
  getDashboardStats: () => apiRequest('/reports/dashboard-stats/'),

  // Patients
  getPatients: () => apiRequest('/patients/'),
  createPatient: (data) => apiRequest('/patients/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePatient: (id, data) => apiRequest(`/patients/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePatient: (id) => apiRequest(`/patients/${id}/`, {
    method: 'DELETE'
  }),

  // Queue
  getQueue: () => apiRequest('/queue/'),

  // Machines
  getMachines: () => apiRequest('/machines/'),

  // Reports
  getReports: (type) => apiRequest(`/reports/${type}/`)
};

export default api;