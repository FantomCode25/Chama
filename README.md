# DeepQuest: Intelligent Synthesis & Markdown Output 🔍🤖
[![Next.js](https://img.shields.io/badge/Next.js-13.5+-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/pnpm-8.x+-F69220?logo=pnpm)](https://pnpm.io/)

**Team Name:** _CHAMA_  
**Hackathon:** _FANTOMCODE 2025_  
**Date:** _12/4/2025_ 

### 🧠 Introduction  
Intelligent Synthesis & Markdown Output is a multimodal research assistant that helps users generate accurate, transparent, and visually-rich research reports. Designed for students, professionals, and analysts, it combines the power of LLMs, smart web search, and image analysis to automate complex research workflows. By shifting the burden of data gathering to AI, users can focus on insights and decision-making.


### ❗ Problem Statement

In today's fast-paced digital world, conducting in-depth research is often slow, fragmented, and lacks transparency. Existing AI tools typically fail to show how answers are formed, rely on outdated or unverifiable sources, and lack support for image-based analysis. Moreover, these tools are rarely scalable or optimized for real-time use, making them unreliable for serious research tasks. There's a pressing need for an intelligent, multimodal, and explainable system that streamlines the research process while ensuring trust, clarity, and efficiency.

### ✅ Solution Overview  

Our solution is a transparent and scalable AI research agent that mimics human research behavior. It uses clarifying questions, smart RAG (retrieval-augmented generation), image understanding, and dynamic visualizations to build comprehensive markdown reports. Key features include:  

🔍 Source Transparency with citation tracking  

🧠 Agentic AI Planning for step-by-step task execution  

🌐 Multimodal Input (text + image)  

⚡ Hybrid Caching (Redis + in-memory) for real-time speed  

📊 Visualizations using Mermaid, Chart.js, and D3.js  

💾 Export-ready reports with GitHub-based editing (WIP MCP)  

### Demo (YouTube Link):   

[![Deep Research AI Agent Demo](https://img.youtube.com/vi/197l6zDGWpg/0.jpg)](https://www.youtube.com/watch?v=197l6zDGWpg)  



![image](https://github.com/user-attachments/assets/4bb3b477-041b-4301-9372-75c47a4405b0)



![image](https://github.com/user-attachments/assets/09c3de70-6e9c-488d-8c00-bcd78762e763)



[Link to diagrams](https://excalidraw.com/#json=FpZpLCIPMwDaXG4fR2RZL,wkmPKRKKAT_55XlcsuiALQ)



## Features ✨

- **Multi-Model AI** (OpenAI, Gemini, OpenRouter)
- **RAG Architecture** with vector similarity search
- **Smart Web Search** (EXA API integration)
- **Real-time Progress Tracking**
- **AI-generated Visualizations** (Charts/Diagrams)
- **Hybrid Caching System** (Redis + in-memory)
- **Research History & Persistence**

## Getting Started 🚀

### Prerequisites

- Node.js 18+
- PNPM 8.x+
- Neon PostgreSQL Database
- Redis instance (recommend Upstash)
- API keys for:
  - OpenAI
  - Google Cloud
  - EXA
  - OpenRouter

### Tech Stack 📚

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui   
**AI Core:**	OpenAI, Gemini, OpenRouter, LangChain.js   
**Vector DB:**	Neon PostgreSQL + pgvector   
**Caching:**	Redis (Upstash), node-cache   
**Visualization:**	Mermaid.js, Chart.js, D3.js   
**APIs:**	Exa, Google Vision, Next.js API Routes   
**Auth:**	Next-Auth   
**State:**	Zustand   

### Installation

```bash
git clone https://github.com/your-org/deep-research-ai.git
cd deep-research-ai
pnpm install
```

### Configuration ⚙️

Create .env.local file:
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Exa Search API Key
EXA_SEARCH_API_KEY=your-exa-search-api-key
EXA_SEARCH_API_BASE_URL=https://api.exa.ai

# Neon Database Connection
NEON_DATABASE_URL=postgres://username:password@ep-example.neon.tech/database?sslmode=require

# OpenAI API Keys
OPENAI_API_KEY=your-openai-api-key

# Google API Keys
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_APPLICATION_CREDENTIALS=path-to-credentials.json
GOOGLE_CLOUD_PROJECT=your-cloud-project-id
NEXT_PUBLIC_ENABLE_VISUAL_CONTENT=true

# OpenRouter API Key
OPENROUTER_API_KEY=your-openrouter-api-key

# Cache settings (Redis optional)
CACHE_TTL=86400
REDIS_URL=redis://localhost:6379
USE_REDIS_CACHE=false
```

### Contributing 🤝

1. Fork the repository   
2. Create feature branch: git checkout -b feat/amazing-feature   
3. Commit changes: git commit -m 'feat: add amazing feature'   
4. Push to branch: git push origin feat/amazing-feature   
5. Open pull request   

### License 📄
MIT License - See LICENSE for details.    

### Happy Researching! 🧠🔬
This project is maintained by Team Chama.   
[Email me](mailto:abhinabdas004@gmail.com)   

