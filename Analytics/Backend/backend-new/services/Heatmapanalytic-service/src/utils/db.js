// user-service/db.js
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env from current CWD first, then fallback to service root (../../.env)
dotenv.config();
const serviceRootEnv = path.resolve(__dirname, '../../.env');
if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD && !process.env.PGPASSWORD && fs.existsSync(serviceRootEnv)) {
  dotenv.config({ path: serviceRootEnv });
}

// Determine SSL mode: default to true for Supabase, allow override for local/non-SSL DBs
const sslEnv = (process.env.PGSSLMODE || process.env.DATABASE_SSL || '').toString().toLowerCase();
const useSSL = sslEnv
  ? sslEnv !== 'disable' && sslEnv !== 'false' && sslEnv !== 'off'
  : true; // default to SSL on if not specified

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,

  // Add pool tuning for Supabase (prevents connection leaks / crashes)
  max: 10,                 // limit number of clients
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 10000, // fail fast if cannot connect
  keepAlive: true           // keep connections alive
});

pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL database');
});

// Handle unexpected errors gracefully
pool.on('error', (err) => {
  console.error('❌ Unexpected DB error:', err);
  // Instead of killing the whole process, just log it.
  // process.exit(-1);  <-- remove this (it causes your server to crash)
});

module.exports = pool;
