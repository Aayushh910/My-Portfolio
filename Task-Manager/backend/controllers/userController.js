import { User } from '../models/User.js';
import { Todo } from '../models/Todo.js';
import { Log } from '../models/Log.js';

/**
 * Get all registered users with summary task metrics (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    if (req.user?.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Administrator role required.',
      });
    }

    const { q } = req.query;
    const filter = {};

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { username: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();

    // Attach task summary and last login info for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const [totalTasks, completedTasks, lastLoginLog] = await Promise.all([
          Todo.countDocuments({ $or: [{ userId: u._id }, { createdBy: u.username }] }),
          Todo.countDocuments({
            $or: [{ userId: u._id }, { createdBy: u.username }],
            status: 'completed',
          }),
          Log.findOne({
            $or: [{ userId: u._id }, { username: u.username }],
            action: 'LOGIN',
          })
            .sort({ timestamp: -1 })
            .lean(),
        ]);

        return {
          ...u,
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks,
          lastLogin: lastLoginLog ? lastLoginLog.timestamp : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    console.error('[UserController] GetAllUsers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user directory.',
    });
  }
};

/**
 * Get single user details (Admin only)
 */
export const getUserById = async (req, res) => {
  try {
    if (req.user?.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Administrator role required.',
      });
    }

    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const [totalTasks, completedTasks, lastLoginLog] = await Promise.all([
      Todo.countDocuments({ $or: [{ userId: user._id }, { createdBy: user.username }] }),
      Todo.countDocuments({
        $or: [{ userId: user._id }, { createdBy: user.username }],
        status: 'completed',
      }),
      Log.findOne({
        $or: [{ userId: user._id }, { username: user.username }],
        action: 'LOGIN',
      })
        .sort({ timestamp: -1 })
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        lastLogin: lastLoginLog ? lastLoginLog.timestamp : null,
      },
    });
  } catch (error) {
    console.error('[UserController] GetUserById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user details.',
    });
  }
};
