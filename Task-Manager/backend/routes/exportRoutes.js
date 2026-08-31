import express from 'express';
import { exportPDF, exportCSV, getLastDownloads } from '../controllers/exportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All export routes require authentication
router.use(requireAuth);

router.get('/pdf', exportPDF);
router.get('/csv', exportCSV);
router.get('/last-downloads', getLastDownloads);

export default router;
