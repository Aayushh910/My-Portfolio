import { EventEmitter } from 'events';
import { createEventEnvelope } from './eventTypes.js';

class EventBusService extends EventEmitter {
  constructor() {
    super();
    // Allow higher listener threshold for multiple subscribers (SSE, audit, cache, etc.)
    this.setMaxListeners(100);

    // Event history ring buffer for EDA inspection (max 100 entries)
    this.historyLimit = 100;
    this.eventHistory = [];

    // Telemetry and statistics
    this.metrics = {
      totalDispatched: 0,
      totalProcessed: 0,
      totalFailed: 0,
      activeSubscribers: 0,
      eventCounts: {},
      consumerStats: {},
    };

    // Registry of named subscribers for transparency
    this.subscribers = new Map();
  }

  /**
   * Register a named subscriber for a specific event
   * @param {string} eventType 
   * @param {Function} handler 
   * @param {string} subscriberName 
   */
  subscribe(eventType, handler, subscriberName = 'AnonymousSubscriber') {
    const wrappedHandler = async (event) => {
      const startTime = performance.now();
      const subscriberId = `${subscriberName}@${eventType}`;

      try {
        await handler(event);
        const duration = Number((performance.now() - startTime).toFixed(2));

        // Update consumer metrics
        if (!this.metrics.consumerStats[subscriberId]) {
          this.metrics.consumerStats[subscriberId] = {
            name: subscriberName,
            eventType,
            invocations: 0,
            totalDurationMs: 0,
            avgDurationMs: 0,
            lastInvoked: null,
          };
        }
        const stat = this.metrics.consumerStats[subscriberId];
        stat.invocations += 1;
        stat.totalDurationMs += duration;
        stat.avgDurationMs = Number((stat.totalDurationMs / stat.invocations).toFixed(2));
        stat.lastInvoked = new Date().toISOString();

        return { subscriberName, success: true, duration };
      } catch (err) {
        console.error(`[EventBus] Consumer error in ${subscriberName} for event ${eventType}:`, err);
        this.metrics.totalFailed += 1;
        return { subscriberName, success: false, error: err.message };
      }
    };

    this.on(eventType, wrappedHandler);

    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(subscriberName);
    this.metrics.activeSubscribers += 1;

    return () => {
      this.off(eventType, wrappedHandler);
      this.metrics.activeSubscribers = Math.max(0, this.metrics.activeSubscribers - 1);
    };
  }

  /**
   * Subscribe to ALL events (wildcard / audit inspection)
   * @param {Function} handler 
   * @param {string} subscriberName 
   */
  subscribeAll(handler, subscriberName = 'WildcardSubscriber') {
    return this.subscribe('*', handler, subscriberName);
  }

  /**
   * Asynchronously publishes an event across the event bus without blocking the caller
   * @param {string} eventType 
   * @param {object} payload 
   * @param {object} metadata 
   * @returns {object} The created event envelope
   */
  publish(eventType, payload = {}, metadata = {}) {
    const envelope = createEventEnvelope(eventType, payload, metadata);

    // Update dispatch counts
    this.metrics.totalDispatched += 1;
    this.metrics.eventCounts[eventType] = (this.metrics.eventCounts[eventType] || 0) + 1;

    // Dispatch asynchronously via setImmediate so caller thread is NEVER blocked
    setImmediate(async () => {
      const dispatchStart = performance.now();

      // Record in history buffer
      this.eventHistory.unshift({
        eventId: envelope.eventId,
        type: envelope.type,
        timestamp: envelope.timestamp,
        metadata: envelope.metadata,
        payloadSummary: this.createPayloadSummary(envelope.payload),
        status: 'DISPATCHED',
      });

      if (this.eventHistory.length > this.historyLimit) {
        this.eventHistory.pop();
      }

      try {
        // Emit specific event
        this.emit(eventType, envelope);

        // Also emit wildcard event
        this.emit('*', envelope);

        this.metrics.totalProcessed += 1;
      } catch (err) {
        console.error(`[EventBus] Unhandled error during dispatch of ${eventType}:`, err);
        this.metrics.totalFailed += 1;
      }
    });

    return envelope;
  }

  /**
   * Creates a compact summary of payload for debugging/inspection
   */
  createPayloadSummary(payload) {
    if (!payload) return {};
    const summary = {};

    if (payload.todo) {
      summary.todoId = payload.todo._id || payload.todo.id;
      summary.title = payload.todo.title;
      summary.status = payload.todo.status;
    }
    if (payload.todoId) summary.todoId = payload.todoId;
    if (payload.title) summary.title = payload.title;
    if (payload.jobId) summary.jobId = payload.jobId;
    if (payload.type) summary.jobType = payload.type;
    if (payload.status) summary.status = payload.status;
    if (payload.user) {
      summary.user = payload.user.username || payload.user.id || payload.user;
    }
    if (payload.changes) summary.changes = Object.keys(payload.changes);

    return Object.keys(summary).length > 0 ? summary : { ...payload };
  }

  /**
   * Returns recent event history for EDA visualization
   * @param {number} limit 
   */
  getHistory(limit = 50) {
    return this.eventHistory.slice(0, limit);
  }

  /**
   * Returns telemetry snapshot
   */
  getMetrics() {
    const subscriberMap = {};
    for (const [evt, subs] of this.subscribers.entries()) {
      subscriberMap[evt] = subs;
    }

    return {
      architecture: 'Asynchronous Event-Driven Architecture (EDA)',
      status: 'active',
      ...this.metrics,
      registeredChannels: Object.keys(this.metrics.eventCounts),
      subscribers: subscriberMap,
    };
  }

  /**
   * Clear event history (useful for tests)
   */
  clearHistory() {
    this.eventHistory = [];
  }
}

// Export singleton instance
export const eventBus = new EventBusService();
