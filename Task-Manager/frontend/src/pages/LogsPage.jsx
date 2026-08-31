import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { logService } from '../services/logService';
import { ActivityLogItem } from '../components/ActivityLogItem';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useNotification } from '../context/NotificationContext';

export const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { showError } = useNotification();

  const fetchLogs = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const params = {
        limit: 150,
      };

      if (actionFilter !== 'ALL') {
        params.action = actionFilter;
      }

      const res = await logService.getLogs(params);
      if (res.success) {
        setLogs(res.data || []);
        setTotalCount(res.total || res.data?.length || 0);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to retrieve activity audit logs.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [actionFilter, showError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side search in descriptions & todo titles
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const descMatch = log.description?.toLowerCase().includes(term);
    const actionMatch = log.action?.toLowerCase().includes(term);
    const todoTitleMatch =
      typeof log.todoId === 'object' && log.todoId?.title?.toLowerCase().includes(term);
    return descMatch || actionMatch || todoTitleMatch;
  });

  const filterOptions = [
    { label: 'All Activities', value: 'ALL' },
    { label: 'User Registered', value: 'USER_REGISTERED' },
    { label: 'User Login', value: 'LOGIN' },
    { label: 'User Logout', value: 'LOGOUT' },
    { label: 'Todo Created', value: 'TODO_CREATED' },
    { label: 'Todo Updated', value: 'TODO_UPDATED' },
    { label: 'Todo Completed', value: 'TODO_COMPLETED' },
    { label: 'Marked Incomplete', value: 'TODO_MARKED_INCOMPLETE' },
    { label: 'Todo Deleted', value: 'TODO_DELETED' },
    { label: 'PDF Export', value: 'EXPORT_PDF' },
    { label: 'CSV Export', value: 'EXPORT_CSV' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
              Activity Logs & Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
              {totalCount} Logs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Complete immutable security audit trail stored directly in MongoDB.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-borderMuted bg-surface text-xs font-semibold text-textMain hover:bg-black/5 transition-colors shadow-subtle self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-700' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-3xl border border-borderMuted shadow-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search audit descriptions or actions..."
            onClear={() => setSearchTerm('')}
          />

          {/* Action Filter Pills Scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActionFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${actionFilter === opt.value
                    ? 'bg-brand-700 text-white font-semibold shadow-xs'
                    : 'bg-bgMain text-muted hover:text-textMain hover:bg-black/5 border border-borderMuted/60'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs Stream */}
      {isLoading ? (
        <LoadingSpinner message="Fetching activity logs from MongoDB..." />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activity logs found"
          description={
            searchTerm || actionFilter !== 'ALL'
              ? 'No activity entries match your selected filter.'
              : 'Audit trail is empty. Perform actions like creating or editing todos to generate logs.'
          }
          actionLabel={searchTerm || actionFilter !== 'ALL' ? 'Reset Filters' : undefined}
          onAction={() => {
            setSearchTerm('');
            setActionFilter('ALL');
          }}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-borderMuted shadow-card overflow-hidden divide-y divide-borderMuted/60">
          {filteredLogs.map((log) => (
            <ActivityLogItem key={log._id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
};
