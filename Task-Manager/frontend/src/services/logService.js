import api from './api';

export const logService = {
  getLogs: async (params = {}) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  getLogById: async (id) => {
    const response = await api.get(`/logs/${id}`);
    return response.data;
  },
};
