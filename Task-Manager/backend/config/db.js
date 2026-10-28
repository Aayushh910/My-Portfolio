import mongoose from 'mongoose';

let cachedPromise = null;
let lastDbError = null;

export const getLastDbError = () => lastDbError;

export const connectDB = async () => {
  // If connection is already open, reuse it immediately
  if (mongoose.connection.readyState >= 1) {
    lastDbError = null;
    return mongoose.connection;
  }

  // If a connection attempt is already in flight, reuse the promise
  if (cachedPromise) {
    return cachedPromise;
  }

  let mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://taskflow_admin:aayush9106@transitops.fef2geb.mongodb.net/tododb?retryWrites=true&w=majority';

  // Normalize URI to ensure a database name is specified
  if (mongoUri.endsWith('.mongodb.net/') || mongoUri.endsWith('.mongodb.net')) {
    mongoUri = mongoUri.replace(/\/?$/, '/tododb?retryWrites=true&w=majority');
  }

  cachedPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then((conn) => {
      lastDbError = null;
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    })
    .catch((error) => {
      cachedPromise = null;
      lastDbError = error.message;
      console.error(`[Database] MongoDB Connection Error: ${error.message}`);
      if (!process.env.VERCEL) {
        // Retry only in persistent server environments
        console.warn('[Database] Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
      }
      throw error;
    });

  return cachedPromise;
};
