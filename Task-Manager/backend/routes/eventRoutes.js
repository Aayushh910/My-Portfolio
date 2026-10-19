import express from 'express';
import { eventBus } from '../events/eventBus.js';
import { sseManager } from '../events/subscribers/sseSubscriber.js';
import { optionalAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { EVENT_TYPES } from '../events/eventTypes.js';

const router = express.Router();

router.use(optionalAuth);

/**
 * GET /api/events/stream
 * Server-Sent Events (SSE) live domain event stream
 * Available to authenticated users (admin receives all; users receive own task updates)
 */
router.get('/stream', (req, res) => {
  // Set SSE HTTP response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering for Nginx/proxies
  });

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const currentUser = req.user;

  sseManager.addClient(clientId, res, currentUser);

  // Send initial connection acknowledgement event
  const initialEnvelope = {
    eventId: `conn_${Date.now()}`,
    type: 'connection.established',
    timestamp: new Date().toISOString(),
    payload: {
      message: 'Connected to TaskFlow Event-Driven Architecture (SSE Stream)',
      clientId,
      user: currentUser?.username || 'anonymous',
      role: currentUser?.role || 'User',
      activeListeners: sseManager.getClientCount(),
    },
  };

  res.write(`id: ${initialEnvelope.eventId}\nevent: connection.established\ndata: ${JSON.stringify(initialEnvelope)}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    sseManager.removeClient(clientId);
  });
});

/**
 * GET /api/events/history
 * Returns the latest 50 domain events published through the event bus
 * Strictly restricted to Administrator
 */
router.get('/history', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const history = eventBus.getHistory(limit);

  return res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});

/**
 * GET /api/events/stats
 * Returns telemetry and performance metrics for the Event-Driven Architecture
 * Strictly restricted to Administrator
 */
router.get('/stats', requireAdmin, (req, res) => {
  const metrics = eventBus.getMetrics();
  metrics.activeSSEConnections = sseManager.getClientCount();

  return res.status(200).json({
    success: true,
    data: metrics,
  });
});

/**
 * POST /api/events/simulate
 * Simulates a custom domain event for demonstration/testing
 * Strictly restricted to Administrator
 */
router.post('/simulate', requireAdmin, (req, res) => {
  const { eventType = EVENT_TYPES.SYSTEM_ALERT, message = 'Simulated test event' } = req.body;
  const currentUser = req.user;

  const event = eventBus.publish(
    eventType,
    {
      simulated: true,
      message,
      triggeredBy: currentUser?.username || 'tester',
    },
    {
      source: 'eda-simulation-tool',
      userId: currentUser?.id || null,
      username: currentUser?.username || 'tester',
    }
  );

  return res.status(200).json({
    success: true,
    message: `Event '${eventType}' published to EventBus`,
    event,
  });
});

export default router;
