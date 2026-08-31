import React from 'react';

export const DashboardCard = ({ title, value, subtitle, icon: Icon, trend, color = 'brand' }) => {
  const iconColorStyles = {
    brand: 'bg-brand-50 text-brand-700 border-brand-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <div className="bg-surface rounded-2xl p-5 border border-borderMuted shadow-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
          <div className="text-2xl lg:text-3xl font-bold text-textMain tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${iconColorStyles[color] || iconColorStyles.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-3 pt-3 border-t border-borderMuted/60 flex items-center text-xs text-muted">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
