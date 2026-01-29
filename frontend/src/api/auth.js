import axios from './axiosConfig';

export const authAPI = {
  login: async (credentials) => {
    const response = await axios.post('/api/auth/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
  },

  getCurrentUser: async () => {
    const response = await axios.get('/api/auth/profile/');
    return response.data;
  }
};