const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'complaint_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Test connection on server initialization
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL Database connection error:', err.message);
    console.error(`Please check backend/.env credentials (User: ${process.env.DB_USER || 'postgres'}, Host: ${process.env.DB_HOST || 'localhost'}, DB: ${process.env.DB_NAME || 'complaint_management'})`);
  } else {
    console.log(`✅ Successfully connected to PostgreSQL database: "${process.env.DB_NAME || 'complaint_management'}" at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
