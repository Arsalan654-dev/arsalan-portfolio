const mongoose = require('mongoose');

// Reuse the connection across serverless invocations on Vercel.
let cached = global.__mongooseConnection;
if (!cached) {
  cached = global.__mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.host} (db: ${cached.conn.name})`);
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(`MongoDB Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
