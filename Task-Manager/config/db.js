const mongoose = require('mongoose');

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';
  try {
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    // Do not crash the app immediately if offline, but log error clearly
  }
};

module.exports = connectDB;
