import { neonVectorStore, Document } from '../src/lib/vector-store/neon-vector';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: NEON_DATABASE_URL is not defined in environment variables!');
  process.exit(1);
}

console.log('Found Neon connection string:', connectionString.substring(0, 20) + '...');

async function generateMockEmbedding(text: string): Promise<number[]> {
  const seed = text.length;
  return Array(1536).fill(0).map((_, i) =>
    Math.sin(seed + i) * 0.5 + Math.cos(text.charCodeAt(i % text.length) * 0.01) * 0.5
  );
}

const sampleDocuments = [
  {
    content: "Machine learning is a subfield of artificial intelligence that focuses on developing algorithms that allow computers to learn from and make predictions or decisions based on data.",
    metadata: {
      title: "Introduction to Machine Learning",
      source: "AI Reference Guide",
      topic: "artificial intelligence"
    }
  },
  {
    content: "Deep learning is part of a broader family of machine learning methods based on artificial neural networks. It can learn multiple levels of representation that correspond to different levels of abstraction.",
    metadata: {
      title: "Deep Learning Fundamentals",
      source: "Neural Networks Handbook",
      topic: "artificial intelligence"
    }
  },
  {
    content: "Climate change refers to long-term shifts in temperatures and weather patterns. These changes may be natural, but since the 1800s, human activities have been the main driver of climate change.",
    metadata: {
      title: "Climate Change Overview",
      source: "Environmental Science Journal",
      topic: "climate change"
    }
  },
  {
    content: "Renewable energy sources like solar, wind, and hydroelectric power are crucial for reducing carbon emissions and combating climate change.",
    metadata: {
      title: "Renewable Energy Solutions",
      source: "Sustainable Energy Report",
      topic: "climate change"
    }
  },
  {
    content: "Quantum computing is a type of computation that harnesses the collective properties of quantum states, such as superposition, interference, and entanglement, to perform calculations.",
    metadata: {
      title: "Quantum Computing Basics",
      source: "Quantum Technology Review",
      topic: "quantum computing"
    }
  },
];

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    await neonVectorStore.initialize();
    console.log("Vector store initialized");

    for (const doc of sampleDocuments) {
      console.log(`Processing document: ${doc.metadata.title}`);

      try {
        const embedding = await generateMockEmbedding(doc.content);

        const document: Document = {
          content: doc.content,
          metadata: doc.metadata,
          embedding: embedding
        };

        await neonVectorStore.addDocuments([document]);

        console.log(`Added document: ${doc.metadata.title}`);
      } catch (error) {
        console.error(`Error processing document "${doc.metadata.title}":`, error);
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seeding function
seedDatabase().catch(console.error);