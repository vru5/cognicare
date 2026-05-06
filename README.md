# AI Symptom Tracker - CogniCare

## Bridging the Gap in CTE & Neurological Care

**CogniCare** is a clinical-grade health platform designed for individuals with suspected Chronic Traumatic Encephalopathy (CTE) and their care circles. By transforming raw, unstructured "brain dumps" into structured medical data, CogniCare reduces the cognitive burden on patients while providing caregivers and clinicians with longitudinal, actionable insights.

---

## Key Features

### AI-Driven "Brain Dump" Analysis
Patients can record raw thoughts or symptoms via text or **Voice-to-Text**. Our system leverages **Google Gemini 2.5 Flash** to automatically parse and tag entries into five core health pillars:
- **🔴 Physical** | **🟣 Mood** | **🔵 Cognitive** | **🔵 Sleep** | **🟢 Social**

### Privacy-First Engineering
Security is not an afterthought. CogniCare implements **NLP-driven PII Masking** (Personal Identifiable Information) before any data is sent to the LLM, ensuring patient anonymity is maintained at every step of the analysis.

### Clinical Intelligence & Forecasting
- **Peak Severity Tracking:** Unlike simple averages, our system identifies the "Peak" severity of symptoms to ensure high-risk neurological events are highlighted.
- **Predictive Analytics:** Analyzes 30-day historical trajectories to forecast a 7-day health outlook for proactive care management.
- **NHS-Aligned Reporting:** Generates structured PDF clinical summaries prompted to align with NHS guidance, ready for medical consultations.

### Collaborative Care Circle
A real-time synchronization layer (Socket.io) allows patients to invite carers with granular, pillar-specific permissions. Carers receive live "Pulse" notifications whenever a new log is processed.

---

## Technical Architecture

CogniCare utilizes a modern, high-performance stack designed for scalability and real-time interaction.

| Layer | Technology |
| :--- | :--- |
| **Frontend** | **Next.js 16 (React 19)**, TypeScript, Tailwind CSS 4 |
| **Mobile** | **Capacitor** (Native iOS & Android builds) |
| **Backend** | **Node.js**, Express.js, Socket.io |
| **Database** | **PostgreSQL** via **Supabase**, Prisma ORM |
| **AI/ML** | **Google Gemini 2.5 Flash** (with Flash-Lite Fallback) |
| **UI/UX** | Framer Motion, Shadcn UI, Recharts |
| **Testing** | Playwright (E2E Smoke Tests) |

### Deployment Strategy
- **Frontend:** Hosted on **Vercel** for edge-optimized delivery.
- **Backend:** Hosted on **Render** (Persistent Service) to support stateful WebSocket connections.
- **Database:** Managed via **Supabase** with automated migrations.

---

## Live Links and ANdroid APK
**Live Web Application** -	https://cognicare-rosy.vercel.app/

**Backend API** -	https://cogni-care-backend.onrender.com

**Android APK Download** -	[Cognicare-v1.0.apk](https://drive.google.com/file/d/1tjyThhkdRow24a68iNztSgnxbhPtY7Oz/view?usp=sharing)

> **Cold Start Warning:** This project is deployed on Render's free tier. If the application hasn't been accessed in a while, the server goes into auto-sleep. It may take 1-2 minutes for the backend to spin back up on your first request.

## Technical Deep Dive: Resilience & Performance

### AI Resilience Layer
To ensure 100% uptime, CogniCare implements a fallback mechanism. If the primary Gemini 2.5 Flash model experiences high latency or rate limits, the system automatically pivots to **Gemini 2.5 Flash-Lite**, ensuring the patient's entry is processed without delay.

### Smart Caching
Clinical reports utilize a **Hash-based Cache**. By generating an MD5 hash of the patient's logs for a specific period, the system detects if data has changed. If the data is identical, it serves the cached AI insights instantly, reducing API costs and latency.

---

## Design Philosophy
CogniCare follows **WCAG 2.1** accessibility standards, featuring a high-contrast, simplified UI designed specifically for users with cognitive impairments. The interface uses **Glassmorphism** and **Micro-animations** (Framer Motion) to create a premium, calm, and supportive user experience.

---

## Future Roadmap
-  **FHIR Integration:** Mapping internal data structures to NHS FHIR standards.
-  **Offline Entry:** PWA functionality for symptom logging without internet.
-  **Secure Messaging:** Socket.io-based encrypted chat for Care Circles.

---

> **Note:** This project was developed as a supportive health platform for CTE patients and their families, prioritizing clinical accuracy and data privacy.
