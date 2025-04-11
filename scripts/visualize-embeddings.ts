import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function visualizeEmbeddings() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error('NEON_DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    const countResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM documents
      WHERE embedding IS NOT NULL
    `);

    console.log(`Found ${countResult.rows[0].count} documents with embeddings`);

    if (parseInt(countResult.rows[0].count) === 0) {
      console.log('No documents with embeddings found');
      return;
    }

    const result = await pool.query(`
      SELECT 
        id, 
        content, 
        metadata->>'topic' as topic,
        embedding::text as embedding_text
      FROM documents
      WHERE embedding IS NOT NULL
      LIMIT 20
    `);

    console.log(`Retrieved ${result.rows.length} documents with embeddings`);

    const visualizationData = result.rows.map(row => {
      let embeddingSample = [];
      try {
        const embeddingText = row.embedding_text;
        const allValues = embeddingText.substring(1, embeddingText.length - 1).split(',');
        embeddingSample = allValues.slice(0, 3).map(Number);
      } catch (err) {
        console.error(`Failed to parse embedding for document ${row.id}:`, err);
        embeddingSample = [0, 0, 0];
      }

      return {
        id: row.id,
        topic: row.topic || 'unknown',
        content: row.content.substring(0, 50) + '...',
        embedding_sample: embeddingSample
      };
    });

    fs.writeFileSync(
      'embedding-visualization-data.json',
      JSON.stringify(visualizationData, null, 2)
    );

    console.log('Saved visualization data to embedding-visualization-data.json');
    console.log('Sample of processed data:');
    console.log(visualizationData[0]);

  } catch (error) {
    console.error('Error querying embeddings:', error);

    try {
      console.log('\nFalling back to just document metadata...');
      const basicResult = await pool.query(`
        SELECT 
          id, 
          content, 
          metadata
        FROM documents
        LIMIT 5
      `);

      console.log('Document samples (without embeddings):');
      console.log(JSON.stringify(basicResult.rows, null, 2));
    } catch (fallbackError) {
      console.error('Fallback query failed:', fallbackError);
    }
  } finally {
    await pool.end();
  }
}

visualizeEmbeddings().catch(console.error);