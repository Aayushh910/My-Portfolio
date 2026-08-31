import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const isCompleted = status === 'completed';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${
        sizeClasses[size] || sizeClasses.md
      } ${
        isCompleted
          ? 'bg-brand-50 text-brand-800 border-brand-200/80'
          : 'bg-amber-50/80 text-amber-900 border-amber-200/70'
      }`}
    >
      {isCompleted ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-700" />
          <span>Completed</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
          <span>Incomplete</span>
        </>
      )}
    </span>
  );
};
