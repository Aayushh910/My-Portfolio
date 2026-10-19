import React, { useState } from 'react';
import { Menu, Calendar, User, LogOut, Plus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useEventStream } from '../context/EventStreamContext';
import { useNavigate } from 'react-router-dom';
import { EdaMonitorModal } from './EdaMonitorModal';

export const Navbar = ({ onOpenSidebar, onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useNotification();
  const { isConnected, liveEvents } = useEventStream();
  const navigate = useNavigate();
  const [isEdaOpen, setIsEdaOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const todayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-borderMuted px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-muted hover:text-textMain rounded-xl hover:bg-black/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <Calendar className="w-4 h-4 text-brand-700" />
            <span className="hidden sm:inline">Today:</span>
            <span className="font-semibold text-textMain">{todayDate}</span>
          </div>

          {/* EDA Real-Time Badge Trigger (Admin Only) */}
          {user?.role === 'Administrator' && (
            <button
              type="button"
              onClick={() => setIsEdaOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-300 text-[11px] font-semibold transition-all cursor-pointer group shadow-xs active:scale-95 ml-2"
              title="Inspect Asynchronous Event-Driven Architecture Live (Admin Only)"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
              <Zap className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition-transform" />
              <span>EDA Live</span>
              {liveEvents.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-700 text-white rounded-full text-[9px] font-bold">
                  {liveEvents.length}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile EDA button (Admin Only) */}
          {user?.role === 'Administrator' && (
            <button
              type="button"
              onClick={() => setIsEdaOpen(true)}
              className="sm:hidden p-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700"
              title="EDA Live (Admin)"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus-ring active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Todo</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}

        {/* User preview & quick logout */}
        <div className="h-6 w-px bg-borderMuted mx-1 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-black/5 transition-colors group"
            title="View Profile Settings"
            aria-label="View profile settings"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-brand-700 text-white font-bold text-xs flex items-center justify-center border border-brand-200 shadow-xs flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'A'
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-textMain leading-tight group-hover:text-brand-800">
                {user?.fullName || user?.username || 'admin'}
              </span>
              <span className="text-[10px] text-brand-700 font-semibold uppercase">
                {user?.role || 'User'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-muted hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

      {/* EDA Architecture Live Monitor Modal (Admin Only) */}
      {user?.role === 'Administrator' && (
        <EdaMonitorModal isOpen={isEdaOpen} onClose={() => setIsEdaOpen(false)} />
      )}
    </>
  );
};
