import { Todo } from '../models/Todo.js';
import { Log } from '../models/Log.js';
import { createLog, getLastDownloadTimestamps } from '../services/logService.js';
import { generateCompletePDF } from '../services/pdfService.js';
import { generateCompleteCSV, generateTodosCSV, generateLogsCSV } from '../services/csvService.js';

export const exportPDF = async (req, res) => {
  try {
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    const todoFilter = {};
    const logFilter = {};

    if (!isAdmin) {
      const userConditions = [{ createdBy: currentUser.username }];
      if (currentUser.id) {
        userConditions.push({ userId: currentUser.id });
      }
      todoFilter.$or = userConditions;

      const logConditions = [{ username: currentUser.username }];
      if (currentUser.id) {
        logConditions.push({ userId: currentUser.id });
      }
      logFilter.$or = logConditions;
    }

    const todos = await Todo.find(todoFilter).sort({ createdAt: -1 }).lean();
    const logs = await Log.find(logFilter).sort({ timestamp: -1 }).lean();

    const pdfBuffer = await generateCompletePDF(todos, logs);

    // Record activity log in MongoDB with actor context
    await createLog(
      'EXPORT_PDF',
      `Generated and downloaded complete PDF report (${todos.length} todos, ${logs.length} logs).`,
      null,
      currentUser?.id || null,
      currentUser?.username || 'admin'
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `todo_report_${currentUser?.username || 'admin'}_${timestamp}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('[ExportController] ExportPDF Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF export.',
    });
  }
};

export const exportCSV = async (req, res) => {
  try {
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';
    const { type = 'complete' } = req.query; // 'complete' | 'todos' | 'logs'

    const todoFilter = {};
    const logFilter = {};

    if (!isAdmin) {
      const userConditions = [{ createdBy: currentUser.username }];
      if (currentUser.id) {
        userConditions.push({ userId: currentUser.id });
      }
      todoFilter.$or = userConditions;

      const logConditions = [{ username: currentUser.username }];
      if (currentUser.id) {
        logConditions.push({ userId: currentUser.id });
      }
      logFilter.$or = logConditions;
    }

    const todos = await Todo.find(todoFilter).sort({ createdAt: -1 }).lean();
    const logs = await Log.find(logFilter).sort({ timestamp: -1 }).lean();

    let csvData = '';
    let filenameSuffix = 'complete';

    if (type === 'todos') {
      csvData = generateTodosCSV(todos);
      filenameSuffix = 'todos';
    } else if (type === 'logs') {
      csvData = generateLogsCSV(logs);
      filenameSuffix = 'logs';
    } else {
      csvData = generateCompleteCSV(todos, logs);
      filenameSuffix = 'complete';
    }

    // Record activity log in MongoDB
    await createLog(
      'EXPORT_CSV',
      `Generated and downloaded CSV record (type: ${filenameSuffix}, ${todos.length} todos, ${logs.length} logs).`,
      null,
      currentUser?.id || null,
      currentUser?.username || 'admin'
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `todo_${filenameSuffix}_${currentUser?.username || 'admin'}_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csvData);
  } catch (error) {
    console.error('[ExportController] ExportCSV Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate CSV export.',
    });
  }
};

export const getLastDownloads = async (req, res) => {
  try {
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    const timestamps = await getLastDownloadTimestamps(currentUser?.id || null, isAdmin);
    return res.status(200).json({
      success: true,
      data: timestamps,
    });
  } catch (error) {
    console.error('[ExportController] GetLastDownloads Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve download timestamps.',
    });
  }
};
