import { jobQueue } from '../services/jobQueueService.js';

/**
 * Controller for Asynchronous Job Processing
 */

export const createExportJob = (req, res) => {
  try {
    const { type = 'pdf', csvType = 'complete' } = req.body;
    const currentUser = req.user;

    const job = jobQueue.enqueueExportJob(type, { csvType }, currentUser);

    return res.status(202).json({
      success: true,
      message: 'Export job accepted and running in asynchronous background worker.',
      data: job,
    });
  } catch (err) {
    console.error('[JobController] CreateExportJob Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to enqueue export job.',
    });
  }
};

export const getJobStatus = (req, res) => {
  try {
    const { id } = req.params;
    const job = jobQueue.getJob(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or has expired.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: job.id,
        type: job.type,
        exportType: job.exportType,
        status: job.status,
        progress: job.progress,
        stage: job.stage,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        result: job.result,
        error: job.error,
      },
    });
  } catch (err) {
    console.error('[JobController] GetJobStatus Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job status.',
    });
  }
};

export const downloadJobArtifact = (req, res) => {
  try {
    const { id } = req.params;
    const artifact = jobQueue.getArtifact(id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found or has expired.',
      });
    }

    res.setHeader('Content-Type', artifact.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${artifact.filename}"`);

    if (Buffer.isBuffer(artifact.data)) {
      res.setHeader('Content-Length', artifact.data.length);
      return res.status(200).send(artifact.data);
    } else {
      return res.status(200).send(artifact.data);
    }
  } catch (err) {
    console.error('[JobController] DownloadJobArtifact Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to download artifact.',
    });
  }
};

export const getUserJobs = (req, res) => {
  try {
    const currentUser = req.user;
    const jobs = jobQueue.getUserJobs(currentUser?.id, currentUser?.username);

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (err) {
    console.error('[JobController] GetUserJobs Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs list.',
    });
  }
};
