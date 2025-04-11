import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error('NEON_DATABASE_URL is not defined in environment variables!');
    return;
  }

  console.log('Connection string found. Attempting to connect...');
  console.log(`Connection string (partial): ${connectionString.substring(0, 20)}...`);

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    console.log('Testing connection...');
    const client = await pool.connect();
    console.log('Successfully connected to database!');

    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);

    client.release();
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await pool.end();
  }
}

testConnection().catch(console.error);