import express from 'express';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  updateTodoStatus,
  deleteTodo,
  getTodoStats,
  getCacheStatsHandler,
  clearCacheHandler,
} from '../controllers/todoController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Use optionalAuth so that authenticated users are strictly scoped,
// while direct tests via Thunder Client or Postman without token work seamlessly.
router.use(optionalAuth);

// Cache inspection & flush endpoints
router.get('/cache/stats', getCacheStatsHandler);
router.post('/cache/clear', clearCacheHandler);
router.delete('/cache', clearCacheHandler);

router.get('/stats', getTodoStats);
router.get('/', getTodos);
router.get('/:id', getTodoById);
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/status', updateTodoStatus);
router.delete('/:id', deleteTodo);

export default router;

