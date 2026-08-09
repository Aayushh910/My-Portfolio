const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.join(__dirname, '..', 'data', 'task_logs.csv');

// Helper to escape CSV values safely
function escapeCsv(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Ensure data directory and CSV header row exist
function initCsvLog() {
  try {
    const dir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(LOG_FILE_PATH)) {
      const header = 'Timestamp,IP_Address,Method,Action,Task_ID,Task_Title,Completed,URL_Path\n';
      fs.writeFileSync(LOG_FILE_PATH, header, 'utf8');
      console.log('CSV Activity Log file created at:', LOG_FILE_PATH);
    }
  } catch (err) {
    console.error('Failed to initialize CSV log file:', err);
  }
}

// Append activity entry using Node.js fs module
function logToCsv({ req, action, taskId = '-', taskTitle = '-', completed = '-' }) {
  try {
    initCsvLog();

    const timestamp = new Date().toISOString();
    const rawIp = (req && req.headers && req.headers['x-forwarded-for']) ||
      (req && req.socket && req.socket.remoteAddress) ||
      (req && req.ip) ||
      '127.0.0.1';

    // Clean IPv6 prefix
    const ip = String(rawIp).replace('::ffff:', '').replace('::1', '127.0.0.1');
    const method = (req && req.method) || 'GET';
    const urlPath = (req && (req.originalUrl || req.url)) || '/';

    const row = [
      escapeCsv(timestamp),
      escapeCsv(ip),
      escapeCsv(method),
      escapeCsv(action),
      escapeCsv(taskId),
      escapeCsv(taskTitle),
      escapeCsv(completed),
      escapeCsv(urlPath)
    ].join(',') + '\n';

    fs.appendFile(LOG_FILE_PATH, row, 'utf8', (err) => {
      if (err) {
        console.error('FS Error appending to CSV log:', err);
      }
    });
  } catch (err) {
    console.error('Error logging to CSV:', err);
  }
}

initCsvLog();

module.exports = {
  logToCsv,
  LOG_FILE_PATH
};
