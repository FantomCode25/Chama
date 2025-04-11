#!/usr/bin/env ts-node
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Test script for RAG retrieval functionality
 * 
 * Usage:
 *   npx tsx scripts/test-rag-retrieval.ts "Your research topic here"
 * 
 * Example:
 *   npx tsx scripts/test-rag-retrieval.ts "Explain the training and finetuning process of Deepseek R1"
 *   npx tsx scripts/test-rag-retrieval.ts "GRPO implementation in Deepseek"
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import { z } from 'zod';

dotenv.config();

import { neonVectorStore } from '../src/lib/vector-store/neon-vector';
import { getEmbedding } from '../src/lib/embeddings/embedding-service';
import { getCacheValue, setCacheValue, generateCacheKey } from '../src/lib/cache/cache-service';
import { ActivityTracker, RagDocument, RagRetrievalResult, ResearchState } from '@/types/types';

const DB_VECTOR_DIMENSIONS = 1536;

const createActivityTracker = (): ActivityTracker => {
  return {
    add: (type: string, status: string, message: string) => {
      console.log(`[${type}][${status}] ${message}`);
    }
  };
};

function extractKeywords(topic: string): string[] {
  const text = topic.toLowerCase();
  const words = text.split(/\s+/);

  const stopWords = new Set(['the', 'and', 'of', 'to', 'in', 'a', 'for', 'with', 'on', 'at', 'from', 'by', 'about']);
  const keywords = words.filter(word => {
    return word.length > 3 && !stopWords.has(word);
  });

  return keywords;
}

async function queryDocumentsByKeywords(keywords: string[], limit: number): Promise<any[]> {
  try {
    const pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: true }
    });

    const connStr = process.env.NEON_DATABASE_URL || '';
    console.log(`Database connection string (partial): ${connStr.substring(0, 20)}...`);

    const query = `
      SELECT id, content, metadata, 0.5 as similarity
      FROM documents
      WHERE ${keywords.map((keyword, i) => `content ILIKE $${i + 1}`).join(' OR ')}
      OR ${keywords.map((keyword, i) => `metadata::text ILIKE $${keywords.length + i + 1}`).join(' OR ')}
      LIMIT $${keywords.length * 2 + 1}
    `;

    const params = [
      ...keywords.map(keyword => `%${keyword}%`),
      ...keywords.map(keyword => `%${keyword}%`),
      limit
    ];

    console.log(`Executing SQL query with keywords: ${keywords.join(', ')}`);
    const result = await pool.query(query, params);
    console.log(`Query returned ${result.rows.length} rows`);

    await pool.end();
    return result.rows;
  } catch (error) {
    console.error('Error querying documents by keywords:', error);
    return [];
  }
}

function estimateTokens(documents: RagDocument[]): number {
  const totalChars = documents.reduce((sum, doc) => sum + doc.content.length, 0);
  return Math.ceil(totalChars / 4);
}

async function retrieveContextForTopic(
  topic: string,
  researchState: ResearchState,
  activityTracker: ActivityTracker,
  limit: number = 5
): Promise<RagRetrievalResult> {
  try {
    console.log(`\n===== RAG: Retrieving context for topic "${topic}" =====`);
    activityTracker.add('rag-retrieval', 'pending', `Retrieving relevant context for: ${topic}`);

    const cacheKey = generateCacheKey(`rag-retrieval:${topic}:${limit}`);

    const cachedResult = await getCacheValue<RagRetrievalResult>(cacheKey);
    if (cachedResult) {
      console.log(`RAG: Using cached result with ${cachedResult.documents.length} documents`);
      activityTracker.add(
        'rag-retrieval',
        'complete',
        `Retrieved ${cachedResult.documents.length} relevant documents from cache`
      );
      return cachedResult;
    }

    const embeddingProvider = researchState.embeddingProvider || 'openai';
    console.log(`RAG: Generating embedding with provider ${embeddingProvider}`);

    try {
      const embedding = await getEmbedding(topic, {
        provider: embeddingProvider,
        cacheKey: `embedding:${embeddingProvider}:${topic}`,
        dimensions: DB_VECTOR_DIMENSIONS
      });

      console.log(`RAG: Generated embedding with ${embedding.length} dimensions`);

      const documentsLimit = Math.max(limit * 2, 10);
      const documents = await neonVectorStore.similaritySearch(embedding, documentsLimit);

      console.log(`RAG: Found ${documents.length} documents from vector similarity search`);

      if (documents.length === 0) {
        console.log(`RAG: No results from vector search, trying keyword fallback`);

        const keywords = extractKeywords(topic);
        console.log(`RAG: Extracted keywords: ${keywords.join(', ')}`);

        if (keywords.length > 0) {
          try {
            const keywordResults = await queryDocumentsByKeywords(keywords, limit);
            console.log(`RAG: Found ${keywordResults.length} documents through keyword search`);

            if (keywordResults.length > 0) {
              const ragDocuments: RagDocument[] = keywordResults.map(doc => ({
                id: doc.id || '',
                content: doc.content,
                metadata: doc.metadata,
                similarity: 0.5
              }));

              console.log("\n----- Sample of documents found via keywords -----");
              ragDocuments.slice(0, 2).forEach((doc, i) => {
                console.log(`\nDocument ${i + 1}:`);
                console.log(`ID: ${doc.id}`);
                console.log(`Title: ${doc.metadata.title || 'No title'}`);
                console.log(`Content snippet: ${doc.content.substring(0, 150)}...`);
              });

              const result: RagRetrievalResult = {
                documents: ragDocuments,
                totalTokens: estimateTokens(ragDocuments)
              };

              await setCacheValue(cacheKey, result);

              activityTracker.add(
                'rag-retrieval',
                'complete',
                `Retrieved ${ragDocuments.length} relevant documents via keyword fallback`
              );

              return result;
            }
          } catch (keywordError) {
            console.error('Error in keyword fallback search:', keywordError);
          }
        }
      }

      const ragDocuments: RagDocument[] = documents.map(doc => ({
        id: doc.id || '',
        content: doc.content,
        metadata: doc.metadata,
        similarity: doc.similarity
      }));

      console.log(`RAG: Processing ${ragDocuments.length} similar documents`);

      if (ragDocuments.length > 0) {
        console.log("\n----- Sample of documents found via vector search -----");
        ragDocuments.slice(0, 2).forEach((doc, i) => {
          console.log(`\nDocument ${i + 1}:`);
          console.log(`ID: ${doc.id}`);
          console.log(`Title: ${doc.metadata.title || 'No title'}`);
          console.log(`Similarity: ${doc.similarity || 'N/A'}`);
          console.log(`Content snippet: ${doc.content.substring(0, 150)}...`);
        });
      }

      const result: RagRetrievalResult = {
        documents: ragDocuments.slice(0, limit),
        totalTokens: estimateTokens(ragDocuments.slice(0, limit))
      };

      await setCacheValue(cacheKey, result);

      activityTracker.add(
        'rag-retrieval',
        'complete',
        `Retrieved ${result.documents.length} relevant documents for context enhancement`
      );

      return result;

    } catch (error) {
      console.error(`RAG retrieval error:`, error);
      activityTracker.add(
        'rag-retrieval',
        'error',
        `Failed to retrieve context: ${error instanceof Error ? error.message : String(error)}`
      );

      return {
        documents: [],
        totalTokens: 0
      };
    }
  } catch (error) {
    console.error(`RAG process error:`, error);
    activityTracker.add(
      'rag-retrieval',
      'error',
      `Failed in retrieval process: ${error instanceof Error ? error.message : String(error)}`
    );

    return {
      documents: [],
      totalTokens: 0
    };
  }
}

async function listAvailableTopics(): Promise<void> {
  try {
    const pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: true }
    });

    const query = `
      SELECT DISTINCT jsonb_extract_path_text(metadata, 'topic') as topic, COUNT(*) as count
      FROM documents
      WHERE metadata ? 'topic'
      GROUP BY topic
      ORDER BY count DESC
    `;

    const result = await pool.query(query);

    console.log("\n===== Available topics in database =====");
    if (result.rows.length === 0) {
      console.log("No topics found in the database.");
    } else {
      result.rows.forEach((row) => {
        console.log(`- ${row.topic}: ${row.count} documents`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error listing topics:', error);
  }
}

async function main() {
  const topic = process.argv[2] || "Explain the training and finetuning process of Deepseek R1";

  if (!topic) {
    console.error('Please provide a research topic as an argument');
    process.exit(1);
  }

  console.log(`\n===== Testing RAG retrieval for topic: "${topic}" =====`);

  const researchState: ResearchState = {
    topic,
    embeddingProvider: 'openai',
    provider: 'openai',
    useRAG: true,
    completedSteps: 0,
    tokenUsed: 0,
    findings: [],
    processedUrl: new Set(),
    clerificationsText: ''
  };

  const activityTracker = createActivityTracker();

  await listAvailableTopics();

  const result = await retrieveContextForTopic(topic, researchState, activityTracker);

  console.log(`\n===== Results Summary =====`);
  console.log(`Retrieved ${result.documents.length} documents`);
  console.log(`Estimated tokens: ${result.totalTokens}`);

  if (result.documents.length > 0) {
    console.log(`\nFirst document similarity: ${result.documents[0].similarity || 'N/A'}`);
    console.log(`First document title: ${result.documents[0].metadata.title || 'No title'}`);
  }

  console.log("\n===== Test completed =====");
}

main().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});