import api from './api';

export const aiService = {
  /**
   * Request an AI-generated description for a task title.
   * Calls POST /api/ai/generate-description
   * @param {string} title
   * @returns {Promise<{ success: boolean, description: string }>}
   */
  generateDescription: async (title) => {
    const response = await api.post('/ai/generate-description', { title });
    return response.data;
  },
};

export default aiService;
