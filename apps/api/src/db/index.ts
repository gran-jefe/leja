import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import ws from 'ws';
import { config } from '../config';

export const supabase = createClient(
  config.db.supabaseUrl,
  config.db.supabaseServiceRoleKey,
  { global: { headers: { 'User-Agent': 'leja-api' } }, realtime: { transport: ws as any } }
);

export const pool = new Pool({
  connectionString: config.db.url,
});

export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};
