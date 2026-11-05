import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './services/storage.js';

dotenv.config();

const runSeeder = async () => {
  console.log('--- Initializing AURA Seeder ---');
  await connectDB();
  await seedDatabase();
  console.log('--- Seeding Completed Successfully ---');
  process.exit(0);
};

runSeeder();
