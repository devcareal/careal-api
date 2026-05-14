// db.js – full replacement
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // ← Required for Supabase pooler self-signed cert
  }
});

// Log connection attempts
pool.connect()
  .then(() => console.log('✅ Connected to Supabase (pooler mode)'))
  .catch(err => console.error('❌ Connection failed:', err.message));

export default pool;