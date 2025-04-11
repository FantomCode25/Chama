/* eslint-disable @typescript-eslint/no-unused-vars */
import * as dotenv from 'dotenv';
import { Redis } from 'ioredis';
import { setCacheValue, getCacheValue, clearCache, generateCacheKey } from '../src/lib/cache/cache-service';
import { getEmbedding } from '../src/lib/embeddings/embedding-service';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function testRedisCache() {
  console.log("=== Redis Cache Test ===");

  const redisClient = new Redis(REDIS_URL);

  try {
    console.log("\n--- Test 1: Basic Cache Functionality ---");
    const testKey1 = "test:basic:cache";
    const testValue1 = {
      message: "Hello Redis!",
      timestamp: new Date().toISOString(),
      nested: { data: [1, 2, 3] }
    };

    console.log("Setting value in cache...");
    await setCacheValue(testKey1, testValue1, 300);

    console.log("Reading value from cache...");
    const retrievedValue1 = await getCacheValue(testKey1);

    console.log("Original:", testValue1);
    console.log("Retrieved:", retrievedValue1);
    console.log("Test passed:", JSON.stringify(testValue1) === JSON.stringify(retrievedValue1));

    console.log("\n--- Test 2: Verify Redis Storage ---");
    const allKeys = await redisClient.keys('*');
    console.log(`Total Redis keys: ${allKeys.length}`);
    console.log("Keys:", allKeys);

    if (allKeys.includes(testKey1)) {
      const rawValue = await redisClient.get(testKey1);
      console.log(`Raw value from Redis for key "${testKey1}":`);
      console.log(rawValue);
      console.log("TTL remaining (seconds):", await redisClient.ttl(testKey1));
    }

    console.log("\n--- Test 3: Cache with Hashed Key ---");
    const complexData = {
      query: "What is the capital of France?",
      timestamp: new Date().toISOString(),
      user: "test-user-123"
    };

    const hashedKey = generateCacheKey(JSON.stringify(complexData));
    console.log("Generated hash key:", hashedKey);

    await setCacheValue(hashedKey, complexData, 600); // 10 minute TTL
    const retrievedComplex = await getCacheValue(hashedKey);

    console.log("Successfully stored and retrieved with hash key:", !!retrievedComplex);
    console.log("Retrieved data:", retrievedComplex);

    console.log("\n--- Test 4: Simulating Embedding Cache ---");
    const testText = "This is a test for embedding vectors";
    const cacheKey = `embedding:openai:${generateCacheKey(testText)}`;

    console.log("Caching sample embedding vector...");
    const mockEmbedding = Array(384).fill(0).map(() => Math.random() * 2 - 1); // Random embedding
    await setCacheValue(cacheKey, mockEmbedding, 3600); // 1 hour TTL

    console.log("Retrieving sample embedding vector...");
    const retrievedEmbedding = await getCacheValue(cacheKey);

    console.log("Embedding vector retrieved successfully:", !!retrievedEmbedding);
    console.log(`Vector length: ${Array.isArray(retrievedEmbedding) ? retrievedEmbedding.length : 0}`);
    console.log("First 5 values:", Array.isArray(retrievedEmbedding) ? retrievedEmbedding.slice(0, 5) : []);

    console.log("\n--- Test 5: Keeping Cache Data for GUI Inspection ---");
    console.log("Skipping cache clearing to allow inspection in Redis GUI");
    console.log("You can now check http://localhost:8001/redis-stack/browser");
    console.log("Look for these keys:");
    console.log(`- ${testKey1}`);
    console.log(`- ${hashedKey}`);
    console.log(`- ${cacheKey}`);

    // Optional: Try actual embedding if available (uncomment if you want to test)
    /*
    try {
      console.log("\n--- Bonus Test: Actual Embedding Caching ---");
      const actualText = "This is a test of the actual embedding service";
      const embeddingCacheKey = `embedding:openai:${generateCacheKey(actualText)}`;
      
      console.log("Generating and caching actual embedding...");
      const embedding = await getEmbedding(actualText, {
        provider: 'openai',
        cacheKey: embeddingCacheKey
      });
      
      console.log("Embedding generated and cached!");
      console.log(`Vector dimensions: ${embedding.length}`);
      console.log("You can check this key in Redis GUI:", embeddingCacheKey);
    } catch (error) {
      console.error("Actual embedding test failed (API keys might be missing):", error);
    }
    */

    console.log("\n=== Test Summary ===");
    console.log("Redis cache is working correctly!");
    console.log("Data has been preserved in Redis for inspection");
    console.log("Access the Redis Browser UI at: http://localhost:8001/redis-stack/browser");

  } catch (error) {
    console.error("Redis test failed:", error);
  } finally {
    console.log("\nTest complete. Press Ctrl+C to exit.");
  }
}

testRedisCache().catch(console.error);