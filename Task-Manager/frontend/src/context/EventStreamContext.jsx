import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { edaService } from '../services/edaService';

const EventStreamContext = createContext(null);

export const EventStreamProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();
  const { showSuccess, showInfo } = useNotification();

  const [isConnected, setIsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [activeJobs, setActiveJobs] = useState(new Map());
  const [edaStats, setEdaStats] = useState(null);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch telemetry metrics (Admin Only)
  const refreshStats = useCallback(async () => {
    if (user?.role !== 'Administrator') return;
    try {
      const res = await edaService.getStats();
      if (res.success) {
        setEdaStats(res.data);
      }
    } catch (err) {
      // ignore
    }
  }, [user]);

  const connectSSE = useCallback(() => {
    if (!isAuthenticated) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const rawApi =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD ? 'https://my-portfolio-4seo.vercel.app/api' : '/api');
    const apiUrl = rawApi.trim().replace(/\/+$/, '');
    const eventSourceUrl = apiUrl.endsWith('/api')
      ? `${apiUrl}/events/stream`
      : `${apiUrl}/api/events/stream`;
    const es = new EventSource(eventSourceUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      refreshStats();
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();

      // Attempt reconnection after 3 seconds
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isAuthenticated) {
          connectSSE();
        }
      }, 3000);
    };

    // Generic message handler
    es.onmessage = (e) => {
      try {
        const envelope = JSON.parse(e.data);
        handleIncomingEvent(envelope);
      } catch (err) {
        // Heartbeat or malformed comment
      }
    };

    // Typed event listeners
    const eventTypes = [
      'todo.created',
      'todo.updated',
      'todo.status_changed',
      'todo.deleted',
      'job.enqueued',
      'job.progress',
      'job.completed',
      'job.failed',
      'user.logged_in',
      'user.registered',
      'system.alert',
      'connection.established',
    ];

    eventTypes.forEach((type) => {
      es.addEventListener(type, (e) => {
        try {
          const envelope = JSON.parse(e.data);
          handleIncomingEvent(envelope);
        } catch (err) {
          // ignore
        }
      });
    });
  }, [isAuthenticated, refreshStats]);

  const handleIncomingEvent = (envelope) => {
    // Add to ring buffer of live events (max 50)
    setLiveEvents((prev) => [envelope, ...prev.slice(0, 49)]);

    // Handle reactive side-effects
    if (envelope.type.startsWith('todo.')) {
      // Trigger instant UI refresh across the app
      window.dispatchEvent(new CustomEvent('todo_mutated', { detail: envelope }));
    }

    if (envelope.type.startsWith('job.')) {
      window.dispatchEvent(new CustomEvent('job_updated', { detail: envelope }));

      if (user?.role === 'Administrator' && envelope.type === 'job.completed') {
        const job = envelope.payload?.job;
        showSuccess(
          `⚡ Background Export Ready: ${job?.result?.filename || 'Document'} is ready for download!`
        );
      }
    }

    refreshStats();
  };

  useEffect(() => {
    if (isAuthenticated) {
      connectSSE();
      refreshStats();
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      setLiveEvents([]);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, connectSSE, refreshStats]);

  const clearEvents = () => setLiveEvents([]);

  return (
    <EventStreamContext.Provider
      value={{
        isConnected,
        liveEvents,
        edaStats,
        refreshStats,
        clearEvents,
        reconnect: connectSSE,
      }}
    >
      {children}
    </EventStreamContext.Provider>
  );
};

export const useEventStream = () => {
  const context = useContext(EventStreamContext);
  if (!context) {
    throw new Error('useEventStream must be used within an EventStreamProvider');
  }
  return context;
};
