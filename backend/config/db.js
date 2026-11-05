import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'aura_ecom',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
} else if (dialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'aura_ecom',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASS || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
} else {
  // Default: SQLite database file (Requires zero installation & runs anywhere)
  const dbDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const storagePath = path.join(dbDir, 'database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`\x1b[32m✔ SQL Database Connected successfully using ${dialect.toUpperCase()} dialect!\x1b[0m`);
    if (dialect === 'sqlite') {
      console.log(`\x1b[36m📁 SQLite Storage File: backend/data/database.sqlite\x1b[0m`);
    } else {
      console.log(`\x1b[36m🌐 SQL Server: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}\x1b[0m`);
    }
    return true;
  } catch (error) {
    console.error(`\x1b[31m✖ Unable to connect to the SQL database: ${error.message}\x1b[0m`);
    return false;
  }
};

export default sequelize;
