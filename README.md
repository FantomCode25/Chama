# DeepQuest: Intelligent Synthesis & Markdown Output 🔍🤖

[![Next.js](https://img.shields.io/badge/Next.js-13.5+-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PNPM](https://img.shields.io/badge/pnpm-8.x+-F69220?logo=pnpm)](https://pnpm.io/)

An AI-powered research assistant that generates comprehensive reports with visualizations using RAG architecture and multi-model intelligence.

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
# Database
POSTGRES_URL="neon://user:password@ep-cool-cloud-123456.us-east-2.aws.neon.tech/main"
REDIS_URL="redis://default:password@usw2-cool-redis-12345.upstash.io:6379"

# AI Providers
OPENAI_API_KEY="sk-..."
GOOGLE_API_KEY="ai-..."
EXA_API_KEY="..."sa

# Auth (configure your auth provider)
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
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

