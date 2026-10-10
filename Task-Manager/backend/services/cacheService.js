import NodeCache from 'node-cache';

// Initialize NodeCache with default TTL of 60 seconds and check period of 120 seconds
// stdTTL: 60 (as requested in the problem statement)
const taskCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false, // Better performance for read-only cached objects
});

/**
 * Generate a consistent cache key based on user identity and query parameters
 * @param {string} userIdentifier - User ID or username
 * @param {object} query - Request query parameters (e.g., status, q, sort)
 * @returns {string} Cache key
 */
export const generateTaskCacheKey = (userIdentifier = 'global', query = {}) => {
  const sortedParams = Object.keys(query)
    .sort()
    .filter((key) => query[key] !== undefined && query[key] !== '')
    .map((key) => `${key}=${String(query[key]).trim()}`)
    .join('&');

  return `tasks:${userIdentifier}:${sortedParams || 'default'}`;
};

/**
 * Retrieve data from cache
 * @param {string} key
 * @returns {any|null}
 */
export const getCachedData = (key) => {
  return taskCache.get(key);
};

/**
 * Store data into cache with optional custom TTL
 * @param {string} key
 * @param {any} data
 * @param {number} [ttl=60] - TTL in seconds
 */
export const setCachedData = (key, data, ttl = 60) => {
  taskCache.set(key, data, ttl);
};

/**
 * Invalidate cached tasks.
 * If userIdentifier is provided, invalidates entries for that user or all tasks.
 * @param {string} [userIdentifier]
 */
export const invalidateTaskCache = (userIdentifier) => {
  const allKeys = taskCache.keys();
  let deletedCount = 0;

  allKeys.forEach((key) => {
    if (
      !userIdentifier ||
      key.startsWith(`tasks:${userIdentifier}`) ||
      key.startsWith('tasks:global') ||
      key.startsWith('tasks:')
    ) {
      taskCache.del(key);
      deletedCount++;
    }
  });

  console.log(`[Cache Invalidation] Purged ${deletedCount} cache key(s)${userIdentifier ? ` for user: ${userIdentifier}` : ' (all task caches)'}`);
  return deletedCount;
};

/**
 * Invalidate a specific single key
 * @param {string} key
 */
export const deleteCacheKey = (key) => {
  return taskCache.del(key);
};

/**
 * Flush all cache
 */
export const flushAllCache = () => {
  taskCache.flushAll();
  console.log('[Cache] Entire in-memory cache flushed.');
};

/**
 * Get cache statistics (hits, misses, keys count)
 */
export const getCacheStats = () => {
  return {
    keys: taskCache.keys(),
    keyCount: taskCache.keys().length,
    stats: taskCache.getStats(),
  };
};

export default taskCache;
