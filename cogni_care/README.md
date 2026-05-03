# AI Symptom Tracker - CogniCare

## Introduction

CogniCare is a comprehensive healthcare platform designed to bridge the gap between dementia patients and their carers. By leveraging Large Language Models (LLMs) and real-time synchronization, CogniCare transforms unstructured daily entries into actionable clinical insights.

## Core Technology Stack

- **Frontend:** Next.js 15 (React 19), Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js, Socket.io (Real-time Communication)
- **Database:** PostgreSQL (via Supabase), Prisma ORM
- **AI/LLM:** Google Gemini API (Flash & Pro models)
- **Mobile:** Capacitor (Android & iOS)
- **Testing:** Playwright (End-to-End Smoke Testing)

## Project Architecture

cognicare/
├── src/                    # Frontend Application (Next.js)
│   ├── app/                # Pages & Layouts (App Router)
│   ├── features/           # Domain-driven modules (Brain Dump, Insights, Care Circle)
│   ├── components/         # Reusable UI components (shadcn/ui)
│   ├── lib/                # Client-side utilities & API clients
│   └── hooks/              # Custom React hooks (Native APIs, Auth)
├── server/                 # Backend API (Express.js)
│   ├── actions/            # Business logic (AI processing, Data aggregation)
│   ├── routes/             # RESTful API endpoints
│   ├── lib/                # Shared utilities (Socket.io, Prisma Client)
│   └── prisma/             # Database Schema & Migrations (Moved for backend isolation)
├── android/                # Native Android Project (Capacitor)
├── ios/                    # Native iOS Project (Capacitor)
├── infra/                  # Deployment configurations (Render Blueprint)
├── tests/                  # Playwright E2E testing suite
├── public/                 # Static assets (Images, Lottie files)
├── capacitor.config.ts     # Mobile bridge configuration
└── playwright.config.ts    # Test runner configuration


## Key Features

- **AI Brain-Dump:** Converts natural language journal entries into structured symptom logs using Gemini AI.
- **Predictive Health Insights:** Provides a 7-day health outlook and trend analysis based on longitudinal symptom data.
- **Care Circle:** Real-time chat and notification system connecting patients with their designated carers.
- **AI-Powered Clinical Reports:** Generates comprehensive PDF summaries of patient progress for medical consultations.
- **Smart Caching:** Implements an AI caching layer to reduce LLM latency and API costs.

## Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Supabase recommended)
- Google Gemini API Key

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="your_supabase_url"
DIRECT_URL="your_direct_db_url"
GEMINI_API_KEY="your_gemini_key"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3. Setup Backend
```bash
cd server
npm install
npx prisma generate
npm run dev
```

### 4. Setup Frontend
```bash
# In a new terminal (root)
npm install
npm run dev
```

### 5. Setup Mobile (Android)
```bash
npm run build
npx cap sync android
npx cap open android
```

## Deployment Strategy

- **Frontend:** Deployed on **Vercel** with integrated Global CDN for static asset delivery.
- **Backend:** Deployed on **Render** as a persistent web service to support stateful **Socket.io** connections (circumventing serverless timeout constraints).
- **Database:** Managed via **Supabase** with automated migrations via Prisma.

---

> [!NOTE]
> **Architectural Rationale:** The decision to deploy the backend on Render rather than a serverless platform was validated by the stateful requirements of WebSockets (Socket.io). Persistent connections are technically incompatible with standard serverless execution models, making a dedicated service an architectural necessity.