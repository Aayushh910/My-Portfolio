import React, { useState, useEffect, useCallback } from 'react';
import {
  FileDown,
  FileText,
  Table,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ListTodo,
  History,
  Download,
  Cpu,
  Zap,
  RefreshCw,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { exportService } from '../services/exportService';
import { todoService } from '../services/todoService';
import { logService } from '../services/logService';
import { edaService } from '../services/edaService';
import { ExportPanel } from '../components/ExportPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const ExportPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';

  const [stats, setStats] = useState({ totalTodos: 0, totalLogs: 0 });
  const [lastDownloads, setLastDownloads] = useState({ lastPdf: null, lastCsv: null });
  const [isLoading, setIsLoading] = useState(true);

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [isAsyncExporting, setIsAsyncExporting] = useState(false);

  // Background Worker Jobs list (Admin Only)
  const [userJobs, setUserJobs] = useState([]);

  const { showSuccess, showError, showInfo } = useNotification();

  const loadExportData = useCallback(async () => {
    try {
      const promises = [
        todoService.getTodos({ status: 'all' }),
        logService.getLogs({ limit: 1 }),
        exportService.getLastDownloads(),
      ];

      // Only query async background jobs if user is Administrator
      if (isAdmin) {
        promises.push(edaService.getUserJobs());
      }

      const results = await Promise.all(promises);
      const todosRes = results[0];
      const logsRes = results[1];
      const downloadsRes = results[2];
      const jobsRes = isAdmin ? results[3] : null;

      setStats({
        totalTodos: todosRes.data?.length || 0,
        totalLogs: logsRes.total || 0,
      });

      if (downloadsRes.success) {
        setLastDownloads(downloadsRes.data);
      }

      if (jobsRes?.success) {
        setUserJobs(jobsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load export metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadExportData();
  }, [loadExportData]);

  // Listen to SSE job update events (Admin Only)
  useEffect(() => {
    if (!isAdmin) return;

    const handleJobEvent = (e) => {
      const envelope = e.detail;
      if (!envelope) return;

      if (envelope.type === 'job.progress') {
        const { jobId, progress, stage } = envelope.payload;
        setUserJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, progress, stage } : j))
        );
      } else if (envelope.type === 'job.completed') {
        const completedJob = envelope.payload?.job;
        if (completedJob) {
          setUserJobs((prev) => [
            completedJob,
            ...prev.filter((j) => j.id !== completedJob.id),
          ]);
        }
      }
    };

    window.addEventListener('job_updated', handleJobEvent);
    return () => window.removeEventListener('job_updated', handleJobEvent);
  }, [isAdmin]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      await exportService.downloadPDF();
      showSuccess('✓ PDF record generated & downloaded successfully');
      const downloadsRes = await exportService.getLastDownloads();
      if (downloadsRes.success) setLastDownloads(downloadsRes.data);
    } catch (err) {
      showError('Failed to generate PDF document.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadCSV = async (type = 'complete') => {
    try {
      setIsDownloadingCSV(true);
      await exportService.downloadCSV(type);
      showSuccess(`✓ CSV data (${type}) downloaded successfully`);
      const downloadsRes = await exportService.getLastDownloads();
      if (downloadsRes.success) setLastDownloads(downloadsRes.data);
    } catch (err) {
      showError('Failed to generate CSV export.');
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  const handleAsyncExport = async (type, csvType = 'complete') => {
    if (!isAdmin) {
      showError('Asynchronous background generation is restricted to Administrators.');
      return;
    }

    try {
      setIsAsyncExporting(true);
      await edaService.enqueueExportJob(type, csvType);
      showInfo(`⚡ Scheduled ${type.toUpperCase()} generation in asynchronous worker pool`);

      // Refresh jobs list
      const jobsRes = await edaService.getUserJobs();
      if (jobsRes.success) {
        setUserJobs(jobsRes.data);
      }
    } catch (err) {
      showError('Failed to schedule asynchronous export job.');
    } finally {
      setIsAsyncExporting(false);
    }
  };

  const handleDownloadArtifact = async (job) => {
    if (!isAdmin) {
      showError('Downloading async worker artifacts is restricted to Administrators.');
      return;
    }

    try {
      await edaService.downloadJobArtifact(job.id, job.result?.filename);
      showSuccess(`Downloaded ${job.result?.filename}`);
    } catch (err) {
      showError('Failed to download completed artifact.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading export records and database counters..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
          Export Application Records
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          {isAdmin
            ? 'Export full snapshots of your MongoDB todos and activity audit history directly or via asynchronous background task queues.'
            : 'Export your todos and activity logs directly in PDF or CSV formats.'}
        </p>
      </div>

      {/* Database Snapshot Stats Banner */}
      <div className="bg-surface rounded-2xl border border-borderMuted shadow-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
          Current Database Snapshot
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-bgMain border border-borderMuted/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
              <ListTodo className="w-4 h-4 text-brand-700" />
              <span>Total Todos In Database</span>
            </div>
            <p className="text-2xl font-bold text-textMain">{stats.totalTodos}</p>
          </div>

          <div className="p-4 rounded-xl bg-bgMain border border-borderMuted/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
              <History className="w-4 h-4 text-brand-700" />
              <span>Total Activity Logs</span>
            </div>
            <p className="text-2xl font-bold text-textMain">{stats.totalLogs}</p>
          </div>

          <div className="p-4 rounded-xl bg-bgMain border border-borderMuted/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Last PDF Export</span>
            </div>
            <p className="text-xs font-semibold text-textMain mt-1.5 truncate">
              {lastDownloads?.lastPdf ? formatDate(lastDownloads.lastPdf) : 'Never'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-bgMain border border-borderMuted/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
              <Table className="w-4 h-4 text-cyan-600" />
              <span>Last CSV Export</span>
            </div>
            <p className="text-xs font-semibold text-textMain mt-1.5 truncate">
              {lastDownloads?.lastCsv ? formatDate(lastDownloads.lastCsv) : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Export Action Component */}
      <ExportPanel
        lastDownloads={lastDownloads}
        onDownloadPDF={handleDownloadPDF}
        onDownloadCSV={handleDownloadCSV}
        onAsyncExport={handleAsyncExport}
        isDownloadingPDF={isDownloadingPDF}
        isDownloadingCSV={isDownloadingCSV}
        isAsyncExporting={isAsyncExporting}
        isAdmin={isAdmin}
      />

      {/* Asynchronous Background Worker Queue (Admin Only) */}
      {isAdmin && (
        <div className="bg-surface rounded-2xl border border-borderMuted shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-borderMuted">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-textMain">
                    Asynchronous Worker Pool & Job Queue
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-800 border border-brand-200">
                    Administrator
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Background task execution decoupled from the web server thread
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadExportData}
              className="p-1.5 text-muted hover:text-textMain hover:bg-black/5 rounded-lg transition-colors text-xs inline-flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {userJobs.length === 0 ? (
            <div className="py-10 text-center space-y-2 bg-bgMain rounded-xl border border-dashed border-borderMuted">
              <p className="text-xs font-semibold text-textMain">No background jobs in queue</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Click "Async Worker (EDA)" above on PDF or CSV to schedule non-blocking background
                generation!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userJobs.map((job) => {
                const isDone = job.status === 'completed';
                const isProcessing = job.status === 'processing' || job.status === 'queued';

                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-bgMain border border-borderMuted space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-surface border border-borderMuted text-textMain">
                          {job.type}
                        </span>
                        <span className="text-xs font-mono text-muted">{job.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : isProcessing
                              ? 'bg-amber-50 text-amber-700 border border-amber-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-300'
                          }`}
                        >
                          {isDone && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                          {isProcessing && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                          <span className="capitalize">{job.status}</span>
                        </span>

                        {isDone && (
                          <button
                            type="button"
                            onClick={() => handleDownloadArtifact(job)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span className="font-medium text-textMain text-[11px] truncate">
                          {job.stage || 'Executing background worker pipeline...'}
                        </span>
                        <span className="font-mono font-bold text-brand-700">{job.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-borderMuted/60 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isDone
                              ? 'bg-emerald-500'
                              : 'bg-brand-700 animate-pulse'
                          }`}
                          style={{ width: `${job.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* File Metadata */}
                    {job.result && (
                      <div className="flex items-center gap-3 text-[11px] text-muted pt-1">
                        <span>File: <strong className="text-textMain">{job.result.filename}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-textMain">{(job.result.sizeBytes / 1024).toFixed(1)} KB</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
