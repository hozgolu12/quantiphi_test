import mongoose from 'mongoose';

export let isConnectedToMongo = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_chat_assistant';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongo = true;
    console.log(`[Database] Connected successfully to MongoDB: ${uri}`);
  } catch (error) {
    isConnectedToMongo = false;
    console.warn(`[Database] MongoDB daemon not reachable at ${uri} (${error.message}).`);
    console.log('[Database] Seamlessly activated persistent JSON file store (backend/data/conversations.json) with Mongoose-compatible schema.');
  }
};

export const closeDB = async () => {
  if (isConnectedToMongo) {
    await mongoose.disconnect();
    isConnectedToMongo = false;
  }
};
