/**
 * Format date string into human-friendly format
 * Example: 18 Aug 2026, 09:30 AM
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Format relative or friendly date
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString);
};

/**
 * Helper to get readable action text and styling classes
 */
export const getActionMeta = (action) => {
  switch (action) {
    case 'LOGIN':
      return {
        label: 'User Login',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconName: 'LogIn',
      };
    case 'LOGOUT':
      return {
        label: 'User Logout',
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
        iconName: 'LogOut',
      };
    case 'USER_REGISTERED':
      return {
        label: 'User Registered',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
        iconName: 'UserPlus',
      };
    case 'PROFILE_UPDATED':
      return {
        label: 'Profile Updated',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        iconName: 'UserCheck',
      };
    case 'TODO_CREATED':
      return {
        label: 'Todo Created',
        badgeClass: 'bg-brand-50 text-brand-800 border-brand-200',
        iconName: 'PlusCircle',
      };
    case 'TODO_UPDATED':
      return {
        label: 'Todo Updated',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        iconName: 'Edit3',
      };
    case 'TODO_COMPLETED':
      return {
        label: 'Todo Completed',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        iconName: 'CheckCircle2',
      };
    case 'TODO_MARKED_INCOMPLETE':
      return {
        label: 'Marked Incomplete',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        iconName: 'CircleAlert',
      };
    case 'TODO_DELETED':
      return {
        label: 'Todo Deleted',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        iconName: 'Trash2',
      };
    case 'EXPORT_PDF':
      return {
        label: 'PDF Exported',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        iconName: 'FileText',
      };
    case 'EXPORT_CSV':
      return {
        label: 'CSV Exported',
        badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        iconName: 'Table',
      };
    default:
      return {
        label: action || 'Activity',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
        iconName: 'Activity',
      };
  }
};
