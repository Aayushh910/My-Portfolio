import React, { useState } from 'react';
import {
  X,
  Zap,
  Activity,
  Layers,
  Cpu,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Trash2,
  ArrowRight,
  Database,
  Server,
  Monitor,
} from 'lucide-react';
import { useEventStream } from '../context/EventStreamContext';
import { edaService } from '../services/edaService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const EdaMonitorModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isConnected, liveEvents, edaStats, refreshStats, clearEvents, reconnect } =
    useEventStream();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'architecture' | 'telemetry'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen || user?.role !== 'Administrator') return null;

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      await edaService.simulateEvent(
        'system.alert',
        'Simulated Event: Asynchronous EDA Pipeline Heartbeat Verified'
      );
      showSuccess('⚡ Test event dispatched to EventBus!');
      refreshStats();
    } catch (err) {
      showError('Failed to simulate event.');
    } finally {
      setIsSimulating(false);
    }
  };

  const getEventBadgeColor = (type) => {
    if (type.startsWith('todo.created'))
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:border-emerald-800';
    if (type.startsWith('todo.status'))
      return 'bg-teal-500/10 text-teal-700 border-teal-200 dark:border-teal-800';
    if (type.startsWith('todo.updated'))
      return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-800';
    if (type.startsWith('todo.deleted'))
      return 'bg-rose-500/10 text-rose-700 border-rose-200 dark:border-rose-800';
    if (type.startsWith('job.'))
      return 'bg-purple-500/10 text-purple-700 border-purple-200 dark:border-purple-800';
    if (type.startsWith('user.'))
      return 'bg-cyan-500/10 text-cyan-700 border-cyan-200 dark:border-cyan-800';
    return 'bg-amber-500/10 text-amber-700 border-amber-200 dark:border-amber-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-borderMuted rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-borderMuted flex items-center justify-between bg-bgMain/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-700/20">
              <Zap className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-textMain">
                  Event-Driven Architecture (EDA) Live Monitor
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  {isConnected ? 'SSE Live Stream Active' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-muted">
                Non-blocking asynchronous event processing with reactive Pub/Sub consumers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshStats}
              title="Refresh telemetry"
              className="p-2 text-muted hover:text-textMain hover:bg-black/5 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-muted hover:text-textMain hover:bg-black/5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-borderMuted flex items-center justify-between gap-4 bg-surface">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('stream')}
              className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'stream'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-muted hover:text-textMain'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Live Event Stream ({liveEvents.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'architecture'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-muted hover:text-textMain'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Architecture Pipeline</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'telemetry'
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-muted hover:text-textMain'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Telemetry & Telemetry Stats</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <button
              type="button"
              onClick={handleSimulate}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-brand-700" />
              <span>{isSimulating ? 'Dispatching...' : 'Simulate Event'}</span>
            </button>

            {liveEvents.length > 0 && (
              <button
                type="button"
                onClick={clearEvents}
                title="Clear live events log"
                className="p-1.5 text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: LIVE EVENT STREAM */}
          {activeTab === 'stream' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  Real-time Server-Sent Events stream flowing from backend EventBus to this client
                </span>
                <span className="font-mono text-[11px]">
                  Buffer capacity: 50 events
                </span>
              </div>

              {liveEvents.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-bgMain rounded-2xl border border-dashed border-borderMuted">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-textMain">Listening for Domain Events...</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    Create, edit, toggle, or delete a todo, or click "Simulate Event" above to watch
                    events stream through the asynchronous bus in real time!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {liveEvents.map((event, idx) => (
                    <div
                      key={event.eventId || idx}
                      className="p-3.5 rounded-2xl bg-bgMain border border-borderMuted/80 hover:border-brand-300 transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${getEventBadgeColor(
                              event.type
                            )}`}
                          >
                            ⚡ {event.type}
                          </span>
                          <span className="text-xs font-mono text-muted">
                            {event.eventId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(event.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Event Payload Preview */}
                      <div className="text-xs text-textMain font-mono bg-surface p-2.5 rounded-xl border border-borderMuted/60 overflow-x-auto">
                        <pre className="text-[11px] leading-relaxed">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>

                      {/* Event Metadata & Actor */}
                      <div className="flex items-center gap-3 text-[11px] text-muted pt-1">
                        <span>Actor: <strong className="text-textMain">{event.metadata?.username || 'system'}</strong></span>
                        <span>•</span>
                        <span>Source: <strong className="text-textMain">{event.metadata?.source || 'api'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ARCHITECTURE PIPELINE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Architecture Diagram */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white space-y-6 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-300" />
                    <span>Decoupled Event-Driven Pipeline</span>
                  </h3>
                  <p className="text-xs text-emerald-100/80 mt-1">
                    How non-blocking asynchronous processing eliminates request latency
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Step 1: Client Request */}
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-2">
                    <Monitor className="w-6 h-6 mx-auto text-emerald-300" />
                    <p className="text-xs font-bold">1. Client REST API</p>
                    <p className="text-[10px] text-emerald-100/70">
                      HTTP POST/PUT/DELETE enters controller
                    </p>
                  </div>

                  {/* Step 2: EventBus Publisher */}
                  <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-center space-y-2 shadow-inner">
                    <Zap className="w-6 h-6 mx-auto text-yellow-300 animate-pulse" />
                    <p className="text-xs font-bold text-emerald-200">2. EventBus</p>
                    <p className="text-[10px] text-emerald-100/80">
                      Immediate publish domain event & return 200/201 response (&lt;30ms)
                    </p>
                  </div>

                  {/* Step 3: Decoupled Subscribers */}
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-2">
                    <Cpu className="w-6 h-6 mx-auto text-cyan-300" />
                    <p className="text-xs font-bold">3. Async Consumers</p>
                    <p className="text-[10px] text-emerald-100/70">
                      AuditLog, Cache, SSE & Job Queue work in background
                    </p>
                  </div>

                  {/* Step 4: Live UI Stream */}
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-2">
                    <Radio className="w-6 h-6 mx-auto text-purple-300 animate-pulse" />
                    <p className="text-xs font-bold">4. Real-Time Push</p>
                    <p className="text-[10px] text-emerald-100/70">
                      Server-Sent Events sync all open browser tabs live
                    </p>
                  </div>
                </div>
              </div>

              {/* Consumer Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-textMain">Audit Log Consumer</h4>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Writes audit records asynchronously to MongoDB. If the DB is busy or slow, the
                    user's HTTP request is not delayed.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-textMain">Reactive Cache Consumer</h4>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Listens for task creations, updates, or deletions and reactively flushes the
                    user's in-memory cache keys.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-textMain">Background Job Worker</h4>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Generates heavy PDF reports and CSV spreadsheets in an asynchronous task queue
                    with live stage progress (15% → 45% → 70% → 100%).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                      <Radio className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-textMain">SSE Broadcast Worker</h4>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Streams domain events to connected browser sessions via Server-Sent Events,
                    enabling instantaneous multi-device synchronization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY & STATS */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Total Dispatched
                  </p>
                  <p className="text-2xl font-bold text-textMain mt-1">
                    {edaStats?.totalDispatched ?? 0}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Total Processed
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {edaStats?.totalProcessed ?? 0}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Active Subscribers
                  </p>
                  <p className="text-2xl font-bold text-brand-700 mt-1">
                    {edaStats?.activeSubscribers ?? 0}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bgMain border border-borderMuted">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Active SSE Clients
                  </p>
                  <p className="text-2xl font-bold text-cyan-600 mt-1">
                    {edaStats?.activeSSEConnections ?? (isConnected ? 1 : 0)}
                  </p>
                </div>
              </div>

              {/* Consumer Execution Latency Table */}
              <div className="p-5 rounded-2xl bg-bgMain border border-borderMuted space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Asynchronous Consumer Execution Latency
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-borderMuted text-muted text-[11px]">
                        <th className="py-2.5 px-3 font-semibold">Subscriber Name</th>
                        <th className="py-2.5 px-3 font-semibold">Event Type</th>
                        <th className="py-2.5 px-3 font-semibold">Invocations</th>
                        <th className="py-2.5 px-3 font-semibold">Avg Duration</th>
                        <th className="py-2.5 px-3 font-semibold">Last Invoked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderMuted/60">
                      {edaStats?.consumerStats && Object.keys(edaStats.consumerStats).length > 0 ? (
                        Object.entries(edaStats.consumerStats).map(([key, stat]) => (
                          <tr key={key} className="hover:bg-black/5 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-textMain">
                              {stat.name}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-800 text-[11px] font-mono border border-brand-200">
                                {stat.eventType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-textMain">
                              {stat.invocations}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">
                              {stat.avgDurationMs}ms
                            </td>
                            <td className="py-2.5 px-3 text-muted text-[11px]">
                              {stat.lastInvoked
                                ? new Date(stat.lastInvoked).toLocaleTimeString()
                                : '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-muted">
                            No consumer executions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-borderMuted bg-bgMain/60 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Architecture: Node.js EventEmitter + Server-Sent Events (SSE)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-semibold transition-all shadow-xs"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
