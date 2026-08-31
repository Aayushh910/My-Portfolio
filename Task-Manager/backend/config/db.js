import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB Connection Error: ${error.message}`);
    // Don't exit immediately in case user starts MongoDB later or has temporary network glitch
    console.warn('[Database] Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};
