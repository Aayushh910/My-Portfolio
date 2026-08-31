import express from 'express';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  updateTodoStatus,
  deleteTodo,
  getTodoStats,
} from '../controllers/todoController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All Todo routes are protected
router.use(requireAuth);

router.get('/stats', getTodoStats);
router.get('/', getTodos);
router.get('/:id', getTodoById);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/status', updateTodoStatus);
router.delete('/:id', deleteTodo);

export default router;
