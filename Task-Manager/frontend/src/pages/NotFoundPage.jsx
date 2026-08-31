import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 mb-4 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-textMain tracking-tight">404 — Page Not Found</h1>
      <p className="text-sm text-muted max-w-sm mt-2 mb-6">
        The requested page does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
