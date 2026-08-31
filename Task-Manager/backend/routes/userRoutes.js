import express from 'express';
import { getAllUsers, getUserById } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user management routes require Authentication + Admin role
router.use(requireAuth);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

export default router;
