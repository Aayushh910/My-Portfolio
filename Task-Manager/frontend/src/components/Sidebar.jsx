import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  History,
  FileDown,
  LogOut,
  X,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/todos',
      label: 'Todo Tasks',
      icon: CheckSquare,
    },
    ...(user?.role === 'Administrator'
      ? [
          {
            to: '/users',
            label: 'User Directory',
            icon: Users,
          },
        ]
      : []),
    {
      to: '/logs',
      label: 'Activity Logs',
      icon: History,
    },
    {
      to: '/exports',
      label: 'Export Records',
      icon: FileDown,
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-surface border-r border-borderMuted flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-borderMuted">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-sm">
                <CheckSquare className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h1 className="font-bold text-base text-textMain tracking-tight">TaskFlow</h1>
                <p className="text-[10px] font-semibold text-brand-700 tracking-wider uppercase">
                  Management App
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-muted hover:text-textMain rounded-lg hover:bg-black/5"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
              Main Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-700 text-white shadow-sm font-semibold'
                        : 'text-muted hover:text-textMain hover:bg-brand-50/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-borderMuted space-y-3">
          {/* User badge with avatar */}
          <NavLink
            to="/profile"
            onClick={() => onClose?.()}
            className="p-2.5 bg-bgMain hover:bg-brand-50/60 transition-colors rounded-2xl border border-borderMuted/70 flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-brand-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 border border-brand-200">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.username?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-textMain truncate group-hover:text-brand-800">
                  {user?.fullName || user?.username || 'admin'}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-brand-700 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user?.role || 'User'}</span>
                </span>
              </div>
            </div>
          </NavLink>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-xl border border-rose-200/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
