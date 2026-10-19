import { eventBus } from '../eventBus.js';
import { EVENT_TYPES } from '../eventTypes.js';
import { createLog } from '../../services/logService.js';

/**
 * AuditLogSubscriber: Decoupled asynchronous consumer that listens
 * for domain events and persists audit trails into MongoDB without blocking HTTP requests.
 */
export const registerAuditLogSubscriber = () => {
  // 1. Todo Created
  eventBus.subscribe(
    EVENT_TYPES.TODO_CREATED,
    async (event) => {
      const { todo, user } = event.payload;
      const userId = user?.id || user?._id || event.metadata?.userId || null;
      const username = user?.username || event.metadata?.username || 'admin';

      await createLog(
        'TODO_CREATED',
        `Created todo: "${todo.title}"`,
        todo._id || todo.id,
        userId,
        username
      );
    },
    'AuditLogSubscriber:TodoCreated'
  );

  // 2. Todo Updated
  eventBus.subscribe(
    EVENT_TYPES.TODO_UPDATED,
    async (event) => {
      const { todo, user } = event.payload;
      const userId = user?.id || user?._id || event.metadata?.userId || null;
      const username = user?.username || event.metadata?.username || 'admin';

      await createLog(
        'TODO_UPDATED',
        `Updated todo: "${todo.title}"`,
        todo._id || todo.id,
        userId,
        username
      );
    },
    'AuditLogSubscriber:TodoUpdated'
  );

  // 3. Todo Status Changed
  eventBus.subscribe(
    EVENT_TYPES.TODO_STATUS_CHANGED,
    async (event) => {
      const { todo, newStatus, user } = event.payload;
      const userId = user?.id || user?._id || event.metadata?.userId || null;
      const username = user?.username || event.metadata?.username || 'admin';

      const action = newStatus === 'completed' ? 'TODO_COMPLETED' : 'TODO_MARKED_INCOMPLETE';
      const description =
        newStatus === 'completed'
          ? `Marked todo as completed: "${todo.title}"`
          : `Marked todo as incomplete: "${todo.title}"`;

      await createLog(action, description, todo._id || todo.id, userId, username);
    },
    'AuditLogSubscriber:TodoStatusChanged'
  );

  // 4. Todo Deleted
  eventBus.subscribe(
    EVENT_TYPES.TODO_DELETED,
    async (event) => {
      const { todoId, title, user } = event.payload;
      const userId = user?.id || user?._id || event.metadata?.userId || null;
      const username = user?.username || event.metadata?.username || 'admin';

      await createLog(
        'TODO_DELETED',
        `Deleted todo: "${title || 'Task'}"`,
        todoId,
        userId,
        username
      );
    },
    'AuditLogSubscriber:TodoDeleted'
  );

  // 5. User Logged In
  eventBus.subscribe(
    EVENT_TYPES.USER_LOGGED_IN,
    async (event) => {
      const { user, authMethod = 'password' } = event.payload;
      const userId = user?.id || user?._id || null;
      const username = user?.username || 'User';

      await createLog(
        'LOGIN',
        `User logged in (${authMethod}): '${username}'`,
        null,
        userId,
        username
      );
    },
    'AuditLogSubscriber:UserLoggedIn'
  );

  // 6. User Registered
  eventBus.subscribe(
    EVENT_TYPES.USER_REGISTERED,
    async (event) => {
      const { user } = event.payload;
      const userId = user?.id || user?._id || null;
      const username = user?.username || 'User';

      await createLog(
        'USER_REGISTERED',
        `New user registered: '${username}'`,
        null,
        userId,
        username
      );
    },
    'AuditLogSubscriber:UserRegistered'
  );

  console.log('[AuditLogSubscriber] Asynchronous audit logging worker initialized.');
};
