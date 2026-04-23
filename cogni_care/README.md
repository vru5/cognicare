cognicare/
├── src/
│   ├── app/                    # Next.js App Router (Pages & API routes)
│   │   ├── (auth)/             # Login & Registration flows
│   │   └── (dashboard)/        # User-facing dashboard (Brain Dump, Circle, Insights)
│   ├── features/               # Domain-driven logic (Brain Dump, Insights, Care Circle)
│   ├── components/             # Reusable UI components (shadcn/ui)
│   ├── lib/                    # Client-side utilities 
│   └── hooks/                  # Custom React hooks (Native APIs, Auth)
├── server/                     # Unified Backend Logic
│   ├── actions/                # Server Actions (Brain Dump processing, Insights)
│   ├── routes/                 # Custom routing logic
│   └── lib/                    # Server utilities (Prisma, Sockets, Notifications)
├── prisma/                     # Database Schema & Migrations
├── android/                    # Capacitor Android Studio project
├── ios/                        # Capacitor Xcode project
├── scripts/                    # Deployment & Maintenance scripts
├── public/                     # Static assets (Images, Lottie files)
├── capacitor.config.ts         # Mobile bridge configuration
└── cognicare_documentation.md  # Detailed Architecture & Concept Documentation