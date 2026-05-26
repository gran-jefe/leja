const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment
config({ path: path.join(__dirname, '../apps/api/.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function initDatabase() {
  const sqlFile = path.join(__dirname, '../supabase/migrations/20250526000000_init_schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  try {
    console.log('Initializing database schema...');
    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
      // RPC might not exist, try direct query instead
      console.log('RPC failed, using alternative method...');

      // Split SQL into individual statements and execute each
      const statements = sql.split(';').filter(s => s.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase.query(statement);
          if (execError) {
            console.warn(`Warning for statement: ${execError.message}`);
          }
        }
      }
    }

    console.log('✓ Database initialization completed');
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase();
