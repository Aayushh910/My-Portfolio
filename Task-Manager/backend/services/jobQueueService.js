import { eventBus } from '../events/eventBus.js';
import { EVENT_TYPES } from '../events/eventTypes.js';
import { Todo } from '../models/Todo.js';
import { Log } from '../models/Log.js';
import { generateCompletePDF } from './pdfService.js';
import { generateCompleteCSV, generateTodosCSV, generateLogsCSV } from './csvService.js';

class JobQueueService {
  constructor() {
    this.jobs = new Map(); // jobId -> Job
    this.artifacts = new Map(); // jobId -> { data, mimeType, filename, expiresAt }
    this.isProcessing = false;
    this.queue = []; // Array of jobIds

    // Periodic cleanup of expired artifacts (TTL: 15 minutes)
    setInterval(() => this.cleanupExpiredArtifacts(), 60000);
  }

  /**
   * Enqueues an asynchronous export job
   * @param {'pdf'|'csv'} exportType
   * @param {object} options { csvType }
   * @param {object} user
   * @returns {object} Job metadata
   */
  enqueueExportJob(exportType, options = {}, user = {}) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const job = {
      id: jobId,
      type: exportType === 'pdf' ? 'EXPORT_PDF' : 'EXPORT_CSV',
      exportType,
      options,
      status: 'queued',
      progress: 0,
      stage: 'Job enqueued in async worker pipeline',
      user: {
        id: user?.id || user?._id || null,
        username: user?.username || 'admin',
        role: user?.role || 'User',
      },
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null,
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);

    // Publish JOB_ENQUEUED event asynchronously
    eventBus.publish(EVENT_TYPES.JOB_ENQUEUED, { job }, {
      userId: job.user.id,
      username: job.user.username,
      jobId,
    });

    // Trigger queue processing worker
    this.processNext();

    return {
      jobId: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      message: 'Job successfully scheduled in asynchronous worker pool',
      createdAt: job.createdAt,
    };
  }

  /**
   * Worker loop that picks up next job in queue
   */
  async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const jobId = this.queue.shift();
    const job = this.jobs.get(jobId);

    if (!job) {
      this.isProcessing = false;
      return this.processNext();
    }

    try {
      job.status = 'processing';
      job.startedAt = new Date().toISOString();
      job.progress = 15;
      job.stage = 'Querying database records for export snapshot';
      this.updateJobProgress(job, 15, job.stage);

      // 1. Fetch data with user scoping
      const isAdmin = job.user.role === 'Administrator';
      const todoFilter = {};
      const logFilter = {};

      if (!isAdmin) {
        const userConditions = [{ createdBy: job.user.username }];
        if (job.user.id) {
          userConditions.push({ userId: job.user.id });
        }
        todoFilter.$or = userConditions;

        const logConditions = [{ username: job.user.username }];
        if (job.user.id) {
          logConditions.push({ userId: job.user.id });
        }
        logFilter.$or = logConditions;
      }

      const todos = await Todo.find(todoFilter).sort({ createdAt: -1 }).lean();
      const logs = await Log.find(logFilter).sort({ timestamp: -1 }).lean();

      this.updateJobProgress(job, 45, `Fetched ${todos.length} tasks and ${logs.length} audit logs`);

      // Artificial asynchronous delay simulator (e.g. 600ms) to allow realistic progress tracking
      await new Promise((resolve) => setTimeout(resolve, 600));

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      if (job.exportType === 'pdf') {
        this.updateJobProgress(job, 70, 'Compiling PDF document with PDFKit engine');
        const pdfBuffer = await generateCompletePDF(todos, logs);

        const filename = `todo_report_${job.user.username}_${timestamp}.pdf`;
        this.saveArtifact(job.id, pdfBuffer, 'application/pdf', filename);

        job.result = {
          filename,
          mimeType: 'application/pdf',
          sizeBytes: pdfBuffer.length,
          totalTodos: todos.length,
          totalLogs: logs.length,
          downloadUrl: `/api/jobs/${job.id}/download`,
        };
      } else {
        this.updateJobProgress(job, 70, 'Compiling tabular CSV spreadsheet');
        const csvType = job.options.csvType || 'complete';
        let csvData = '';

        if (csvType === 'todos') {
          csvData = generateTodosCSV(todos);
        } else if (csvType === 'logs') {
          csvData = generateLogsCSV(logs);
        } else {
          csvData = generateCompleteCSV(todos, logs);
        }

        const filename = `todo_${csvType}_${job.user.username}_${timestamp}.csv`;
        this.saveArtifact(job.id, csvData, 'text/csv', filename);

        job.result = {
          filename,
          mimeType: 'text/csv',
          sizeBytes: Buffer.byteLength(csvData, 'utf8'),
          totalTodos: todos.length,
          totalLogs: logs.length,
          downloadUrl: `/api/jobs/${job.id}/download`,
        };
      }

      job.status = 'completed';
      job.progress = 100;
      job.stage = 'Asynchronous generation completed. Ready for download.';
      job.completedAt = new Date().toISOString();

      eventBus.publish(EVENT_TYPES.JOB_COMPLETED, { job }, {
        userId: job.user.id,
        username: job.user.username,
        jobId: job.id,
      });
    } catch (err) {
      console.error(`[JobQueue] Job ${jobId} failed:`, err);
      job.status = 'failed';
      job.error = err.message || 'Job execution encountered an unexpected failure';
      job.completedAt = new Date().toISOString();

      eventBus.publish(EVENT_TYPES.JOB_FAILED, { job, error: job.error }, {
        userId: job.user.id,
        username: job.user.username,
        jobId: job.id,
      });
    } finally {
      this.isProcessing = false;
      // Continue next job in queue
      setImmediate(() => this.processNext());
    }
  }

  updateJobProgress(job, progress, stage) {
    job.progress = progress;
    job.stage = stage;
    eventBus.publish(EVENT_TYPES.JOB_PROGRESS, {
      jobId: job.id,
      progress,
      stage,
      status: job.status,
    }, {
      userId: job.user.id,
      username: job.user.username,
      jobId: job.id,
    });
  }

  saveArtifact(jobId, data, mimeType, filename) {
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
    this.artifacts.set(jobId, { data, mimeType, filename, expiresAt });
  }

  getArtifact(jobId) {
    return this.artifacts.get(jobId);
  }

  cleanupExpiredArtifacts() {
    const now = Date.now();
    for (const [jobId, artifact] of this.artifacts.entries()) {
      if (now > artifact.expiresAt) {
        this.artifacts.delete(jobId);
      }
    }
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getUserJobs(userId, username, limit = 10) {
    const userJobs = [];
    for (const job of this.jobs.values()) {
      if (
        (userId && job.user?.id && String(job.user.id) === String(userId)) ||
        (username && job.user?.username === username)
      ) {
        userJobs.unshift({
          id: job.id,
          type: job.type,
          exportType: job.exportType,
          status: job.status,
          progress: job.progress,
          stage: job.stage,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          result: job.result,
          error: job.error,
        });
      }
    }
    return userJobs.slice(0, limit);
  }
}

export const jobQueue = new JobQueueService();
