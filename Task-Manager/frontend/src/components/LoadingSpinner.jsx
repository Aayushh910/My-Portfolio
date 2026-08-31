import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-700`} />
      {message && <p className="text-sm font-medium text-muted">{message}</p>}
    </div>
  );
};
