import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { todoService } from '../services/todoService';
import { TodoCard } from '../components/TodoCard';
import { TodoTable } from '../components/TodoTable';
import { TodoModal } from '../components/TodoModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { SearchBar } from '../components/SearchBar';
import { FilterControls } from '../components/FilterControls';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useNotification } from '../context/NotificationContext';

export const TodosPage = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState({});

  const { showSuccess, showError } = useNotification();

  const fetchTodos = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const params = {
        q: searchQuery,
        status: statusFilter,
        sort: sortBy,
      };

      const res = await todoService.getTodos(params);
      if (res.success) {
        setTodos(res.data || []);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load todos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, statusFilter, sortBy, showError]);

  useEffect(() => {
    fetchTodos();

    const handleMutation = () => fetchTodos(true);
    window.addEventListener('todo_mutated', handleMutation);
    return () => window.removeEventListener('todo_mutated', handleMutation);
  }, [fetchTodos]);

  const handleToggleStatus = async (todo) => {
    const nextStatus = todo.status === 'completed' ? 'incomplete' : 'completed';
    const nextCompletedAt = nextStatus === 'completed' ? new Date().toISOString() : null;

    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) =>
        t._id === todo._id ? { ...t, status: nextStatus, completedAt: nextCompletedAt } : t
      )
    );

    setTogglingIds((prev) => ({ ...prev, [todo._id]: true }));

    try {
      await todoService.updateStatus(todo._id, nextStatus);
      showSuccess(
        nextStatus === 'completed'
          ? '✓ Todo marked as completed'
          : '✓ Todo marked as incomplete'
      );
      // Background sync
      fetchTodos(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status');
      // Revert on error
      fetchTodos(true);
    } finally {
      setTogglingIds((prev) => {
        const copy = { ...prev };
        delete copy[todo._id];
        return copy;
      });
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
      await fetchTodos(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save todo.');
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
      await fetchTodos(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete todo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Counts for tabs
  const completedCount = todos.filter((t) => t.status === 'completed').length;
  const incompleteCount = todos.filter((t) => t.status === 'incomplete').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
            Todo Management
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Organize, prioritize, and track task completions in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTodos(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-borderMuted bg-surface text-muted hover:text-textMain hover:bg-black/5 transition-colors shadow-subtle"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-700' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTodo(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all focus-ring active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Todo</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Sorters, and View Toggle */}
      <div className="bg-surface rounded-2xl border border-borderMuted shadow-card p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />

          {/* Filter & Sort controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <FilterControls
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* View Mode Toggle: Grid / Table */}
            <div className="flex items-center bg-bgMain border border-borderMuted rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface text-brand-700 shadow-xs font-semibold'
                    : 'text-muted hover:text-textMain'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-surface text-brand-700 shadow-xs font-semibold'
                    : 'text-muted hover:text-textMain'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Todo List Content */}
      {isLoading ? (
        <LoadingSpinner message="Fetching todos from MongoDB..." />
      ) : todos.length === 0 ? (
        <EmptyState
          title={
            searchQuery || statusFilter !== 'all'
              ? 'No matching tasks found'
              : 'No tasks created yet'
          }
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filter to see more tasks.'
              : 'Get organized by creating your first todo task now.'
          }
          actionLabel={searchQuery || statusFilter !== 'all' ? 'Reset Filters' : 'Add Todo'}
          onAction={() => {
            if (searchQuery || statusFilter !== 'all') {
              setSearchQuery('');
              setStatusFilter('all');
            } else {
              setSelectedTodo(null);
              setIsModalOpen(true);
            }
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {todos.map((todo) => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onToggleStatus={handleToggleStatus}
              onEdit={(t) => {
                setSelectedTodo(t);
                setIsModalOpen(true);
              }}
              onDelete={(t) => setDeleteTarget(t)}
              isToggling={!!togglingIds[todo._id]}
            />
          ))}
        </div>
      ) : (
        <TodoTable
          todos={todos}
          onToggleStatus={handleToggleStatus}
          onEdit={(t) => {
            setSelectedTodo(t);
            setIsModalOpen(true);
          }}
          onDelete={(t) => setDeleteTarget(t)}
          togglingIds={togglingIds}
        />
      )}

      {/* Create / Edit Modal */}
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
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This operation is permanent and will be logged.`}
        confirmText="Delete Task"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
};
