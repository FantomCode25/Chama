/* eslint-disable @typescript-eslint/no-unused-vars */
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const TEST_TEXT = "This is a test embedding";
const DB_EXPECTED_DIMENSIONS = 1536;

async function generateMockEmbedding(dimensions: number = 1536): Promise<number[]> {
  return Array(dimensions).fill(0).map((_, i) => Math.random() * 2 - 1);
}

async function simpleDbTest() {
  console.log('=== Simple Database Test ===\n');

  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    console.error('NEON_DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  console.log(`Connection string found (partial): ${connectionString.substring(0, 20)}...`);

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    console.log('1. Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');

    console.log('\n2. Checking pgvector extension...');
    const extensionResult = await client.query(
      "SELECT extname FROM pg_extension WHERE extname = 'vector'"
    );

    if (extensionResult.rows.length > 0) {
      console.log('✅ pgvector extension is installed');
    } else {
      console.log('❌ pgvector extension is NOT installed');
      console.log('Creating extension...');
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      console.log('✅ Created pgvector extension');
    }

    console.log('\n3. Checking documents table...');
    const tableResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'documents'"
    );

    if (tableResult.rows.length > 0) {
      console.log('✅ documents table exists');
    } else {
      console.log('❌ documents table does not exist');
      console.log('Creating table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          metadata JSONB NOT NULL,
          embedding VECTOR(1536),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created documents table');
    }

    console.log('\n4. Testing document insertion with mock embedding...');
    const mockEmbedding = await generateMockEmbedding(DB_EXPECTED_DIMENSIONS);
    const id = uuidv4();
    const embeddingString = `[${mockEmbedding.join(',')}]`;

    await client.query(
      `INSERT INTO documents (id, content, metadata, embedding)
       VALUES ($1, $2, $3, $4::vector)`,
      [id, TEST_TEXT, JSON.stringify({ source: 'test' }), embeddingString]
    );

    console.log('✅ Successfully inserted test document with ID:', id);

    console.log('\n5. Checking vector dimensions...');
    const vectorResult = await client.query(
      `SELECT vector_dims(embedding) as dimensions
       FROM documents 
       WHERE id = $1`,
      [id]
    );

    if (vectorResult.rows.length > 0) {
      const dimensions = vectorResult.rows[0].dimensions;
      console.log(`✅ Vector dimensions: ${dimensions}`);
      console.log(`Expected dimensions match: ${dimensions === DB_EXPECTED_DIMENSIONS ? 'YES' : 'NO'}`);
    }

    console.log('\n6. Cleaning up test document...');
    await client.query('DELETE FROM documents WHERE id = $1', [id]);
    console.log('✅ Test document deleted');

    console.log('\nAll tests completed successfully!');
    client.release();
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await pool.end();
  }
}

simpleDbTest().catch(console.error);