import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportSQL = async () => {
  await sequelize.authenticate();
  const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
  
  let sqlDump = `-- ========================================================\n`;
  sqlDump += `-- AURA E-COMMERCE SQL DATABASE DUMP\n`;
  sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
  sqlDump += `-- ========================================================\n\n`;

  for (const { name: tableName } of tables) {
    const [createRes] = await sequelize.query(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
    if (createRes.length > 0 && createRes[0].sql) {
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `-- Table structure for table \`${tableName}\`\n`;
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `${createRes[0].sql};\n\n`;

      const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\`;`);
      if (rows.length > 0) {
        sqlDump += `-- Dumping data for table \`${tableName}\` (${rows.length} rows)\n`;
        for (const row of rows) {
          const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          sqlDump += `INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`;
        }
        sqlDump += `\n`;
      }
    }
  }

  const outPath = path.join(__dirname, 'data/aura_ecommerce.sql');
  fs.writeFileSync(outPath, sqlDump, 'utf8');
  console.log(`✔ SQL dump generated successfully at: ${outPath}`);
  process.exit(0);
};

exportSQL().catch(err => {
  console.error('Error exporting SQL:', err);
  process.exit(1);
});
