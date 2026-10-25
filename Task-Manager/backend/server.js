import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import logRoutes from './routes/logRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

// Event-Driven Architecture Subscribers
import { registerAuditLogSubscriber } from './events/subscribers/auditLogSubscriber.js';
import { registerCacheSubscriber } from './events/subscribers/cacheSubscriber.js';
import { registerSSESubscriber } from './events/subscribers/sseSubscriber.js';

// Load environment variables
dotenv.config();

// Only initialize DB and event subscribers when not running automated tests
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  connectDB();

  // Initialize Event-Driven Architecture Subscribers
  registerAuditLogSubscriber();
  registerCacheSubscriber();
  registerSSESubscriber();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Robust CORS configuration supporting comma-separated CLIENT_URL and any localhost/Docker port
const rawClientUrls =
  process.env.CLIENT_URL ||
  'http://localhost:5173,http://localhost:8080,http://localhost:80,http://localhost';
const allowedOrigins = rawClientUrls
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, same-origin)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Allow any localhost / 127.0.0.1 port in containerized and local development
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Todo Management API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/tasks', todoRoutes);
app.use('/tasks', todoRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.stack || err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Todo Backend Server running on port ${PORT}`);
    console.log(`👉 API Base: http://localhost:${PORT}/api`);
    console.log(`=========================================`);
  });
}

export default app;
