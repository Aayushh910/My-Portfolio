import express from 'express';
import { generateTaskDescription } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply optionalAuth so authenticated users are verified and unauthenticated testing works smoothly
router.use(optionalAuth);

// POST /api/ai/generate-description
router.post('/generate-description', generateTaskDescription);

export default router;
