import mongoose from 'mongoose';
import { Todo } from '../models/Todo.js';
import { createLog } from '../services/logService.js';
import {
  generateTaskCacheKey,
  getCachedData,
  setCachedData,
  invalidateTaskCache,
  getCacheStats,
  flushAllCache,
} from '../services/cacheService.js';
import { eventBus } from '../events/eventBus.js';
import { EVENT_TYPES } from '../events/eventTypes.js';

export const getTodos = async (req, res) => {
  const startTime = performance.now();
  try {
    const { q, status, sort } = req.query;
    const currentUser = req.user;
    const userIdentifier = currentUser?.id || currentUser?.username || 'admin';
    const cacheKey = generateTaskCacheKey(userIdentifier, req.query);

    // 1. Cache check (node-cache)
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      const responseTime = (performance.now() - startTime).toFixed(2);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${responseTime}ms`);

      return res.status(200).json({
        success: true,
        cached: true,
        source: 'cache',
        responseTime: `${responseTime}ms`,
        count: cachedData.length,
        data: cachedData,
      });
    }

    // 2. Cache MISS -> Query MongoDB
    const userConditions = [{ createdBy: currentUser?.username || 'admin' }];
    if (currentUser?.id) {
      userConditions.push({ userId: currentUser.id });
    }
    const filter = { $or: userConditions };

    // Status filter
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }

    // Search query in title or description
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      const searchCondition = [{ title: searchRegex }, { description: searchRegex }];

      filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
      delete filter.$or;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'recently_updated') {
      sortOptions = { updatedAt: -1 };
    }

    const todos = await Todo.find(filter).sort(sortOptions).lean();

    // 3. Store result in cache (60 seconds TTL)
    setCachedData(cacheKey, todos, 60);

    const responseTime = (performance.now() - startTime).toFixed(2);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    return res.status(200).json({
      success: true,
      cached: false,
      source: 'mongodb',
      responseTime: `${responseTime}ms`,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    console.error('[TodoController] GetTodos Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve todos.',
    });
  }
};

export const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Todo ID format.',
      });
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found.',
      });
    }

    // Check ownership if not admin
    if (
      !isAdmin &&
      todo.createdBy !== currentUser.username &&
      (!todo.userId || todo.userId.toString() !== currentUser.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this todo.',
      });
    }

    return res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    console.error('[TodoController] GetTodoById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve todo.',
    });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const currentUser = req.user;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Todo title is required.',
      });
    }

    const initialStatus = status === 'completed' ? 'completed' : 'incomplete';
    const completedAt = initialStatus === 'completed' ? new Date() : null;

    const todo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: initialStatus,
      userId: currentUser?.id || null,
      createdBy: currentUser?.username || 'admin',
      completedAt,
    });

    await todo.save();

    // Asynchronously dispatch domain event; subscribers handle audit logging & cache invalidation
    eventBus.publish(
      EVENT_TYPES.TODO_CREATED,
      { todo, user: currentUser },
      {
        userId: currentUser?.id || null,
        username: currentUser?.username || 'admin',
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo,
    });
  } catch (error) {
    console.error('[TodoController] CreateTodo Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create todo.',
    });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Todo ID format.',
      });
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found.',
      });
    }

    // Check ownership if not admin
    if (
      !isAdmin &&
      todo.createdBy !== currentUser.username &&
      (!todo.userId || todo.userId.toString() !== currentUser.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this todo.',
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Todo title cannot be empty.',
        });
      }
      todo.title = title.trim();
    }

    if (description !== undefined) {
      todo.description = description.trim();
    }

    if (status !== undefined) {
      const normalizedStatus = status.toLowerCase();
      if (['incomplete', 'completed'].includes(normalizedStatus)) {
        if (todo.status !== normalizedStatus) {
          todo.status = normalizedStatus;
          todo.completedAt = normalizedStatus === 'completed' ? new Date() : null;
        }
      }
    }

    await todo.save();

    // Asynchronously dispatch domain event
    eventBus.publish(
      EVENT_TYPES.TODO_UPDATED,
      {
        todo,
        changes: { title, description, status },
        user: currentUser,
      },
      {
        userId: currentUser?.id || null,
        username: currentUser?.username || 'admin',
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: todo,
    });
  } catch (error) {
    console.error('[TodoController] UpdateTodo Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update todo.',
    });
  }
};

export const updateTodoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Todo ID format.',
      });
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found.',
      });
    }

    // Check ownership if not admin
    if (
      !isAdmin &&
      todo.createdBy !== currentUser.username &&
      (!todo.userId || todo.userId.toString() !== currentUser.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this todo.',
      });
    }

    // Determine target status
    let targetStatus = status;
    if (!targetStatus) {
      targetStatus = todo.status === 'completed' ? 'incomplete' : 'completed';
    } else {
      targetStatus = targetStatus.toLowerCase();
    }

    if (!['incomplete', 'completed'].includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "incomplete" or "completed".',
      });
    }

    todo.status = targetStatus;
    todo.completedAt = targetStatus === 'completed' ? new Date() : null;
    await todo.save();

    await todo.save();

    // Asynchronously dispatch domain event
    eventBus.publish(
      EVENT_TYPES.TODO_STATUS_CHANGED,
      {
        todo,
        previousStatus: todo.status === 'completed' ? 'incomplete' : 'completed',
        newStatus: targetStatus,
        user: currentUser,
      },
      {
        userId: currentUser?.id || null,
        username: currentUser?.username || 'admin',
      }
    );

    return res.status(200).json({
      success: true,
      message: targetStatus === 'completed' ? 'Todo marked as completed' : 'Todo marked as incomplete',
      data: todo,
    });
  } catch (error) {
    console.error('[TodoController] UpdateTodoStatus Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update todo status.',
    });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const isAdmin = currentUser?.role === 'Administrator';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Todo ID format.',
      });
    }

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found.',
      });
    }

    // Check ownership if not admin
    if (
      !isAdmin &&
      todo.createdBy !== currentUser.username &&
      (!todo.userId || todo.userId.toString() !== currentUser.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this todo.',
      });
    }

    const todoTitle = todo.title;
    const todoId = todo._id;

    await Todo.findByIdAndDelete(id);

    // Asynchronously dispatch domain event
    eventBus.publish(
      EVENT_TYPES.TODO_DELETED,
      {
        todoId: id,
        title: todoTitle,
        user: currentUser,
      },
      {
        userId: currentUser?.id || null,
        username: currentUser?.username || 'admin',
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('[TodoController] DeleteTodo Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete todo.',
    });
  }
};

export const getTodoStats = async (req, res) => {
  try {
    const currentUser = req.user;

    const userConditions = [{ createdBy: currentUser.username }];
    if (currentUser.id) {
      userConditions.push({ userId: currentUser.id });
    }
    const baseFilter = { $or: userConditions };

    const total = await Todo.countDocuments(baseFilter);
    const completed = await Todo.countDocuments({ ...baseFilter, status: 'completed' });
    const pending = total - completed;

    // Recently created within 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyCreated = await Todo.countDocuments({
      ...baseFilter,
      createdAt: { $gte: last24h },
    });

    // Latest 5 todos
    const recentTodos = await Todo.find(baseFilter).sort({ createdAt: -1 }).limit(5).lean();

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        completed,
        recentlyCreated,
        recentTodos,
      },
    });
  } catch (error) {
    console.error('[TodoController] GetTodoStats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics.',
    });
  }
};

/**
 * Controller to inspect current cache keys and statistics
 */
export const getCacheStatsHandler = (req, res) => {
  const stats = getCacheStats();
  return res.status(200).json({
    success: true,
    ...stats,
  });
};

/**
 * Controller to manually flush cache (useful for benchmarks/testing)
 */
export const clearCacheHandler = (req, res) => {
  flushAllCache();
  return res.status(200).json({
    success: true,
    message: 'Cache flushed successfully.',
  });
};

