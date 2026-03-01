cognicare/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (Login, Signup)
│   │   ├── (dashboard)/        # Main App Layout
│   │   │   ├── brain-dump/     # Entry point for the AI text/voice
│   │   │   ├── circle/         # Care Circle management
│   │   │   └── timeline/       # Shared health feed
│   │   └── api/                # Global API routes
│   ├── features/               # Domain-driven logic
│   │   ├── brain-dump/         # 🧠 NLP & "Normalization" Logic
│   │   │   ├── components/     # Unstructured text & Voice UI
│   │   │   ├── services/       # OpenAI / Whisper integration
│   │   │   └── types/          # 5 Pillars TypeScript interfaces
│   │   ├── care-circle/        # ⭕ RBAC & Permissions
│   │   │   ├── components/     # Permission toggles, Invite forms
│   │   │   └── server/         # The "Permission Gatekeeper" logic
│   │   ├── monitoring/         # 📈 Clinical Summary & Exports
│   │   │   ├── components/     # Weekly Trends graphs
│   │   │   └── actions/        # PDF Generation logic
│   │   └── messaging/          # 💬 Real-time Socket.io chat
│   ├── components/             # Shared UI (shadcn/ui)
│   ├── lib/                    # Global utilities (Prisma client, PII Redactor)
│   └── hooks/                  # Global hooks (useAuth, useNativeMicrophone)
├── prisma/                     # Database Schema
└── capacitor.config.ts         # Mobile bridge configuration