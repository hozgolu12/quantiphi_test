import mongoose from 'mongoose';

export const isConnectedToMongo = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_chat_assistant';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
  } catch (error) {
    console.error(`[Database] MongoDB connection failed for ${uri}: ${error.message}`);
    console.error('[Database] Please verify that your local MongoDB daemon is running (e.g. mongod or MongoDB service).');
    throw error;
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed.');
  }
};
