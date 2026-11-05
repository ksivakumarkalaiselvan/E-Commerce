import app from './app.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './services/storage.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect DB & Seed & Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 AURA E-Commerce Server running on http://localhost:${PORT}`);
      console.log(`📦 REST API Base: http://localhost:${PORT}/api`);
      console.log(`🔐 Demo Admin:    admin@store.com    / admin123`);
      console.log(`👤 Demo Customer: customer@store.com / customer123`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
