const fs = require('fs');
const path = require('path');

const TASKS_CSV_FILE = path.join(__dirname, 'tasks.csv');

// Helper to escape values for CSV safely
function escapeCsvField(val) {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Parse CSV line handling quotes
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

// Initialize tasks.csv file with headers if it doesn't exist
function initTasksCsv() {
  if (!fs.existsSync(TASKS_CSV_FILE)) {
    const dir = path.dirname(TASKS_CSV_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const header = 'id,title,completed,createdAt,clientIp\n';
    const initialRow = `1,"Learn Node",false,"${new Date().toISOString()}","127.0.0.1"\n`;
    fs.writeFileSync(TASKS_CSV_FILE, header + initialRow, 'utf8');
    console.log('[FS] Created initial tasks.csv file at:', TASKS_CSV_FILE);
  }
}

// Read all tasks from tasks.csv file using fs module
function getTasksFromCsv() {
  initTasksCsv();
  try {
    const fileContent = fs.readFileSync(TASKS_CSV_FILE, 'utf8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];

    const tasks = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      if (fields.length >= 3) {
        const id = parseInt(fields[0]);
        const title = fields[1];
        const completed = fields[2] === 'true';
        const createdAt = fields[3] || new Date().toISOString();
        const clientIp = fields[4] || '127.0.0.1';
        if (!isNaN(id)) {
          tasks.push({ id, title, completed, createdAt, clientIp });
        }
      }
    }
    return tasks;
  } catch (err) {
    console.error('[FS] Error reading tasks.csv:', err);
    return [];
  }
}

// Append a new task to tasks.csv file using fs module
function addTaskToCsv(task) {
  initTasksCsv();
  const row = [
    task.id,
    escapeCsvField(task.title),
    task.completed ? 'true' : 'false',
    escapeCsvField(task.createdAt || new Date().toISOString()),
    escapeCsvField(task.clientIp || '127.0.0.1')
  ].join(',') + '\n';

  fs.appendFileSync(TASKS_CSV_FILE, row, 'utf8');
  console.log(`[FS] Appended task #${task.id} "${task.title}" to tasks.csv`);
}

// Save/Overwrite entire task list to tasks.csv file using fs module
function saveAllTasksToCsv(tasks) {
  initTasksCsv();
  const header = 'id,title,completed,createdAt,clientIp\n';
  const rows = tasks.map(task => [
    task.id,
    escapeCsvField(task.title),
    task.completed ? 'true' : 'false',
    escapeCsvField(task.createdAt || new Date().toISOString()),
    escapeCsvField(task.clientIp || '127.0.0.1')
  ].join(','));

  const content = header + rows.join('\n') + (rows.length > 0 ? '\n' : '');
  fs.writeFileSync(TASKS_CSV_FILE, content, 'utf8');
  console.log(`[FS] Updated tasks.csv with ${tasks.length} task(s).`);
}

initTasksCsv();

module.exports = {
  getTasksFromCsv,
  addTaskToCsv,
  saveAllTasksToCsv,
  TASKS_CSV_FILE
};
