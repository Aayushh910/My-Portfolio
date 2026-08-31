import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Plus,
  FileDown,
  Activity,
  Calendar,
  Layers,
} from 'lucide-react';
import { todoService } from '../services/todoService';
import { logService } from '../services/logService';
import { exportService } from '../services/exportService';
import { DashboardCard } from '../components/DashboardCard';
import { TodoCard } from '../components/TodoCard';
import { ActivityLogItem } from '../components/ActivityLogItem';
import { TodoModal } from '../components/TodoModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ExportPanel } from '../components/ExportPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useNotification } from '../context/NotificationContext';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    recentlyCreated: 0,
    recentTodos: [],
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [lastDownloads, setLastDownloads] = useState({ lastPdf: null, lastCsv: null });
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Exporting states
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, logsRes, downloadsRes] = await Promise.all([
        todoService.getStats(),
        logService.getLogs({ limit: 6 }),
        exportService.getLastDownloads(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success) setRecentLogs(logsRes.data || []);
      if (downloadsRes.success) setLastDownloads(downloadsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Listen for cross-component mutations
    const handleMutation = () => fetchDashboardData();
    window.addEventListener('todo_mutated', handleMutation);
    return () => window.removeEventListener('todo_mutated', handleMutation);
  }, [fetchDashboardData]);

  const handleToggleStatus = async (todo) => {
    try {
      setTogglingId(todo._id);
      const nextStatus = todo.status === 'completed' ? 'incomplete' : 'completed';
      await todoService.updateStatus(todo._id, nextStatus);
      showSuccess(
        nextStatus === 'completed'
          ? '✓ Todo marked as completed'
          : '✓ Todo marked as incomplete'
      );
      await fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleModalSubmit = async (todoData) => {
    try {
      setIsSubmitting(true);
      if (selectedTodo) {
        await todoService.updateTodo(selectedTodo._id, todoData);
        showSuccess('✓ Todo updated successfully');
      } else {
        await todoService.createTodo(todoData);
        showSuccess('✓ Todo created successfully');
      }
      setIsModalOpen(false);
      setSelectedTodo(null);
      await fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await todoService.deleteTodo(deleteTarget._id);
      showSuccess('✓ Todo deleted successfully');
      setDeleteTarget(null);
      await fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete todo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      await exportService.downloadPDF();
      showSuccess('✓ PDF report generated & downloaded');
      const downloadsRes = await exportService.getLastDownloads();
      if (downloadsRes.success) setLastDownloads(downloadsRes.data);
    } catch (err) {
      showError('Failed to generate PDF export.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadCSV = async (type) => {
    try {
      setIsDownloadingCSV(true);
      await exportService.downloadCSV(type);
      showSuccess('✓ CSV records generated & downloaded');
      const downloadsRes = await exportService.getLastDownloads();
      if (downloadsRes.success) setLastDownloads(downloadsRes.data);
    } catch (err) {
      showError('Failed to generate CSV export.');
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard metrics & real-time logs..." />;
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time status monitoring, activity audit trail, and quick actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedTodo(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all focus-ring active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <DashboardCard
          title="Total Tasks"
          value={stats.total}
          subtitle="All tasks tracked in MongoDB"
          icon={ListTodo}
          color="brand"
        />
        <DashboardCard
          title="Pending Tasks"
          value={stats.pending}
          subtitle="Awaiting completion"
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title="Completed Tasks"
          value={stats.completed}
          subtitle={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <DashboardCard
          title="Recently Created"
          value={stats.recentlyCreated}
          subtitle="Added within the last 24 hours"
          icon={Sparkles}
          color="blue"
        />
      </div>

      {/* Two Column Section: Recent Todos & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Recent Todos */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-700" />
              <h2 className="text-lg font-bold text-textMain tracking-tight">Recent Tasks</h2>
            </div>
            <Link
              to="/todos"
              className="text-xs font-semibold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 group"
            >
              <span>View All Tasks</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {stats.recentTodos.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description="Create your first task to start organizing your workflow."
              actionLabel="Create Todo"
              onAction={() => {
                setSelectedTodo(null);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.recentTodos.map((todo) => (
                <TodoCard
                  key={todo._id}
                  todo={todo}
                  onToggleStatus={handleToggleStatus}
                  onEdit={(t) => {
                    setSelectedTodo(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={(t) => setDeleteTarget(t)}
                  isToggling={togglingId === todo._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Activity Audit Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-700" />
              <h2 className="text-lg font-bold text-textMain tracking-tight">Recent Activity</h2>
            </div>
            <Link
              to="/logs"
              className="text-xs font-semibold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 group"
            >
              <span>View All Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="bg-surface rounded-2xl border border-borderMuted shadow-card overflow-hidden divide-y divide-borderMuted/60">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted">
                No activity logs recorded yet.
              </div>
            ) : (
              recentLogs.map((log) => (
                <ActivityLogItem key={log._id} log={log} showBorder={false} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Export Records Section */}
      <div>
        <ExportPanel
          lastDownloads={lastDownloads}
          onDownloadPDF={handleDownloadPDF}
          onDownloadCSV={handleDownloadCSV}
          isDownloadingPDF={isDownloadingPDF}
          isDownloadingCSV={isDownloadingCSV}
        />
      </div>

      {/* Create / Edit Todo Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTodo(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={selectedTodo}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Todo Task"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This will be recorded in the audit log.`}
        confirmText="Delete Task"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
};
