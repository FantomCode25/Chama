import { z } from "zod";

export interface ImageData {
    base64: string;
    name: string;
    type: string;
}

export interface VisualizationOptions {
  enabled: boolean;
  type: 'mermaid' | 'chartjs' | 'd3' | 'all';
}

export interface ResearchFindings {
  summary: string;
  source: string;
}

export interface ResearchState {
  topic: string;
  completedSteps: number;
  tokenUsed: number;
  findings: ResearchFindings[];
  processedUrl: Set<string>;
  clerificationsText: string;
  provider: ModelProvider;
  embeddingProvider?: EmbeddingProvider;
  useRAG?: boolean;
  images?: ImageData[];
  visualizations?: VisualizationOptions;
}

export interface ModelCallOptions<T> {
  model: string;
  prompt: string;
  system?: string;
  schema?: z.ZodType<T>;
  activityType?: Activity["type"];
  provider?: ModelProvider;
  structuredOutput?: boolean;
  images?: ImageData[];
}

export interface Activity {
  type: 'search' | 'extract' | 'analyze' | 'generate' | 'planning' | 'image-analysis' | 'rag-retrieval' | 'rag-storage';
  status: 'pending' | 'complete' | 'warning' | 'error' | 'info';
  message: string;
  timestamp?: number;
}

export type ModelProvider = 'openrouter' | 'google' | 'hybrid' | 'openai';
export type EmbeddingProvider = 'openai' | 'google';