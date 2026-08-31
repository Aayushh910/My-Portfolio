import { Log } from '../models/Log.js';

export const getLogs = async (req, res) => {
  try {
    const { action, limit = 100, page = 1, user: queryUser } = req.query;
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    const filter = {};

    // Permission Scope:
    // If regular user: only see their own logs and activities
    if (!isAdmin) {
      const userConditions = [{ username: currentUser.username }];
      if (currentUser.id) {
        userConditions.push({ userId: currentUser.id });
      }
      filter.$or = userConditions;
    } else {
      // If Admin: can view all users' activities and can filter by specific user
      if (queryUser) {
        filter.username = queryUser.toLowerCase();
      }
    }

    if (action && action !== 'ALL') {
      filter.action = action;
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const totalLogs = await Log.countDocuments(filter);
    const logs = await Log.find(filter)
      .populate('todoId', 'title status')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    return res.status(200).json({
      success: true,
      total: totalLogs,
      page: parsedPage,
      totalPages: Math.ceil(totalLogs / parsedLimit) || 1,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('[LogController] GetLogs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity logs.',
    });
  }
};

export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    const log = await Log.findById(id).populate('todoId', 'title status').lean();

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found.',
      });
    }

    // Regular users can only access their own log
    if (
      !isAdmin &&
      log.username !== currentUser.username &&
      (!log.userId || log.userId.toString() !== currentUser.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this audit log.',
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('[LogController] GetLogById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity log.',
    });
  }
};
