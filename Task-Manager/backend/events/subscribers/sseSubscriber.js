import { eventBus } from '../eventBus.js';

class SSEManager {
  constructor() {
    this.clients = new Map(); // clientId -> { id, res, userId, username, role, connectedAt }
    this.pingInterval = null;
    this.initHeartbeat();
  }

  initHeartbeat() {
    // Send keep-alive comment every 25s to avoid proxy timeouts
    this.pingInterval = setInterval(() => {
      const pingData = `: heartbeat ${Date.now()}\n\n`;
      for (const [clientId, client] of this.clients.entries()) {
        try {
          client.res.write(pingData);
        } catch (err) {
          this.removeClient(clientId);
        }
      }
    }, 25000);
  }

  addClient(id, res, user) {
    this.clients.set(id, {
      id,
      res,
      userId: user?.id || user?._id || null,
      username: user?.username || 'anonymous',
      role: user?.role || 'User',
      connectedAt: new Date().toISOString(),
    });
  }

  removeClient(id) {
    if (this.clients.has(id)) {
      this.clients.delete(id);
    }
  }

  getClientCount() {
    return this.clients.size;
  }

  getActiveClients() {
    return Array.from(this.clients.values()).map((c) => ({
      id: c.id,
      userId: c.userId,
      username: c.username,
      role: c.role,
      connectedAt: c.connectedAt,
    }));
  }

  /**
   * Broadcast an event to matching clients
   */
  broadcast(eventEnvelope) {
    const dataString = `id: ${eventEnvelope.eventId}\nevent: ${eventEnvelope.type}\ndata: ${JSON.stringify(eventEnvelope)}\n\n`;

    const targetUserId = eventEnvelope.metadata?.userId;
    const targetUsername = eventEnvelope.metadata?.username;

    for (const [clientId, client] of this.clients.entries()) {
      try {
        const isAdmin = client.role === 'Administrator';
        const isOwner =
          (targetUserId && client.userId && String(targetUserId) === String(client.userId)) ||
          (targetUsername && client.username && targetUsername === client.username);

        // System alerts, job updates, and global telemetry events are strictly for Administrator;
        // regular users only receive their own task events.
        const shouldReceive =
          isAdmin ||
          (isOwner && !eventEnvelope.type.startsWith('job.') && !eventEnvelope.type.startsWith('system.'));

        if (shouldReceive) {
          client.res.write(dataString);
        }
      } catch (err) {
        console.error(`[SSESubscriber] Failed to write to client ${clientId}:`, err.message);
        this.removeClient(clientId);
      }
    }
  }
}

export const sseManager = new SSEManager();

/**
 * Registers the SSE subscriber to forward all domain events over SSE
 */
export const registerSSESubscriber = () => {
  eventBus.subscribeAll((event) => {
    sseManager.broadcast(event);
  }, 'SSESubscriber:LiveStream');

  console.log('[SSESubscriber] Live Server-Sent Events (SSE) broadcast worker initialized.');
};
