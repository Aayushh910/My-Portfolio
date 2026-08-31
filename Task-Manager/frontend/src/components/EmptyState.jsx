import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ClipboardList,
  title = 'No todos found',
  description = 'Create your first todo to get started with task tracking.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-dashed border-borderMuted p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-textMain mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-medium shadow-sm transition-all focus-ring active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
