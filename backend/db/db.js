const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// PostgreSQL Connection Pool configuration using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'complaint_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 3000
});

let isPgConnected = false;
let pgliteInstance = null;

// Read SQL files for initialization
const schemaPath = path.join(__dirname, '../../database/schema.sql');
const seedPath = path.join(__dirname, '../../database/seed.sql');

async function initializeDatabase() {
  try {
    // Attempt connecting to live PostgreSQL database server
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database server successfully.');
    isPgConnected = true;
    
    // Check if tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'complaints'
    `);

    if (res.rows.length === 0) {
      console.log('🔄 Initializing PostgreSQL database schema and seed data...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      
      await client.query(schemaSql);
      await client.query(seedSql);
      console.log('✨ PostgreSQL database schema and seed data initialized.');
    }
    client.release();
  } catch (err) {
    console.warn(`⚠️ Could not connect to PostgreSQL server on ${process.env.DB_HOST}:${process.env.DB_PORT} (${err.message}).`);
    console.warn('🔄 Initializing embedded WASM PostgreSQL engine (PGlite) so the application remains fully functional...');
    
    try {
      const { PGlite } = require('@electric-sql/pglite');
      pgliteInstance = new PGlite();
      
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      
      await pgliteInstance.exec(schemaSql);
      await pgliteInstance.exec(seedSql);
      console.log('🚀 Embedded WASM PostgreSQL engine initialized with schema and seed data.');
    } catch (pgliteErr) {
      console.error('❌ Failed to initialize embedded PostgreSQL engine:', pgliteErr);
    }
  }
}

// Database query runner abstraction
async function query(text, params = []) {
  if (isPgConnected) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error('Database Query Error:', err.message);
      throw err;
    }
  } else if (pgliteInstance) {
    try {
      const res = await pgliteInstance.query(text, params);
      return res;
    } catch (err) {
      console.error('PGlite Database Query Error:', err.message);
      throw err;
    }
  } else {
    throw new Error('Database connection failed and no fallback is available.');
  }
}

// Initialize on module load
initializeDatabase();

module.exports = {
  query,
  pool,
  initializeDatabase
};
