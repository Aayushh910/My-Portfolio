import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

export const FilterControls = ({
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Status Filter buttons */}
      <div className="flex items-center bg-surface border border-borderMuted rounded-xl p-1 shadow-subtle">
        <button
          type="button"
          onClick={() => onStatusChange('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === 'all'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'text-muted hover:text-textMain hover:bg-black/5'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('incomplete')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === 'incomplete'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-muted hover:text-textMain hover:bg-black/5'
          }`}
        >
          Incomplete
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('completed')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === 'completed'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'text-muted hover:text-textMain hover:bg-black/5'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Sort selection dropdown */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort todos by"
          className="pl-8 pr-8 py-2 bg-surface border border-borderMuted rounded-xl text-xs font-medium text-textMain focus-ring shadow-subtle appearance-none cursor-pointer hover:border-brand-300 transition-colors"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="recently_updated">Recently Updated</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-muted">
          <span className="text-[10px]">▼</span>
        </div>
      </div>
    </div>
  );
};
