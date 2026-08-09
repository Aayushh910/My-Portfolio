const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { logToCsv } = require('../middleware/csvLogger');

// GET /tasks - Retrieve all tasks from MongoDB
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });

    logToCsv({
      req,
      action: 'FETCH_ALL_TASKS',
      details: `Retrieved ${tasks.length} task(s) from MongoDB`,
    });

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Get a single task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      logToCsv({
        req,
        action: 'FETCH_TASK_NOT_FOUND',
        taskId: req.params.id,
      });
      return res.status(404).json({ status: 'fail', message: 'Task not found' });
    }

    logToCsv({
      req,
      action: 'FETCH_SINGLE_TASK',
      taskId: task._id,
      taskTitle: task.title,
    });

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a new task in MongoDB
router.post('/', async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    const newTask = await Task.create({
      title,
      description,
      completed,
    });

    logToCsv({
      req,
      action: 'CREATE_TASK',
      taskId: newTask._id,
      taskTitle: newTask.title,
      completed: newTask.completed,
    });

    res.status(201).json(newTask);
  } catch (err) {
    logToCsv({
      req,
      action: 'CREATE_TASK_FAILED',
      details: err.message,
    });
    next(err);
  }
});

// PUT /tasks/:id - Update an existing task in MongoDB
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      logToCsv({
        req,
        action: 'UPDATE_TASK_NOT_FOUND',
        taskId: req.params.id,
      });
      return res.status(404).json({ status: 'fail', message: 'Task not found' });
    }

    logToCsv({
      req,
      action: 'UPDATE_TASK',
      taskId: updatedTask._id,
      taskTitle: updatedTask.title,
      completed: updatedTask.completed,
    });

    res.status(200).json(updatedTask);
  } catch (err) {
    logToCsv({
      req,
      action: 'UPDATE_TASK_FAILED',
      taskId: req.params.id,
      details: err.message,
    });
    next(err);
  }
});

// DELETE /tasks/:id - Delete a task from MongoDB
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      logToCsv({
        req,
        action: 'DELETE_TASK_NOT_FOUND',
        taskId: req.params.id,
      });
      return res.status(404).json({ status: 'fail', message: 'Task not found' });
    }

    logToCsv({
      req,
      action: 'DELETE_TASK',
      taskId: deletedTask._id,
      taskTitle: deletedTask.title,
      completed: deletedTask.completed,
    });

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      task: deletedTask,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
