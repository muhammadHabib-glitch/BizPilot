# BizPilot — Technical Architecture

**Version:** 1.0  
**Date:** March 6, 2026  
**Architecture Style:** Monorepo, Modular Monolith (MVP) → Microservices (Scale)  

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Web App      │  │  Mobile App  │  │  Public Booking Page     │   │
│  │  (Next.js)    │  │  (React      │  │  (Next.js SSR)           │   │
│  │  Dashboard    │  │   Native)    │  │  Client-facing           │   │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘   │
│         │                  │                        │                 │
└─────────┼──────────────────┼────────────────────────┼─────────────────┘
          │                  │                        │
          ▼                  ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY / BFF                             │
│                     (Next.js API Routes + tRPC)                      │
│                                                                      │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐  │
│  │  Auth   │ │ Rate     │ │ Request  │ │ API     │ │ WebSocket  │  │
│  │ Middle- │ │ Limiting │ │ Logging  │ │ Version │ │ Handler    │  │
│  │  ware   │ │          │ │          │ │  ing    │ │            │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────┘ └────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                                   │
│                   (Business Logic Modules)                            │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │
│  │  Invoice    │ │ Scheduling  │ │  Client     │ │  AI Engine   │  │
│  │  Service    │ │  Service    │ │  Service    │ │  Service     │  │
│  │             │ │             │ │  (CRM)      │ │              │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘  │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │
│  │  Payment    │ │ Notification│ │  Analytics  │ │  User/Auth   │  │
│  │  Service    │ │  Service    │ │  Service    │ │  Service     │  │
│  │ (Stripe)    │ │(Email/SMS)  │ │             │ │              │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                      │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ ┌────────────┐  │
│  │ PostgreSQL   │  │   Redis      │  │    S3     │ │ Pinecone/  │  │
│  │ (Primary DB) │  │  (Cache +    │  │  (Files,  │ │ pgvector   │  │
│  │ via Supabase │  │   Sessions + │  │  PDFs,    │ │ (AI Vector │  │
│  │  or Neon)    │  │   Queue)     │  │  Images)  │ │  Store)    │  │
│  └──────────────┘  └──────────────┘  └───────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                                  │
│                                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │
│  │Stripe  │ │Twilio  │ │Send-   │ │Google  │ │OpenAI/ │ │Plaid  │ │
│  │Payment │ │SMS     │ │Grid    │ │Calendar│ │Claude  │ │Banking│ │
│  │        │ │        │ │Email   │ │API     │ │AI API  │ │(v2)   │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └───────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### Frontend — Web Application
| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **Next.js 15** | Web framework | SSR for SEO (booking pages), App Router, API routes |
| **TypeScript** | Language | Type safety, better DX, fewer runtime errors |
| **Tailwind CSS** | Styling | Rapid UI development, consistent design |
| **shadcn/ui** | Component library | Beautiful, accessible, customizable components |
| **React Query (TanStack)** | Data fetching | Caching, optimistic updates, real-time sync |
| **tRPC** | API layer | End-to-end type safety between client and server |
| **Zustand** | State management | Lightweight, simple global state |
| **React Hook Form + Zod** | Forms & validation | Type-safe forms with schema validation |
| **Recharts** | Charts/analytics | Dashboard visualizations |
| **Framer Motion** | Animations | Smooth UI transitions |

### Frontend — Mobile Application
| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **React Native** | Cross-platform mobile | iOS + Android from one codebase, shares TS skills |
| **Expo** | Dev tooling | Faster development, OTA updates, easy builds |
| **NativeWind** | Mobile styling | Tailwind for React Native — consistent with web |
| **React Navigation** | Routing | Industry standard for RN navigation |
| **expo-notifications** | Push notifications | Invoice paid, new booking, reminders |

### Backend
| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **Next.js API Routes** | API server | Collocated with frontend, serverless-ready |
| **tRPC** | API protocol | Type-safe, auto-generated client, no REST boilerplate |
| **Prisma** | ORM | Type-safe database queries, migrations, seeding |
| **NextAuth.js (Auth.js)** | Authentication | OAuth + email auth, session management |
| **BullMQ** | Job queue | Background jobs: reminders, AI processing, emails |
| **Node.js** | Runtime | JavaScript ecosystem, async I/O |

### Database & Storage
| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **PostgreSQL (Neon)** | Primary database | Serverless Postgres, auto-scaling, branching |
| **Redis (Upstash)** | Cache + queues | Serverless Redis, session cache, rate limiting |
| **AWS S3 / Cloudflare R2** | File storage | Invoice PDFs, receipts, business logos |
| **pgvector** | Vector store | AI embeddings for smart search and suggestions |

### AI / ML
| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **OpenAI GPT-4o** | Primary AI | Invoice generation, email drafts, chat |
| **Anthropic Claude** | Fallback AI | Redundancy, comparison, specific tasks |
| **Vercel AI SDK** | AI streaming | Streaming AI responses, tool calling |
| **LangChain.js** | AI orchestration | Complex AI workflows, chains, agents |

### External APIs
| Service | Purpose | Cost |
|---------|---------|------|
| **Stripe** | Payment processing | 2.9% + $0.30 per transaction |
| **Twilio** | SMS notifications | ~$0.0079/SMS |
| **SendGrid** | Email delivery | Free up to 100/day, then $19.95/mo |
| **Google Calendar API** | Calendar sync | Free |
| **Microsoft Graph API** | Outlook sync | Free |
| **Plaid** (Phase 2) | Bank connections | $0.30/connection/month |

### Infrastructure & DevOps
| Technology | Purpose | Justification |
|-----------|---------|---------------|
| **Vercel** | Web hosting | Zero-config Next.js deployment, edge functions |
| **Expo EAS** | Mobile builds | Cloud builds for iOS + Android |
| **GitHub Actions** | CI/CD | Automated testing, linting, deployment |
| **Sentry** | Error tracking | Real-time error monitoring, performance |
| **PostHog** | Analytics | Product analytics, feature flags, session replay |
| **Resend** | Transactional email | Modern email API, React email templates |

---

## 3. Monorepo Structure

```
bizpilot/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Auth pages (login, signup)
│   │   │   ├── (dashboard)/    # Protected dashboard pages
│   │   │   │   ├── invoices/
│   │   │   │   ├── schedule/
│   │   │   │   ├── clients/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── (public)/       # Public pages
│   │   │   │   ├── book/[slug] # Public booking pages
│   │   │   │   └── pay/[id]    # Public invoice payment pages
│   │   │   ├── api/            # API routes
│   │   │   │   └── trpc/       # tRPC handler
│   │   │   └── layout.tsx
│   │   ├── components/         # Web-specific components
│   │   ├── lib/                # Web utilities
│   │   └── styles/
│   │
│   ├── mobile/                 # React Native (Expo) app
│   │   ├── app/                # Expo Router pages
│   │   ├── components/         # Mobile-specific components
│   │   └── lib/                # Mobile utilities
│   │
│   └── marketing/              # Landing page / marketing site
│       ├── app/
│       └── components/
│
├── packages/
│   ├── api/                    # tRPC routers (shared API logic)
│   │   ├── src/
│   │   │   ├── routers/
│   │   │   │   ├── invoice.ts
│   │   │   │   ├── schedule.ts
│   │   │   │   ├── client.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── ai.ts
│   │   │   ├── middleware/
│   │   │   └── trpc.ts
│   │   └── index.ts
│   │
│   ├── db/                     # Prisma schema + client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── index.ts
│   │
│   ├── ai/                     # AI service layer
│   │   ├── src/
│   │   │   ├── invoice-generator.ts
│   │   │   ├── email-drafter.ts
│   │   │   ├── daily-briefing.ts
│   │   │   ├── smart-scheduler.ts
│   │   │   └── prompts/
│   │   └── index.ts
│   │
│   ├── email/                  # Email templates (React Email)
│   │   ├── templates/
│   │   │   ├── invoice-sent.tsx
│   │   │   ├── payment-reminder.tsx
│   │   │   ├── booking-confirmation.tsx
│   │   │   └── welcome.tsx
│   │   └── index.ts
│   │
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   └── index.ts
│   │
│   └── shared/                 # Shared types, utils, constants
│       ├── src/
│       │   ├── types/
│       │   ├── utils/
│       │   ├── constants/
│       │   └── validators/     # Zod schemas
│       └── index.ts
│
├── tooling/
│   ├── eslint/                 # Shared ESLint config
│   ├── typescript/             # Shared TS config
│   └── tailwind/               # Shared Tailwind config
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── turbo.json                  # Turborepo config
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 4. Database Schema (Core Tables)

```
┌─────────────────────────────────────────────────────────────┐
│                      CORE ENTITIES                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│    User       │     │   Business   │     │  Subscription    │
├──────────────┤     ├──────────────┤     ├──────────────────┤
│ id           │────▶│ id           │────▶│ id               │
│ email        │     │ userId       │     │ businessId       │
│ name         │     │ name         │     │ plan (enum)      │
│ avatar       │     │ slug         │     │ stripeSubId      │
│ passwordHash │     │ logo         │     │ status           │
│ provider     │     │ industry     │     │ currentPeriodEnd │
│ createdAt    │     │ timezone     │     │ createdAt        │
└──────────────┘     │ currency     │     └──────────────────┘
                     │ workingHours │
                     │ createdAt    │
                     └──────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Client     │  │   Invoice    │  │  Booking     │
├──────────────┤  ├──────────────┤  │  Page        │
│ id           │  │ id           │  ├──────────────┤
│ businessId   │  │ businessId   │  │ id           │
│ name         │  │ clientId     │  │ businessId   │
│ email        │  │ number       │  │ slug         │
│ phone        │  │ status       │  │ title        │
│ company      │  │ dueDate      │  │ description  │
│ address      │  │ subtotal     │  │ duration     │
│ tags[]       │  │ tax          │  │ bufferTime   │
│ notes        │  │ total        │  │ isActive     │
│ createdAt    │  │ currency     │  │ createdAt    │
└──────────────┘  │ paidAt       │  └──────┬───────┘
       │          │ sentAt       │         │
       │          │ stripePayId  │         ▼
       │          │ createdAt    │  ┌──────────────┐
       │          └──────┬───────┘  │ Appointment  │
       │                 │          ├──────────────┤
       │                 ▼          │ id           │
       │          ┌──────────────┐  │ bookingPageId│
       │          │ InvoiceItem  │  │ clientId     │
       │          ├──────────────┤  │ businessId   │
       │          │ id           │  │ startTime    │
       │          │ invoiceId    │  │ endTime      │
       │          │ description  │  │ status       │
       │          │ quantity     │  │ notes        │
       │          │ unitPrice    │  │ googleEventId│
       │          │ total        │  │ reminderSent │
       │          └──────────────┘  │ createdAt    │
       │                            └──────────────┘
       │
       ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Notification │  │  AIAction    │  │  Activity    │
├──────────────┤  ├──────────────┤  │  Log         │
│ id           │  │ id           │  ├──────────────┤
│ userId       │  │ businessId   │  │ id           │
│ businessId   │  │ type         │  │ businessId   │
│ type         │  │ prompt       │  │ entityType   │
│ channel      │  │ result       │  │ entityId     │
│ subject      │  │ tokensUsed   │  │ action       │
│ body         │  │ model        │  │ description  │
│ sentAt       │  │ createdAt    │  │ metadata     │
│ readAt       │  └──────────────┘  │ createdAt    │
│ createdAt    │                     └──────────────┘
└──────────────┘
```

---

## 5. API Design (tRPC Routers)

### Invoice Router
```typescript
invoiceRouter = {
  // Queries
  list:        (filters, pagination) → Invoice[]
  getById:     (invoiceId) → Invoice
  getStats:    () → InvoiceStats
  getOverdue:  () → Invoice[]
  
  // Mutations  
  create:      (data) → Invoice
  update:      (invoiceId, data) → Invoice
  delete:      (invoiceId) → void
  send:        (invoiceId) → void
  markPaid:    (invoiceId) → void
  duplicate:   (invoiceId) → Invoice
  
  // AI
  aiGenerate:  (prompt: string) → InvoiceDraft
  aiReminder:  (invoiceId) → void  // send AI-crafted reminder
}
```

### Schedule Router
```typescript
scheduleRouter = {
  // Queries
  getBookingPages:   () → BookingPage[]
  getAppointments:   (dateRange) → Appointment[]
  getAvailability:   (bookingPageId, date) → TimeSlot[]
  
  // Mutations
  createBookingPage: (data) → BookingPage
  updateBookingPage: (id, data) → BookingPage
  
  // Public (no auth)
  getPublicPage:     (slug) → PublicBookingPage
  bookAppointment:   (slug, data) → Appointment
  cancelAppointment: (appointmentId, token) → void
  reschedule:        (appointmentId, token, newTime) → Appointment
}
```

### Client Router
```typescript
clientRouter = {
  list:       (filters, search, pagination) → Client[]
  getById:    (clientId) → ClientWithHistory
  create:     (data) → Client
  update:     (clientId, data) → Client
  delete:     (clientId) → void
  import:     (csvFile) → ImportResult
  getTimeline: (clientId) → ActivityLog[]
}
```

### AI Router
```typescript
aiRouter = {
  dailyBriefing:   () → DailyBriefing
  draftEmail:      (context, tone) → EmailDraft  
  generateInvoice: (naturalLanguage) → InvoiceDraft
  suggestTimes:    (clientId) → TimeSuggestion[]
  chat:            (message, context) → AIResponse  // streaming
}
```

---

## 6. Authentication Flow

```
┌──────────┐                    ┌──────────┐                ┌──────────┐
│  Client   │                    │  BizPilot │                │  OAuth   │
│  (Web/    │                    │  Server   │                │ Provider │
│  Mobile)  │                    │           │                │(Google)  │
└────┬─────┘                    └─────┬────┘                └────┬─────┘
     │                                │                          │
     │  1. Click "Sign in with Google"│                          │
     │ ──────────────────────────────▶│                          │
     │                                │  2. Redirect to Google   │
     │                                │─────────────────────────▶│
     │                                │                          │
     │  3. Google consent screen      │                          │
     │◀──────────────────────────────────────────────────────────│
     │                                │                          │
     │  4. Auth code callback         │                          │
     │───────────────────────────────▶│                          │
     │                                │  5. Exchange code        │
     │                                │─────────────────────────▶│
     │                                │                          │
     │                                │  6. User info + tokens   │
     │                                │◀─────────────────────────│
     │                                │                          │
     │                                │  7. Create/find user     │
     │                                │  8. Create JWT session   │
     │                                │                          │
     │  9. Set session cookie + redirect to dashboard            │
     │◀───────────────────────────────│                          │
     │                                │                          │
```

### Auth Methods Supported
1. **Google OAuth** (primary — most SMB owners use Google Workspace)
2. **Email + Password** (traditional)
3. **Apple Sign-In** (required for iOS App Store)
4. **Magic Link** (passwordless email login)

---

## 7. Background Jobs Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  API Request  │────▶│   BullMQ     │────▶│   Job Workers    │
│  (trigger)    │     │   Queue      │     │                  │
└──────────────┘     │  (Redis)     │     │  ┌────────────┐  │
                     └──────────────┘     │  │ Email      │  │
                                          │  │ Worker     │  │
                                          │  └────────────┘  │
                                          │  ┌────────────┐  │
                                          │  │ SMS        │  │
                                          │  │ Worker     │  │
                                          │  └────────────┘  │
                                          │  ┌────────────┐  │
                                          │  │ AI         │  │
                                          │  │ Worker     │  │
                                          │  └────────────┘  │
                                          │  ┌────────────┐  │
                                          │  │ Invoice    │  │
                                          │  │ PDF Worker │  │
                                          │  └────────────┘  │
                                          │  ┌────────────┐  │
                                          │  │ Calendar   │  │
                                          │  │ Sync Worker│  │
                                          │  └────────────┘  │
                                          └──────────────────┘

Scheduled Jobs (Cron):
├── Every morning 7am:  Generate AI daily briefing
├── Every hour:         Check overdue invoices → send reminders
├── Every 15 min:       Sync calendars
├── 24hr before appt:   Send appointment reminder
├── 1hr before appt:    Send appointment reminder
└── Weekly:             Generate analytics summary
```

---

## 8. Security Architecture

### Data Flow Security
```
Client ──[TLS 1.3]──▶ Vercel Edge ──▶ API Route ──▶ Service ──▶ DB
                                         │
                                    [Auth Check]
                                    [Rate Limit]
                                    [Input Validation]
                                    [Tenant Isolation]
```

### Multi-Tenant Data Isolation
- Every database query filtered by `businessId`
- Prisma middleware enforces tenant isolation automatically
- Row-Level Security (RLS) as additional safeguard
- API keys scoped to business

### Key Security Measures
1. **Authentication:** JWT tokens, HTTP-only cookies, CSRF protection
2. **Authorization:** Role-based (owner, admin, member, viewer)
3. **Data Encryption:** AES-256 at rest (Neon), TLS 1.3 in transit
4. **Input Validation:** Zod schemas on every API endpoint
5. **Rate Limiting:** Per-user, per-IP, per-endpoint limits
6. **XSS Prevention:** React auto-escaping, CSP headers
7. **SQL Injection:** Prisma parameterized queries (impossible by design)
8. **Audit Logging:** All mutations logged with user, action, timestamp

---

## 9. Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                  PRODUCTION                       │
│                                                   │
│  ┌─────────────────┐    ┌──────────────────────┐ │
│  │   Vercel         │    │   Neon PostgreSQL    │ │
│  │   (Web App +     │    │   (Serverless DB)    │ │
│  │    API + Edge)   │    │   US-East region     │ │
│  └────────┬────────┘    └──────────────────────┘ │
│           │                                       │
│  ┌────────▼────────┐    ┌──────────────────────┐ │
│  │   Vercel Edge    │    │   Upstash Redis      │ │
│  │   (CDN + Edge    │    │   (Serverless Cache) │ │
│  │    Functions)    │    │                       │ │
│  └─────────────────┘    └──────────────────────┘ │
│                                                   │
│  ┌─────────────────┐    ┌──────────────────────┐ │
│  │   Cloudflare R2  │    │   Trigger.dev        │ │
│  │   (File Storage) │    │   (Background Jobs)  │ │
│  └─────────────────┘    └──────────────────────┘ │
│                                                   │
│  ┌─────────────────┐    ┌──────────────────────┐ │
│  │   Expo EAS       │    │   Sentry             │ │
│  │   (Mobile Builds)│    │   (Error Tracking)   │ │
│  └─────────────────┘    └──────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Environments
| Environment | Purpose | URL |
|------------|---------|-----|
| Development | Local dev | localhost:3000 |
| Preview | PR previews | pr-123.bizpilot.vercel.app |
| Staging | Pre-production testing | staging.bizpilot.app |
| Production | Live users | app.bizpilot.app |

### CI/CD Pipeline
```
Push to GitHub
  → Lint + Type Check
  → Unit Tests
  → Integration Tests
  → Build
  → Deploy to Preview (PR) / Staging (main) / Production (release tag)
```

---

## 10. Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking, performance monitoring |
| **PostHog** | Product analytics, feature flags, session replay |
| **Vercel Analytics** | Web vitals, page performance |
| **Better Uptime** | Uptime monitoring, status page |
| **Axiom** | Log aggregation, queries |

### Key Alerts
- Error rate > 1% → Slack alert
- API response time > 2s → Slack alert  
- Payment failure → Immediate alert
- Server downtime → PagerDuty

---

## 11. Cost Estimates (MVP — First 6 Months)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro | $20 |
| Neon PostgreSQL | Launch | $19 |
| Upstash Redis | Pay-as-you-go | $5 |
| Cloudflare R2 | Pay-as-you-go | $5 |
| SendGrid | Essentials | $20 |
| Twilio | Pay-as-you-go | $20 |
| OpenAI API | Pay-as-you-go | $50-200 |
| Sentry | Team | $26 |
| PostHog | Free tier | $0 |
| Expo EAS | Production | $99 |
| Domain + DNS | Annual | $3 |
| GitHub | Team | $4 |
| **Total** | | **~$270-$420/month** |

Scales efficiently — these costs support up to ~5,000 users before needing significant increases.

---

*This architecture is designed for rapid MVP development with a clear path to scale. The modular monolith approach allows us to move fast initially and extract services as needed.*
