const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');
const { Pool } = require('pg');

// Load .env from apps/api directory
config({ path: path.join(__dirname, '../apps/api/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      console.log(`Running migration: ${file}`);
      await pool.query(sql);
      console.log(`✓ Completed: ${file}`);
    } catch (error) {
      console.error(`✗ Failed to run ${file}:`);
      console.error(error);
      process.exit(1);
    }
  }

  await pool.end();
  console.log('\nAll migrations completed successfully!');
}

runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
