import { eventBus } from '../eventBus.js';
import { EVENT_TYPES } from '../eventTypes.js';
import { invalidateTaskCache } from '../../services/cacheService.js';

/**
 * CacheSubscriber: Reactively clears cache in response to domain events
 */
export const registerCacheSubscriber = () => {
  const handleTaskMutation = (event) => {
    const user = event.payload?.user;
    const userIdentifier = user?.id || user?._id || user?.username || event.metadata?.userId || event.metadata?.username || 'admin';
    invalidateTaskCache(userIdentifier);
  };

  eventBus.subscribe(EVENT_TYPES.TODO_CREATED, handleTaskMutation, 'CacheSubscriber:TodoCreated');
  eventBus.subscribe(EVENT_TYPES.TODO_UPDATED, handleTaskMutation, 'CacheSubscriber:TodoUpdated');
  eventBus.subscribe(EVENT_TYPES.TODO_STATUS_CHANGED, handleTaskMutation, 'CacheSubscriber:TodoStatusChanged');
  eventBus.subscribe(EVENT_TYPES.TODO_DELETED, handleTaskMutation, 'CacheSubscriber:TodoDeleted');

  console.log('[CacheSubscriber] Reactive cache invalidation worker initialized.');
};
