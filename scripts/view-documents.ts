import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function viewDocuments() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error('NEON_DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  console.log('Connecting to Neon database...');

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    console.log('Querying documents table...');
    const result = await pool.query(`
      SELECT 
        id, 
        content, 
        metadata,
        created_at
      FROM documents
      LIMIT 10
    `);

    console.log(`Found ${result.rows.length} documents:`);
    console.log(JSON.stringify(result.rows, null, 2));

    if (result.rows.length > 0) {
      console.log('Checking vector dimensions...');
      const vectorResult = await pool.query(`
        SELECT 
          id,
          vector_dims(embedding) as embedding_dimensions
        FROM documents
        WHERE embedding IS NOT NULL
        LIMIT 5
      `);

      if (vectorResult.rows.length > 0) {
        console.log('Vector dimensions:', vectorResult.rows);
      } else {
        console.log('No documents with embeddings found');
      }
    }
  } catch (error) {
    console.error('Error querying database:', error);

    try {
      console.log('\nTrying alternative approach to check embeddings...');
      const basicResult = await pool.query(`
        SELECT 
          COUNT(*) as count_with_embeddings
        FROM documents
        WHERE embedding IS NOT NULL
      `);

      console.log(`Number of documents with embeddings: ${basicResult.rows[0].count_with_embeddings}`);
    } catch (fallbackError) {
      console.error('Fallback query failed:', fallbackError);
    }
  } finally {
    await pool.end();
  }
}

viewDocuments().catch(console.error);