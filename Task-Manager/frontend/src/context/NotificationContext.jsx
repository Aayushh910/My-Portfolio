import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 3000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const showError = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
  const showInfo = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        removeToast,
      }}
    >
      {children}

      {/* Floating Toast Notification Container (Top Right) */}
      <div
        id="notification-container"
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          let bgClass = 'bg-surface border-borderMuted text-textMain';
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />;
          let barColor = 'bg-brand-700';

          if (toast.type === 'success') {
            bgClass = 'bg-surface border-brand-200 text-brand-950 shadow-toast';
            icon = <CheckCircle2 className="w-5 h-5 text-brand-700 flex-shrink-0" />;
            barColor = 'bg-brand-700';
          } else if (toast.type === 'error') {
            bgClass = 'bg-surface border-rose-200 text-rose-950 shadow-toast';
            icon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
            barColor = 'bg-rose-600';
          } else if (toast.type === 'info') {
            bgClass = 'bg-surface border-blue-200 text-blue-950 shadow-toast';
            icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
            barColor = 'bg-blue-600';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in-right ${bgClass}`}
              role="alert"
            >
              <div className="flex items-center gap-3 pr-2">
                {icon}
                <p className="text-sm font-medium leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-muted hover:text-textMain p-1 rounded-md hover:bg-black/5 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
