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
} from 'lucide-react';
import { exportService } from '../services/exportService';
import { todoService } from '../services/todoService';
import { logService } from '../services/logService';
import { ExportPanel } from '../components/ExportPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

export const ExportPage = () => {
  const [stats, setStats] = useState({ totalTodos: 0, totalLogs: 0 });
  const [lastDownloads, setLastDownloads] = useState({ lastPdf: null, lastCsv: null });
  const [isLoading, setIsLoading] = useState(true);

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const { showSuccess, showError } = useNotification();

  const loadExportData = useCallback(async () => {
    try {
      const [todosRes, logsRes, downloadsRes] = await Promise.all([
        todoService.getTodos({ status: 'all' }),
        logService.getLogs({ limit: 1 }),
        exportService.getLastDownloads(),
      ]);

      setStats({
        totalTodos: todosRes.data?.length || 0,
        totalLogs: logsRes.total || 0,
      });

      if (downloadsRes.success) {
        setLastDownloads(downloadsRes.data);
      }
    } catch (err) {
      console.error('Failed to load export metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExportData();
  }, [loadExportData]);

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
          Export full snapshots of your MongoDB todos and activity audit history in PDF or CSV formats.
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
        isDownloadingPDF={isDownloadingPDF}
        isDownloadingCSV={isDownloadingCSV}
      />
    </div>
  );
};
