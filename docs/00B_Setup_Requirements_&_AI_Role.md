# BizPilot — What You Need to Provide & Role of AI

**Date:** March 6, 2026  
**Focus:** MVP Only (12 weeks)  

---

## PART 1: EVERYTHING YOU NEED TO SET UP (Before We Code)

### Quick Overview

| # | What You Need | Free or Paid | When Needed | Priority |
|---|--------------|-------------|-------------|----------|
| 1 | Node.js installed on your machine | Free | Day 1 | 🔴 Immediate |
| 2 | GitHub account | Free | Day 1 | 🔴 Immediate |
| 3 | Supabase account (database + auth) | Free tier | Day 1 | 🔴 Immediate |
| 4 | OpenAI API key | Paid (pay-per-use) | Week 3 | 🟡 Soon |
| 5 | Vercel account (hosting) | Free tier | Week 1 | 🟡 Soon |
| 6 | Stripe account (payments) | Free to set up | Week 3 | 🟡 Soon |
| 7 | Resend account (emails) | Free tier | Week 4 | 🟢 Later |
| 8 | Domain name (bizpilot.app/com) | ~$12-30/year | Week 4 | 🟢 Later |
| 9 | Twilio account (SMS) | Free trial credits | Week 6 | 🟢 Later |
| 10 | Google Cloud Console (Calendar API) | Free | Week 6 | 🟢 Later |

---

### Detailed Setup Guide

#### 1. Node.js (Your Machine) — DAY 1
```
What:    JavaScript runtime to build/run the app
Where:   https://nodejs.org
Version: v20 LTS or v22 LTS
Cost:    Free
Action:  Download and install. Verify with: node --version
```

You'll also need **pnpm** (package manager):
```
After Node.js is installed, run: npm install -g pnpm
```

#### 2. GitHub Account — DAY 1
```
What:    Code repository + CI/CD (GitHub Actions)
Where:   https://github.com
Cost:    Free (public or private repos)
Action:  Create account → Create a new private repo called "bizpilot"
```
**What you give me:** Nothing — I'll generate the code, you push it to your repo.

#### 3. Supabase Account — DAY 1 🔴
```
What:    Database (PostgreSQL) + Authentication + File Storage
Where:   https://supabase.com
Cost:    FREE tier (500MB database, 50K auth users, 1GB storage)
         Pro: $25/mo (8GB database, daily backups) — upgrade later
Action:  Sign up → Create new project → Pick region (US East)
```

**What you give me (from Supabase dashboard):**
| Key | Where to Find It | What It Does |
|-----|------------------|-------------|
| `SUPABASE_URL` | Project Settings → API → Project URL | Connects our app to your database |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon/public key | Public client-side access (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key | Server-side admin access (⚠️ KEEP SECRET) |
| `DATABASE_URL` | Project Settings → Database → Connection string | Direct database connection for Prisma |

#### 4. OpenAI API Key — WEEK 3 🟡
```
What:    Powers ALL AI features in BizPilot
Where:   https://platform.openai.com
Cost:    Pay-per-use (see cost breakdown below)
Action:  Sign up → API Keys → Create new secret key
```

**What you give me:**
| Key | What It Does |
|-----|-------------|
| `OPENAI_API_KEY` | sk-xxxxx... — One key powers everything |

**Realistic AI cost for MVP:**

| Phase | Usage | Model | Cost |
|-------|-------|-------|------|
| Development & testing | ~500 API calls | GPT-4o-mini | ~$0.50 |
| Beta (100 users, 1 month) | ~10,000 API calls | GPT-4o-mini | ~$5 |
| Launch (500 users, 1 month) | ~50,000 API calls | GPT-4o-mini | ~$25 |
| Scale (2000 users, 1 month) | ~200,000 API calls | GPT-4o-mini | ~$100 |

**Total AI cost during development: ~$5-10.** It's extremely cheap.

> **Tip:** Load $10 of credits into your OpenAI account. That's more than enough for the entire development phase.

#### 5. Vercel Account — WEEK 1
```
What:    Hosts the web application (zero-config for Next.js)
Where:   https://vercel.com
Cost:    FREE (Hobby). Pro: $20/mo (custom domains, analytics)
Action:  Sign up with GitHub → Connect your bizpilot repo
```

**What you give me:** Nothing — Vercel auto-deploys from GitHub.

#### 6. Stripe Account — WEEK 3
```
What:    Handles ALL money: subscription billing + invoice payments
Where:   https://stripe.com
Cost:    Free to set up. 2.9% + $0.30 per transaction (only when money flows)
Action:  Sign up → Activate test mode → Get API keys
```

**What you give me:**
| Key | What It Does |
|-----|-------------|
| `STRIPE_SECRET_KEY` | Server-side payment processing |
| `STRIPE_PUBLISHABLE_KEY` | Client-side payment forms |
| `STRIPE_WEBHOOK_SECRET` | Verifies webhook events from Stripe |

> **Note:** Stripe has a **test mode** with fake card numbers. No real money during development.

#### 7. Resend Account — WEEK 4
```
What:    Sends transactional emails (invoice sent, reminders, welcome)
Where:   https://resend.com
Cost:    FREE (3,000 emails/month). Pro: $20/mo (50K emails)
Action:  Sign up → Verify domain → Get API key
```

**What you give me:**
| Key | What It Does |
|-----|-------------|
| `RESEND_API_KEY` | re_xxxxx... — Sends emails from your domain |

#### 8. Domain Name — WEEK 4
```
What:    Your app's address (e.g., bizpilot.app)
Where:   Namecheap, Cloudflare, Google Domains
Cost:    $12-30/year
Action:  Buy domain → Point DNS to Vercel
```

#### 9. Twilio Account — WEEK 6
```
What:    Sends SMS (appointment reminders, notifications)
Where:   https://www.twilio.com
Cost:    Free trial ($15 credit). Then ~$0.0079/SMS
Action:  Sign up → Get phone number → Get API keys
```

**What you give me:**
| Key | What It Does |
|-----|-------------|
| `TWILIO_ACCOUNT_SID` | Account identifier |
| `TWILIO_AUTH_TOKEN` | Authentication |
| `TWILIO_PHONE_NUMBER` | The number SMS is sent from |

#### 10. Google Cloud Console — WEEK 6
```
What:    Google Calendar sync for scheduling feature
Where:   https://console.cloud.google.com
Cost:    FREE (Calendar API has generous free tier)
Action:  Create project → Enable Calendar API → Create OAuth credentials
```

**What you give me:**
| Key | What It Does |
|-----|-------------|
| `GOOGLE_CLIENT_ID` | OAuth: "Sign in with Google" + Calendar access |
| `GOOGLE_CLIENT_SECRET` | OAuth secret key |

---

### Complete .env.local File (What It Looks Like)

This is the file where all your keys go. **I'll create the template — you just fill in the values.**

```env
# ============================================
# BizPilot Environment Variables
# ============================================

# --- Supabase (Database + Auth) ---
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
DATABASE_URL=postgresql://postgres:xxxxx@db.xxxxx.supabase.co:5432/postgres

# --- OpenAI (AI Features) ---
OPENAI_API_KEY=sk-xxxxx

# --- Stripe (Payments) ---
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# --- Resend (Email) ---
RESEND_API_KEY=re_xxxxx

# --- Twilio (SMS) — needed in Week 6 ---
# TWILIO_ACCOUNT_SID=ACxxxxx
# TWILIO_AUTH_TOKEN=xxxxx
# TWILIO_PHONE_NUMBER=+1xxxxx

# --- Google OAuth — needed in Week 6 ---
# GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=GOCSPx-xxxxx

# --- App Config ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

### What You Need RIGHT NOW (Day 1) vs Later

```
DAY 1 (to start coding):
═══════════════════════
✅ Node.js v20+ installed
✅ pnpm installed
✅ GitHub account + repo created
✅ Supabase account + project created (4 keys)

WEEK 3 (when we build AI invoicing):
═══════════════════════════════════
✅ OpenAI API key ($10 loaded)
✅ Stripe account (test mode keys)

WEEK 4+ (when we build emails/scheduling):
═══════════════════════════════════════
✅ Resend API key
✅ Domain name
✅ Twilio keys
✅ Google Cloud keys
```

**We can start building TODAY with just Node.js + GitHub + Supabase. Everything else can wait.**

---

## PART 2: THE ROLE OF AI IN BIZPILOT MVP

### AI Is NOT a Gimmick — It's the Core Differentiator

Without AI, BizPilot is just another invoicing + scheduling tool competing with HoneyBook, Dubsado, and QuickBooks. **AI is what makes BizPilot worth $29/month** instead of being yet another generic tool.

Here's exactly where AI is used in the MVP:

---

### 2.1 AI Feature #1: Natural Language Invoice Creation ⭐ (THE Killer Feature)

**What it does:**
```
User types:  "Invoice Sarah at Google $2,500 for website redesign, 
              due in 30 days, with 50% deposit already paid"

AI extracts:
  → Client: Sarah (company: Google)
  → Amount: $2,500
  → Description: Website redesign
  → Due date: April 5, 2026 (30 days from now)
  → Deposit paid: $1,250
  → Balance due: $1,250

Result: Pre-filled professional invoice ready to review and send
```

**How it works technically:**
```
User Input (text)
       │
       ▼
┌──────────────────┐
│  OpenAI GPT-4o-  │    Prompt: "Extract invoice data from this text.
│  mini API Call   │    Return structured JSON with client name,
│                  │    email, items, amounts, due date, etc."
│  Cost: ~$0.001   │
│  Speed: <2 sec   │
└──────────────────┘
       │
       ▼
Structured JSON
       │
       ▼
Pre-filled Invoice Form (user reviews → confirms → sends)
```

**Why this matters:** Creating an invoice in QuickBooks takes 3-5 minutes of clicking through forms. BizPilot does it in **10 seconds** with one sentence. This alone is worth $29/month to a freelancer who sends 10+ invoices/month.

---

### 2.2 AI Feature #2: Smart Payment Reminders

**What it does:**
```
Invoice #1042 is 7 days overdue for client "Tom's Design Studio"

AI generates personalized reminder:
───────────────────────────────────
Subject: Quick reminder — Invoice #1042

Hi Tom,

Hope things are going well at the studio! Just a friendly 
reminder that Invoice #1042 for $1,800 (Logo Package) was 
due on Feb 27. 

You can pay instantly here: [Pay Now link]

No rush if it's already in process — just wanted to make 
sure it didn't slip through the cracks.

Best,
[Business Owner Name]
───────────────────────────────────

Tone: Professional but friendly (not aggressive)
Auto-sent at: Day 7, Day 14, Day 30 overdue
```

**Why this matters:** Chasing late payments is the #1 most uncomfortable task for freelancers. Most just... don't do it, and lose money. AI handles the awkward part automatically.

---

### 2.3 AI Feature #3: AI Daily Briefing

**What it does:**
```
Every morning at 8am, user sees on their dashboard:

┌─────────────────────────────────────────────────────┐
│  🤖 Good morning, Sarah! Here's your day:           │
│                                                       │
│  📅 3 appointments today                              │
│     • 10:00 AM — Design review with Tom               │
│     • 1:30 PM — New client consultation (Jane)        │
│     • 4:00 PM — Weekly check-in with Mike             │
│                                                       │
│  💰 Revenue update                                    │
│     • $4,200 collected this week                      │
│     • $2,800 outstanding (2 invoices)                 │
│     • 1 invoice overdue: Tom's Design — $1,800 (7d)  │
│                                                       │
│  ⚡ Suggested actions                                 │
│     • Send reminder to Tom (7 days overdue)           │
│     • Follow up with Jane after today's consultation  │
│     • Invoice Mike for this week's hours ($650)       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**How it works:**
```
Cron job (every morning at 7am)
       │
       ▼
Gather data:
  - Today's appointments from DB
  - Outstanding invoices from DB  
  - Recent activity from DB
  - Overdue payments from DB
       │
       ▼
Send to OpenAI:
  "Given this business data, generate a concise 
   morning briefing with suggested actions."
       │
       ▼
Store briefing → Show on dashboard when user logs in
```

**Why this matters:** This replaces the 20 minutes a business owner spends every morning checking different apps, spreadsheets, and inboxes to figure out their day.

---

### 2.4 AI Feature #4: AI Email Drafting

**What it does:**
```
User clicks "Draft email" on a client's page.
Selects context: "Follow up after meeting"
Selects tone: "Professional"

AI generates:
───────────────────────────────────
Subject: Great meeting today — next steps

Hi Jane,

Thanks for taking the time to chat today about your 
brand refresh project. I'm excited about the direction 
we discussed.

As we talked about, here's what happens next:
• I'll send over 3 initial concept directions by Friday
• We'll schedule a review call early next week
• Timeline: 4-6 weeks for the full package

I've attached the proposal we discussed — feel free to 
review and sign when ready.

Looking forward to working together!

Best,
[Name]
───────────────────────────────────
```

**The AI knows context** because it has access to:
- Client name and company
- Recent appointments with this client
- Recent invoices
- Past communication notes

---

### 2.5 Where AI is NOT Used (Keeping It Honest)

| Feature | AI Used? | Why Not? |
|---------|----------|----------|
| User authentication | ❌ No | Security-critical — use proven auth libraries |
| Payment processing | ❌ No | Stripe handles this — never let AI touch money |
| Calendar sync | ❌ No | Deterministic API integration — no AI needed |
| Invoice PDF generation | ❌ No | Template-based rendering — no AI needed |
| Client CRUD operations | ❌ No | Standard database operations |
| Dashboard charts | ❌ No | SQL queries + charting library |
| Email sending | ❌ No | Resend API — AI drafts, but sending is deterministic |

**Rule: AI assists humans, never acts alone on financial/critical operations.** Every AI-generated invoice, email, and reminder goes through a human review step before execution.

---

### 2.6 AI Architecture in the MVP

```
┌──────────────────────────────────────────────────┐
│                   AI SERVICE LAYER                 │
│                 (src/lib/ai/)                      │
│                                                    │
│  ┌─────────────────┐  ┌────────────────────────┐  │
│  │ invoice-ai.ts   │  │ email-ai.ts            │  │
│  │                 │  │                        │  │
│  │ • parseInvoice  │  │ • draftEmail           │  │
│  │   from text     │  │ • draftReminder        │  │
│  │ • suggest items │  │ • adjustTone           │  │
│  └─────────────────┘  └────────────────────────┘  │
│                                                    │
│  ┌─────────────────┐  ┌────────────────────────┐  │
│  │ briefing-ai.ts  │  │ ai-client.ts           │  │
│  │                 │  │                        │  │
│  │ • generateDaily │  │ • OpenAI client setup  │  │
│  │   Briefing      │  │ • Token tracking       │  │
│  │ • suggestActions│  │ • Error handling       │  │
│  └─────────────────┘  │ • Rate limiting        │  │
│                        │ • Cost tracking        │  │
│                        └────────────────────────┘  │
└──────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   OpenAI API        │
              │   GPT-4o-mini       │
              │   (primary model)   │
              │                     │
              │   ~$0.001/request   │
              │   ~1-2 sec response │
              └─────────────────────┘
```

### 2.7 AI Cost Per Feature (Per User Per Month)

| AI Feature | Avg Calls/Month | Model | Cost/Call | Monthly Cost |
|-----------|----------------|-------|----------|-------------|
| Invoice generation | 10 invoices | GPT-4o-mini | $0.001 | $0.01 |
| Payment reminders | 5 reminders | GPT-4o-mini | $0.001 | $0.005 |
| Daily briefing | 22 workdays | GPT-4o-mini | $0.003 | $0.07 |
| Email drafting | 15 emails | GPT-4o-mini | $0.002 | $0.03 |
| **Total AI cost per user** | | | | **~$0.12/month** |

**You charge $29/month. AI costs $0.12/month per user. That's 99.6% margin on AI features.**

---

## PART 3: MVP FEATURE PRIORITY (What We Build First)

### Sprint-by-Sprint with AI Integration

```
WEEK 1-2: FOUNDATION (No AI needed yet)
═══════════════════════════════════════
  → Next.js project setup
  → Supabase connection + Auth
  → Database schema + Prisma
  → Basic layout (sidebar, nav)
  → Landing page + waitlist
  
  Keys needed: SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL

WEEK 3-5: AI INVOICING (OpenAI key needed)
═══════════════════════════════════════
  → Invoice CRUD (create, edit, list, delete)
  → ⭐ AI invoice generation from natural language
  → Invoice PDF generation
  → Stripe payment links on invoices
  → Invoice email sending
  → Late payment reminder automation (AI-written)
  
  Keys needed: OPENAI_API_KEY, STRIPE keys, RESEND_API_KEY

WEEK 6-8: SMART SCHEDULING (Google keys needed)
═══════════════════════════════════════
  → Booking page builder
  → Public booking page (clients book time)
  → Google Calendar sync
  → Appointment management
  → SMS + email reminders
  
  Keys needed: GOOGLE_CLIENT_ID, TWILIO keys

WEEK 9-10: CRM + DASHBOARD (No new keys)
═══════════════════════════════════════
  → Client management (add, edit, tags, notes)
  → Client interaction timeline
  → ⭐ AI daily briefing on dashboard
  → Revenue charts + analytics
  → ⭐ AI email drafting

WEEK 11-12: POLISH + LAUNCH (No new keys)
═══════════════════════════════════════
  → Stripe subscription billing ($29/mo)
  → Onboarding wizard
  → Testing + bug fixes
  → Deploy to production
  → Beta launch to waitlist
```

---

## PART 4: YOUR ACTION ITEMS RIGHT NOW

### To start building TODAY, you need to do these 3 things:

| # | Action | Time Needed | Link |
|---|--------|------------|------|
| 1 | Install Node.js v20+ | 5 minutes | https://nodejs.org |
| 2 | Create GitHub account (if needed) + new private repo "bizpilot" | 5 minutes | https://github.com |
| 3 | Create Supabase account + new project (pick US East region) | 10 minutes | https://supabase.com |

**That's it. 20 minutes of setup and we can start building.**

Everything else (OpenAI, Stripe, Resend, Twilio, Google) can be set up when we reach those features in the development timeline.

---

### Ready?

Once you've set up Node.js + GitHub + Supabase and shared the 4 Supabase keys, I'll initialize the entire project and we start coding Phase 0 (Foundation).
