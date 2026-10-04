const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  const useConnectionString = Boolean(process.env.DATABASE_URL);

  let pool;
  if (useConnectionString) {
    console.log('🔌 Connecting to Cloud PostgreSQL database using DATABASE_URL (SSL enabled)...');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  } else {
    const dbName = process.env.DB_NAME || 'complaint_management';
    const user = process.env.DB_USER || 'postgres';
    const host = process.env.DB_HOST || 'localhost';
    const password = process.env.DB_PASSWORD || 'postgres';
    const port = parseInt(process.env.DB_PORT || '5432', 10);

    console.log(`🔌 Connecting to local PostgreSQL server at ${host}:${port} as user "${user}"...`);

    // Connect to default postgres database to ensure target database exists
    const adminPool = new Pool({
      user,
      host,
      database: 'postgres',
      password,
      port,
    });

    try {
      const res = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
      if (res.rowCount === 0) {
        console.log(`📦 Database "${dbName}" does not exist. Creating database...`);
        await adminPool.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Database "${dbName}" created successfully!`);
      } else {
        console.log(`ℹ️ Database "${dbName}" already exists.`);
      }
    } catch (err) {
      console.error('⚠️ Could not check/create database via admin pool:', err.message);
    } finally {
      await adminPool.end();
    }

    pool = new Pool({
      user,
      host,
      database: dbName,
      password,
      port,
    });
  }

  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    console.log('📜 Reading schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Executed schema.sql successfully!');

    console.log('🌱 Reading seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);
    console.log('✅ Executed seed.sql successfully!');

    console.log('🎉 Database setup and seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during database setup:', err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
