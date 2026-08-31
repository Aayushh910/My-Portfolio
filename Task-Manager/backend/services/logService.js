import { Log } from '../models/Log.js';

/**
 * Creates and saves an activity log entry in MongoDB
 * @param {string} action - Action enum (e.g. TODO_CREATED, LOGIN, etc.)
 * @param {string} description - Human-readable description
 * @param {string|mongoose.Types.ObjectId|null} todoId - Related Todo ID if applicable
 * @param {string|mongoose.Types.ObjectId|null} userId - Actor User ID
 * @param {string} username - Actor Username
 * @returns {Promise<Log>}
 */
export const createLog = async (
  action,
  description,
  todoId = null,
  userId = null,
  username = 'admin'
) => {
  try {
    const log = new Log({
      action,
      description,
      todoId: todoId || null,
      userId: userId || null,
      username: username || 'admin',
      timestamp: new Date(),
    });
    await log.save();
    return log;
  } catch (error) {
    console.error(`[LogService] Failed to record activity log (${action}):`, error.message);
    return null;
  }
};

/**
 * Get the latest download timestamps for PDF and CSV exports
 * @param {string|mongoose.Types.ObjectId|null} userId
 * @param {boolean} isAdmin
 * @returns {Promise<{ lastPdf: Date|null, lastCsv: Date|null }>}
 */
export const getLastDownloadTimestamps = async (userId = null, isAdmin = false) => {
  try {
    const filterPdf = { action: 'EXPORT_PDF' };
    const filterCsv = { action: 'EXPORT_CSV' };

    if (!isAdmin && userId) {
      filterPdf.userId = userId;
      filterCsv.userId = userId;
    }

    const [lastPdfLog, lastCsvLog] = await Promise.all([
      Log.findOne(filterPdf).sort({ timestamp: -1 }).lean(),
      Log.findOne(filterCsv).sort({ timestamp: -1 }).lean(),
    ]);

    return {
      lastPdf: lastPdfLog ? lastPdfLog.timestamp : null,
      lastCsv: lastCsvLog ? lastCsvLog.timestamp : null,
    };
  } catch (error) {
    console.error('[LogService] Failed to get last download timestamps:', error.message);
    return { lastPdf: null, lastCsv: null };
  }
};
