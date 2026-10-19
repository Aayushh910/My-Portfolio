import api from './api';

export const edaService = {
  /**
   * Get Event-Driven Architecture telemetry and metrics
   */
  async getStats() {
    const response = await api.get('/events/stats');
    return response.data;
  },

  /**
   * Get recent domain events published to EventBus
   */
  async getHistory(limit = 50) {
    const response = await api.get(`/events/history?limit=${limit}`);
    return response.data;
  },

  /**
   * Simulate a domain event for demonstration
   */
  async simulateEvent(eventType, message) {
    const response = await api.post('/events/simulate', { eventType, message });
    return response.data;
  },

  /**
   * Enqueue an asynchronous background export job
   */
  async enqueueExportJob(type = 'pdf', csvType = 'complete') {
    const response = await api.post('/jobs/export', { type, csvType });
    return response.data;
  },

  /**
   * Poll status of an async job
   */
  async getJobStatus(jobId) {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Get user's recent async background jobs
   */
  async getUserJobs() {
    const response = await api.get('/jobs');
    return response.data;
  },

  /**
   * Download a completed background job artifact
   */
  async downloadJobArtifact(jobId, filename) {
    const response = await api.get(`/jobs/${jobId}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `export_${jobId}.bin`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
