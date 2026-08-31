import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  User as UserIcon,
  RefreshCw,
  Eye,
  X,
  ListTodo,
} from 'lucide-react';
import { userService } from '../services/userService';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const { showError } = useNotification();

  const fetchUsers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const res = await userService.getUsers({ q: searchQuery });
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalUsersCount = users.length;
  const totalTasksAcrossAll = users.reduce((acc, u) => acc + (u.totalTasks || 0), 0);
  const totalCompletedAcrossAll = users.reduce((acc, u) => acc + (u.completedTasks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
              User Directory & Details
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold">
              {totalUsersCount} Users
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Overview of all registered users, account roles, task volumes, and activity metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-borderMuted bg-surface text-xs font-semibold text-textMain hover:bg-black/5 transition-colors shadow-subtle self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-700' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-2xl p-5 border border-borderMuted shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Registered Users</p>
              <p className="text-2xl font-bold text-textMain mt-1">{totalUsersCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-brand-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-borderMuted shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total User Tasks</p>
              <p className="text-2xl font-bold text-textMain mt-1">{totalTasksAcrossAll}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-borderMuted shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Completed Tasks</p>
              <p className="text-2xl font-bold text-textMain mt-1">{totalCompletedAcrossAll}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-2xl border border-borderMuted shadow-card p-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users by username, full name, or email..."
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Users List / Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching user directory from MongoDB..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            searchQuery
              ? 'No registered users match your search criteria.'
              : 'No users have registered yet.'
          }
          actionLabel={searchQuery ? 'Clear Search' : undefined}
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-borderMuted shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-textMain border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-bgMain/70 border-b border-borderMuted text-xs uppercase tracking-wider text-muted font-semibold">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4 text-center">Tasks Created</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMuted/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-brand-50/20 transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 border border-brand-200 shadow-xs">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            u.username?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-textMain leading-tight">
                            {u.fullName || u.username}
                          </div>
                          <div className="text-xs text-muted font-mono mt-0.5">
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          u.role === 'Administrator'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-brand-50 text-brand-800 border-brand-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{u.role || 'User'}</span>
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {u.email ? (
                        <span className="text-textMain">{u.email}</span>
                      ) : (
                        <span className="text-muted/60">—</span>
                      )}
                    </td>

                    {/* Tasks metrics summary */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-bgMain border border-borderMuted">
                        <span className="text-textMain font-bold">{u.totalTasks || 0}</span>
                        <span className="text-[10px] text-muted font-normal">
                          ({u.completedTasks || 0} done)
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Never'}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 rounded-lg text-muted hover:text-brand-800 hover:bg-brand-50 transition-colors"
                        title="View User Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface rounded-3xl border border-borderMuted shadow-modal max-w-lg w-full p-6 animate-scale-in space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-borderMuted">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-700 text-white font-bold text-sm flex items-center justify-center border border-brand-200 shadow-sm">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedUser.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textMain">
                    {selectedUser.fullName || selectedUser.username}
                  </h3>
                  <p className="text-xs text-muted font-mono">@{selectedUser.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-muted hover:text-textMain rounded-lg hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-bgMain rounded-xl border border-borderMuted flex items-center justify-between">
                <span className="text-muted font-medium">Account Role:</span>
                <span className="font-semibold text-brand-800">{selectedUser.role || 'User'}</span>
              </div>

              <div className="p-3 bg-bgMain rounded-xl border border-borderMuted flex items-center justify-between">
                <span className="text-muted font-medium">Email Address:</span>
                <span className="font-semibold text-textMain">{selectedUser.email || 'Not provided'}</span>
              </div>

              {selectedUser.bio && (
                <div className="p-3 bg-bgMain rounded-xl border border-borderMuted space-y-1">
                  <span className="text-muted font-medium block">User Bio / Notes:</span>
                  <p className="text-textMain text-xs leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              <div className="p-3 bg-bgMain rounded-xl border border-borderMuted flex items-center justify-between">
                <span className="text-muted font-medium">Account Created:</span>
                <span className="font-semibold text-textMain">{formatDate(selectedUser.createdAt)}</span>
              </div>

              <div className="p-3 bg-bgMain rounded-xl border border-borderMuted flex items-center justify-between">
                <span className="text-muted font-medium">Last Login:</span>
                <span className="font-semibold text-textMain">
                  {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                </span>
              </div>

              {/* Task statistics */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-muted">Total Tasks</p>
                  <p className="text-lg font-extrabold text-brand-900 mt-0.5">
                    {selectedUser.totalTasks || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-muted">Completed</p>
                  <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                    {selectedUser.completedTasks || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-muted">Pending</p>
                  <p className="text-lg font-extrabold text-amber-800 mt-0.5">
                    {selectedUser.pendingTasks || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold text-textMain bg-bgMain hover:bg-black/5 rounded-xl border border-borderMuted"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
