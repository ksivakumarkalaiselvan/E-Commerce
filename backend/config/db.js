import mongoose from 'mongoose';

export let isConnectedToMongo = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aura_ecom';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000, // Quick timeout if mongod is not running
    });
    isConnectedToMongo = true;
    console.log(`\x1b[32m✔ MongoDB Connected: ${conn.connection.host}\x1b[0m`);
    return true;
  } catch (error) {
    isConnectedToMongo = false;
    console.log(`\x1b[33m⚠ MongoDB is not available on ${uri} (${error.message}).\x1b[0m`);
    console.log(`\x1b[36mℹ Operating in hybrid persistence mode with persistent store at backend/data/db_store.json.\x1b[0m`);
    console.log(`\x1b[36mℹ All features (Cart, Auth, Orders, Payments, Admin) are fully operational!\x1b[0m`);
    return false;
  }
};
