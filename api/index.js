import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';
import { seedDatabase } from '../backend/services/storage.js';

let isReady = false;
let initPromise = null;

const initialize = async () => {
  if (isReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await connectDB();
        await seedDatabase();
        isReady = true;
      } catch (err) {
        console.error('Initialization error in Vercel serverless function:', err);
        isReady = true;
      }
    })();
  }
  return initPromise;
};

export default async function handler(req, res) {
  await initialize();
  return app(req, res);
}
