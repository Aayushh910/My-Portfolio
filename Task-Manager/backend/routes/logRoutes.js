import express from 'express';
import { getLogs, getLogById } from '../controllers/logController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All Log routes are protected
router.use(requireAuth);

router.get('/', getLogs);
router.get('/:id', getLogById);

export default router;
