import { Parser } from 'json2csv';

/**
 * Format date for CSV
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
};

/**
 * Generate CSV for Todos
 * @param {Array} todos
 * @returns {string}
 */
export const generateTodosCSV = (todos = []) => {
  const fields = [
    { label: 'Todo ID', value: '_id' },
    { label: 'Title', value: 'title' },
    { label: 'Description', value: 'description' },
    { label: 'Status', value: 'status' },
    { label: 'Created At', value: (row) => formatDate(row.createdAt) },
    { label: 'Updated At', value: (row) => formatDate(row.updatedAt) },
    { label: 'Completed At', value: (row) => formatDate(row.completedAt) },
  ];

  const parser = new Parser({ fields });
  return parser.parse(todos);
};

/**
 * Generate CSV for Logs
 * @param {Array} logs
 * @returns {string}
 */
export const generateLogsCSV = (logs = []) => {
  const fields = [
    { label: 'Log ID', value: '_id' },
    { label: 'Action', value: 'action' },
    { label: 'Description', value: 'description' },
    { label: 'Todo ID', value: (row) => (row.todoId ? row.todoId.toString() : '') },
    { label: 'Timestamp', value: (row) => formatDate(row.timestamp) },
  ];

  const parser = new Parser({ fields });
  return parser.parse(logs);
};

/**
 * Generate Combined Complete CSV with Todos section and Logs section
 * @param {Array} todos
 * @param {Array} logs
 * @returns {string}
 */
export const generateCompleteCSV = (todos = [], logs = []) => {
  const now = new Date().toISOString();
  let content = `--- TODO APPLICATION COMPLETE EXPORT RECORD ---\nReport Generated At,${now}\nTotal Todos,${todos.length}\nTotal Logs,${logs.length}\n\n`;

  content += `--- SECTION 1: TODOS ---\n`;
  content += generateTodosCSV(todos);
  content += `\n\n--- SECTION 2: ACTIVITY LOGS ---\n`;
  content += generateLogsCSV(logs);

  return content;
};
