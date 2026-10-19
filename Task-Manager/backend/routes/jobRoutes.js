import express from 'express';
import {
  createExportJob,
  getJobStatus,
  downloadJobArtifact,
  getUserJobs,
} from '../controllers/jobController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All asynchronous background job processing & downloads are strictly restricted to Administrators
router.use(requireAuth);
router.use(requireAdmin);

router.post('/export', createExportJob);
router.get('/', getUserJobs);
router.get('/:id', getJobStatus);
router.get('/:id/download', downloadJobArtifact);

export default router;
