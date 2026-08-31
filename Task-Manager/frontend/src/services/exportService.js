import api from './api';

export const exportService = {
  downloadPDF: async () => {
    const response = await api.get('/export/pdf', {
      responseType: 'blob',
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from header or fallback
    const contentDisposition = response.headers['content-disposition'];
    let filename = `todo_activity_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  downloadCSV: async (type = 'complete') => {
    const response = await api.get(`/export/csv?type=${type}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    let filename = `todo_export_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  getLastDownloads: async () => {
    const response = await api.get('/export/last-downloads');
    return response.data;
  },
};
