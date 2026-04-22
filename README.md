# 🚀 BizPilot

### Your AI-Powered Back-Office, On Autopilot

> The all-in-one AI platform that replaces 5-8 apps for small businesses — invoicing, scheduling, client management, and more.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [01 — Product Requirements (PRD)](docs/01_PRD_Product_Requirements.md) | Features, personas, pricing, KPIs, competitive analysis |
| [02 — Technical Architecture](docs/02_Technical_Architecture.md) | Tech stack, system design, API design, security, deployment |
| [03 — Database Schema](docs/03_Database_Schema.md) | Complete Prisma schema with all models, relations, and indexes |
| [04 — Go-To-Market Strategy](docs/04_Go_To_Market_Strategy.md) | Launch plan, marketing channels, growth strategy, revenue projections |
| [05 — Development Roadmap](docs/05_Development_Roadmap.md) | 18-week sprint plan with detailed task breakdowns |

---

## 🎯 What is BizPilot?

BizPilot is an AI-first platform that automates the entire back-office for small businesses:

- **AI Invoice Generator** — Create invoices in seconds with natural language
- **Smart Scheduling** — Booking pages, calendar sync, auto-reminders
- **Client Management** — CRM lite with interaction history
- **AI Communication** — AI-drafted emails and auto follow-ups
- **Dashboard & Analytics** — Revenue insights, daily AI briefing
- **Mobile App** — Manage your business on the go

### The Problem We Solve
33.2 million small businesses in the US waste **40% of their time** on admin tasks, juggling 5-8 separate apps (QuickBooks, Calendly, HubSpot, Mailchimp, etc.). BizPilot replaces them all with one AI-powered platform.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web App** | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| **Mobile App** | React Native, Expo |
| **API** | tRPC, Next.js API Routes |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **Cache** | Redis (Upstash) |
| **AI** | OpenAI GPT-4o, Vercel AI SDK |
| **Payments** | Stripe |
| **Email** | Resend (React Email) |
| **SMS** | Twilio |
| **Auth** | NextAuth.js |
| **Hosting** | Vercel |
| **Monorepo** | Turborepo + pnpm |

---

## 📁 Project Structure

```
bizpilot/
├── apps/
│   ├── web/          # Next.js web dashboard
│   ├── mobile/       # React Native (Expo) app
│   └── marketing/    # Landing page + blog
├── packages/
│   ├── api/          # tRPC routers (shared logic)
│   ├── db/           # Prisma schema + client
│   ├── ai/           # AI service layer
│   ├── email/        # Email templates
│   ├── ui/           # Shared UI components
│   └── shared/       # Types, utils, validators
├── tooling/
│   ├── eslint/       # Shared ESLint config
│   ├── typescript/   # Shared TS config
│   └── tailwind/     # Shared Tailwind config
└── docs/             # Documentation
```

---

## 💰 Business Model

| Plan | Price | Target |
|------|-------|--------|
| **Starter** | $29/mo | Solo freelancers |
| **Professional** | $79/mo | Growing businesses |
| **Business** | $149/mo | Teams (2-15 people) |
| **Enterprise** | Custom | Large businesses |

**Revenue Target (Year 1):** $1M–$3.6M ARR

---

## 📅 Timeline

| Milestone | Date |
|-----------|------|
| Project Start | March 2026 |
| Landing Page Live | Week 1 |
| MVP Complete | July 2026 |
| Beta Launch (500 users) | July 2026 |
| Public Launch | August 2026 |
| 1,000 Paying Customers | January 2027 |

---

## 🚧 Current Status

**Phase:** Planning & Architecture Complete ✅  
**Next Step:** Initialize monorepo and start building Phase 0 (Foundation)

---

*Built with ❤️ for small businesses everywhere.*
