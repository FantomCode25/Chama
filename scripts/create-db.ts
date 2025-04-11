import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error('NEON_DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  console.log('Connecting to Neon database...');

  const pool = new Pool({
    connectionString,
  });

  const client = await pool.connect();

  try {
    console.log('Creating pgvector extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('pgvector extension created or already exists');

    console.log('Creating documents table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        embedding VECTOR(1536),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Documents table created or already exists');

    console.log('Creating vector similarity index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx 
      ON documents 
      USING ivfflat (embedding vector_cosine_ops) 
      WITH (lists = 100)
    `);
    console.log('Vector index created or already exists');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createDatabase().catch(console.error);