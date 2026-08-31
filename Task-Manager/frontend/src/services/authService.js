import api from './api';

export const authService = {
  register: async (username, password, email) => {
    const response = await api.post('/auth/register', { username, password, email });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request error:', err);
    } finally {
      localStorage.removeItem('todo_auth_token');
      localStorage.removeItem('todo_auth_user');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },
};
