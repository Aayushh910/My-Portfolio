import React from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Calendar, Clock, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/formatters';

export const TodoTable = ({
  todos,
  onToggleStatus,
  onEdit,
  onDelete,
  togglingIds = {},
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-borderMuted shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-textMain border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-bgMain/70 border-b border-borderMuted text-xs uppercase tracking-wider text-muted font-semibold">
              <th className="py-3.5 px-4 w-12 text-center">Done</th>
              <th className="py-3.5 px-4">Task</th>
              <th className="py-3.5 px-4 w-32">Status</th>
              <th className="py-3.5 px-4 w-44">Created</th>
              <th className="py-3.5 px-4 w-44">Completed</th>
              <th className="py-3.5 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderMuted/60">
            {todos.map((todo) => {
              const isCompleted = todo.status === 'completed';
              const isToggling = !!togglingIds[todo._id];

              return (
                <tr
                  key={todo._id}
                  className={`hover:bg-brand-50/20 transition-colors ${
                    isCompleted ? 'bg-brand-50/10' : ''
                  }`}
                >
                  {/* Checkbox toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(todo)}
                      disabled={isToggling}
                      className={`p-1.5 rounded-lg transition-colors focus-ring inline-flex items-center justify-center ${
                        isCompleted
                          ? 'text-brand-700 hover:bg-brand-100/50'
                          : 'text-muted hover:text-brand-700 hover:bg-brand-50'
                      }`}
                      title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                      aria-label={isCompleted ? `Mark "${todo.title}" as incomplete` : `Mark "${todo.title}" as complete`}
                    >
                      {isToggling ? (
                        <span className="w-4 h-4 border-2 border-brand-700/40 border-t-brand-700 rounded-full animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-brand-100 text-brand-700" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                    <div className="font-semibold text-textMain leading-snug">
                      <span className={isCompleted ? 'line-through text-muted font-normal' : ''}>
                        {todo.title}
                      </span>
                    </div>
                    {todo.description && (
                      <div className="text-xs text-muted mt-0.5 line-clamp-1">
                        {todo.description}
                      </div>
                    )}
                  </td>

                  {/* Status pill */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={todo.status} size="sm" />
                  </td>

                  {/* Created At */}
                  <td className="py-3.5 px-4 text-xs text-muted">
                    {formatDate(todo.createdAt)}
                  </td>

                  {/* Completed At */}
                  <td className="py-3.5 px-4 text-xs text-muted">
                    {todo.completedAt ? (
                      <span className="text-brand-800 font-medium">{formatDate(todo.completedAt)}</span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Action buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(todo)}
                        className="p-1.5 rounded-lg text-muted hover:text-textMain hover:bg-black/5 transition-colors"
                        title="Edit"
                        aria-label={`Edit todo "${todo.title}"`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(todo)}
                        className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                        aria-label={`Delete todo "${todo.title}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
