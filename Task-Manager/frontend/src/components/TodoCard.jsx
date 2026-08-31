import React from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/formatters';

export const TodoCard = ({
  todo,
  onToggleStatus,
  onEdit,
  onDelete,
  isToggling = false,
}) => {
  const isCompleted = todo.status === 'completed';

  return (
    <div
      className={`group bg-surface rounded-2xl border transition-all duration-200 p-5 shadow-card hover:shadow-md flex flex-col justify-between ${
        isCompleted ? 'border-brand-200/80 bg-brand-50/20' : 'border-borderMuted hover:border-brand-300'
      }`}
    >
      <div>
        {/* Top bar: Status & Action shortcuts */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <StatusBadge status={todo.status} size="sm" />
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(todo)}
              className="p-1.5 rounded-lg text-muted hover:text-textMain hover:bg-black/5 transition-colors"
              title="Edit Todo"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo)}
              className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Todo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and Complete Button */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleStatus(todo)}
            disabled={isToggling}
            className={`mt-0.5 p-1 rounded-lg transition-colors flex-shrink-0 focus-ring ${
              isCompleted
                ? 'text-brand-700 hover:text-brand-800 hover:bg-brand-100/50'
                : 'text-muted hover:text-brand-700 hover:bg-brand-50'
            }`}
            title={isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 fill-brand-100 text-brand-700" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-semibold text-textMain leading-snug break-words ${
                isCompleted ? 'line-through text-muted' : ''
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p
                className={`mt-1.5 text-xs leading-relaxed text-muted line-clamp-3 break-words ${
                  isCompleted ? 'text-muted/70' : ''
                }`}
              >
                {todo.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meta Dates & Action Toggle */}
      <div className="mt-4 pt-3 border-t border-borderMuted/60 flex flex-col gap-1 text-[11px] text-muted">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-muted/80" />
            <span>Created: {formatDate(todo.createdAt)}</span>
          </span>
          {todo.completedAt && (
            <span className="inline-flex items-center gap-1 text-brand-700 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Done: {formatDate(todo.completedAt)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
