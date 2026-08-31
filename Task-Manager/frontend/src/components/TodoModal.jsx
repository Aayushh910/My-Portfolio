import React, { useState, useEffect } from 'react';
import { X, Check, CheckCircle2, Clock } from 'lucide-react';

export const TodoModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const isEdit = !!initialData;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('incomplete');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setStatus(initialData.status || 'incomplete');
      } else {
        setTitle('');
        setDescription('');
        setStatus('incomplete');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the todo.');
      return;
    }
    setError('');
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface rounded-2xl border border-borderMuted shadow-modal max-w-lg w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderMuted">
          <div>
            <h2 className="text-lg font-bold text-textMain tracking-tight">
              {isEdit ? 'Edit Todo' : 'Create New Todo'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {isEdit ? 'Update task details and completion status' : 'Add a new task to your management workspace'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-muted hover:text-textMain p-1.5 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Title field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Implement authentication middleware"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
              autoFocus
            />
          </div>

          {/* Description field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
              Description <span className="text-muted text-[11px] font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              placeholder="Add additional context or notes for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring resize-none transition-colors"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
              Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('incomplete')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  status === 'incomplete'
                    ? 'border-amber-400 bg-amber-50/80 text-amber-900 ring-2 ring-amber-400/20'
                    : 'border-borderMuted text-muted hover:border-brand-300 bg-surface'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Incomplete</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  status === 'completed'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-600/20'
                    : 'border-borderMuted text-muted hover:border-brand-300 bg-surface'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-brand-700" />
                <span>Completed</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-borderMuted flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-textMain hover:bg-black/5 rounded-xl border border-borderMuted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-xl shadow-sm transition-all focus-ring disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isEdit ? 'Save Changes' : 'Create Todo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
