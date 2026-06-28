import mongoose from 'mongoose';
import seedAdmin from '../utils/seedAdmin.js';

const connectDB = async () => {
  // If connection is already open (readyState === 1), return it
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is currently opening (readyState === 2), wait for it
  if (mongoose.connection.readyState === 2) {
    console.log('MongoDB: Connection in progress, waiting...');
    return new Promise((resolve) => {
      const checkConnection = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(checkConnection);
          resolve(mongoose.connection);
        }
      }, 100);
      // Timeout check after 5s
      setTimeout(() => {
        clearInterval(checkConnection);
        resolve(mongoose.connection);
      }, 5000);
    });
  }

  // Otherwise (readyState is 0 or 3), connect cleanly
  console.log('MongoDB: No active connection. Establishing new connection...');
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Run seedAdmin asynchronously
    seedAdmin().catch(err => console.error('Seeding admin failed:', err));
    return conn.connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;