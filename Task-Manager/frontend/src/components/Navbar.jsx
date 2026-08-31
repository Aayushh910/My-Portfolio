import React from 'react';
import { Menu, Calendar, User, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onOpenSidebar, onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

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
      </div>

      <div className="flex items-center gap-3">
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
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
