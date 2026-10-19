/**
 * Domain Event Types for Event-Driven Architecture (EDA)
 */
export const EVENT_TYPES = {
  // Todo Domain Events
  TODO_CREATED: 'todo.created',
  TODO_UPDATED: 'todo.updated',
  TODO_STATUS_CHANGED: 'todo.status_changed',
  TODO_DELETED: 'todo.deleted',

  // User Domain Events
  USER_LOGGED_IN: 'user.logged_in',
  USER_REGISTERED: 'user.registered',
  USER_PROFILE_UPDATED: 'user.profile_updated',

  // Asynchronous Job Processing Events
  JOB_ENQUEUED: 'job.enqueued',
  JOB_PROGRESS: 'job.progress',
  JOB_COMPLETED: 'job.completed',
  JOB_FAILED: 'job.failed',

  // System & Export Events
  EXPORT_REQUESTED: 'export.requested',
  SYSTEM_ALERT: 'system.alert',
};

/**
 * Creates a standardized Event Envelope
 * @param {string} type - Event type from EVENT_TYPES
 * @param {object} payload - Domain data
 * @param {object} metadata - Actor, source, request ID
 * @returns {object} Standardized event envelope
 */
export const createEventEnvelope = (type, payload = {}, metadata = {}) => ({
  eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
  type,
  timestamp: new Date().toISOString(),
  payload,
  metadata: {
    source: metadata.source || 'taskflow-backend',
    userId: metadata.userId || payload.userId || null,
    username: metadata.username || payload.username || 'system',
    ...metadata,
  },
});
