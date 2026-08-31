import React from 'react';
import {
  LogIn,
  LogOut,
  UserPlus,
  UserCheck,
  PlusCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileText,
  Table,
  Activity,
} from 'lucide-react';
import { formatDate, getActionMeta } from '../utils/formatters';

const iconComponents = {
  LogIn,
  LogOut,
  UserPlus,
  UserCheck,
  PlusCircle,
  Edit3,
  CheckCircle2,
  CircleAlert: AlertCircle,
  Trash2,
  FileText,
  Table,
  Activity,
};

export const ActivityLogItem = ({ log, showBorder = true }) => {
  const meta = getActionMeta(log.action);
  const Icon = iconComponents[meta.iconName] || Activity;

  return (
    <div
      className={`py-3.5 px-4 flex items-start gap-3.5 transition-colors hover:bg-black/[0.02] ${
        showBorder ? 'border-b border-borderMuted/60' : ''
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${meta.badgeClass}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
            >
              {log.action}
            </span>
            {log.username && (
              <span className="text-[11px] font-medium text-muted bg-black/5 px-2 py-0.5 rounded-md">
                @{log.username}
              </span>
            )}
          </div>
          <span className="text-xs text-muted font-normal">
            {formatDate(log.timestamp)}
          </span>
        </div>

        <p className="text-sm font-medium text-textMain leading-snug break-words">
          {log.description}
        </p>

        {log.todoId && typeof log.todoId === 'object' && log.todoId.title && (
          <div className="mt-1 text-xs text-muted">
            <span className="text-[11px] font-semibold text-brand-700">Target Todo: </span>
            <span className="font-medium text-textMain">"{log.todoId.title}"</span>
          </div>
        )}
      </div>
    </div>
  );
};
