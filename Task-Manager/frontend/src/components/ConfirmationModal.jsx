import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  title = 'Delete Todo',
  message = 'Are you sure you want to delete this todo? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface rounded-2xl border border-borderMuted shadow-modal max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-textMain mb-1">{title}</h3>
            <p className="text-sm text-muted leading-relaxed">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-muted hover:text-textMain p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-borderMuted">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-textMain hover:bg-black/5 rounded-xl border border-borderMuted transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isProcessing && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
