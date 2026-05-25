import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const databaseUrl = process.env.DATABASE_URL || '';

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const pool = new Pool({
  connectionString: databaseUrl,
});

export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};
