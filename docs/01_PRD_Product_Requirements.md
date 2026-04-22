# BizPilot — Product Requirements Document (PRD)

**Product Name:** BizPilot  
**Tagline:** "Your AI-Powered Back-Office, On Autopilot"  
**Version:** 1.0 (MVP)  
**Date:** March 6, 2026  
**Target Market:** United States Small Businesses  

---

## 1. Vision & Mission

### Vision
Become the #1 AI-powered operating system for small businesses in America — replacing 5-8 fragmented tools with one intelligent platform that runs the back-office automatically.

### Mission
Save small business owners 10+ hours per week by automating invoicing, scheduling, client communication, bookkeeping, and cash flow management through AI.

### One-Liner Pitch
"BizPilot is like having a full-time office manager powered by AI — for $29/month instead of $3,000/month."

---

## 2. Target Users & Personas

### Primary Persona: "Solo Sarah"
| Attribute | Detail |
|-----------|--------|
| **Role** | Solo business owner / Freelancer |
| **Business Type** | Consulting, coaching, design, photography, trades |
| **Revenue** | $50K–$500K/year |
| **Team Size** | 1 person (herself) |
| **Age** | 28–45 |
| **Tech Comfort** | Medium — uses smartphone daily, comfortable with apps |
| **Pain Points** | Spends 15+ hrs/week on admin, forgets to send invoices, loses track of clients, dreads bookkeeping |
| **Current Tools** | QuickBooks + Google Calendar + Excel + Gmail + Venmo (messy) |
| **Willingness to Pay** | $29–$79/month if it truly saves time |

### Secondary Persona: "Growing Gary"
| Attribute | Detail |
|-----------|--------|
| **Role** | Small business owner with small team |
| **Business Type** | Agency, restaurant, salon, contractor, retail |
| **Revenue** | $200K–$2M/year |
| **Team Size** | 2–15 employees |
| **Age** | 30–55 |
| **Tech Comfort** | Medium-High |
| **Pain Points** | Managing team schedules, chasing client payments, no visibility into cash flow, tax season is a nightmare |
| **Current Tools** | QuickBooks + Calendly + HubSpot + Mailchimp + Slack (expensive stack) |
| **Willingness to Pay** | $79–$149/month to consolidate tools |

### Tertiary Persona: "Accountant Anna"
| Attribute | Detail |
|-----------|--------|
| **Role** | Bookkeeper / Accountant managing multiple small business clients |
| **Pain Points** | Clients send messy receipts, no standardized reporting, chasing clients for data |
| **Value Prop** | Multi-client dashboard, auto-categorized expenses, tax-ready reports |
| **Willingness to Pay** | $149/month for multi-client management |

---

## 3. Core Features (MVP — Phase 1)

### 3.1 AI Invoice Generator
**Priority:** P0 (Must Have)

| Requirement | Detail |
|-------------|--------|
| Create invoices from natural language | "Invoice John $500 for logo design, due in 30 days" |
| Professional templates | 5+ customizable invoice templates with business branding |
| Auto-send via email | One-click send with professional email template |
| Payment integration | Accept payments via Stripe (credit card, ACH) |
| Payment tracking | Auto-detect when paid, mark as complete |
| Late payment reminders | AI auto-sends reminder at 7, 14, 30 days overdue |
| Recurring invoices | Set up weekly/monthly recurring invoices |
| Multi-currency | Support USD, EUR, GBP, CAD for international clients |
| PDF export | Download/print professional PDF invoices |
| Invoice analytics | Total sent, paid, overdue, average payment time |

**User Stories:**
- As a business owner, I want to create an invoice in 30 seconds by typing or speaking what I need
- As a business owner, I want to automatically chase late payments without feeling awkward
- As a business owner, I want to know exactly how much money is owed to me at any time

---

### 3.2 Smart Scheduling
**Priority:** P0 (Must Have)

| Requirement | Detail |
|-------------|--------|
| Booking page | Public shareable link for clients to book appointments |
| Calendar sync | Two-way sync with Google Calendar, Outlook, Apple Calendar |
| AI time suggestions | AI suggests optimal meeting times based on patterns |
| Auto-reminders | SMS + email reminders 24hr and 1hr before appointments |
| Rescheduling | Clients can reschedule within rules (e.g., 24hr notice) |
| Buffer time | Auto-add buffer between meetings (configurable) |
| Availability rules | Set working hours, lunch breaks, blocked days |
| Time zone detection | Auto-detect client time zone |
| Group scheduling | Allow multiple attendees per slot |
| No-show tracking | Track and flag frequent no-show clients |

**User Stories:**
- As a business owner, I want clients to book time with me without 10 back-and-forth emails
- As a business owner, I want automatic reminders so clients don't no-show
- As a business owner, I want my calendar to stay in sync everywhere

---

### 3.3 Client Communication AI
**Priority:** P1 (Should Have)

| Requirement | Detail |
|-------------|--------|
| AI email drafts | AI drafts professional responses to client emails |
| Auto-responses | Set up AI auto-replies for common inquiries |
| SMS messaging | Send appointment confirmations, reminders, follow-ups |
| Email templates | Pre-built templates for quotes, follow-ups, thank-yous |
| Contact management (Basic CRM) | Store client info, notes, history, tags |
| Client timeline | See all interactions with a client in one place |
| Broadcast messages | Send updates to all clients or tagged groups |
| AI tone adjustment | Professional, friendly, formal, casual tone options |

**User Stories:**
- As a business owner, I want AI to draft replies so I respond faster to clients
- As a business owner, I want to see my entire history with a client in one place
- As a business owner, I want to follow up with clients automatically after a service

---

### 3.4 Dashboard & Analytics
**Priority:** P0 (Must Have)

| Requirement | Detail |
|-------------|--------|
| Revenue overview | Total revenue, monthly trends, growth rate |
| Outstanding invoices | Total owed, overdue amounts, aging report |
| Upcoming schedule | Today's appointments, this week's calendar |
| Client insights | Top clients by revenue, new vs. returning |
| AI daily briefing | Morning summary: "You have 3 appointments, $2,400 outstanding, 1 invoice overdue" |
| Quick actions | One-tap: create invoice, schedule meeting, send message |
| Mobile-optimized | Full dashboard on mobile app |

---

## 4. Features — Phase 2 (Post-MVP, Month 4-6)

### 4.1 AI Cash Flow Predictor
- 90-day cash flow forecast based on invoices, recurring revenue, historical patterns
- Alerts: "Warning: You may have a cash shortfall in 3 weeks"
- Scenario planning: "If Client X pays late, here's the impact"

### 4.2 AI Bookkeeping
- Connect bank account (Plaid API)
- Auto-categorize expenses (AI learns your patterns)
- Receipt scanning (photo → auto-categorized expense)
- Profit & Loss statements
- Tax-ready reports (Schedule C, quarterly estimates)
- Export to QuickBooks/Xero for accountants

### 4.3 Team Management
- Add team members with role-based access
- Team scheduling and shift management
- Task assignment and tracking
- Team performance analytics

### 4.4 Client Portal
- Branded portal where clients can:
  - View and pay invoices
  - Book appointments
  - Access shared documents
  - Message the business

---

## 5. Features — Phase 3 (Month 7-12)

### 5.1 AI Marketing Assistant
- Social media post drafts
- Email marketing campaigns
- Review request automation
- SEO suggestions for Google Business Profile

### 5.2 Proposals & Contracts
- AI-generated proposals from conversation context
- Digital contract signing (e-signature)
- Auto-convert accepted proposal → invoice

### 5.3 Integrations Marketplace
- QuickBooks, Xero, FreshBooks
- Zapier, Make (custom workflows)
- Slack, Teams
- Google Workspace, Microsoft 365
- Shopify, Square, PayPal

### 5.4 AI Business Advisor
- Monthly business health report
- Revenue growth recommendations
- Pricing optimization suggestions
- Industry benchmarking

---

## 6. Non-Functional Requirements

### Performance
| Metric | Target |
|--------|--------|
| Page load time | < 2 seconds |
| API response time | < 500ms (95th percentile) |
| Invoice generation | < 3 seconds |
| AI response time | < 5 seconds |
| Uptime | 99.9% |

### Security
| Requirement | Implementation |
|-------------|---------------|
| Data encryption | AES-256 at rest, TLS 1.3 in transit |
| Authentication | JWT + OAuth 2.0, MFA support |
| PCI Compliance | Via Stripe (no raw card data stored) |
| SOC 2 readiness | Logging, access controls, audit trails |
| Data residency | US data centers (AWS us-east-1) |
| GDPR/CCPA | Data deletion, export, consent management |

### Scalability
| Metric | Target |
|--------|--------|
| Concurrent users | 10,000+ |
| Database | Auto-scaling PostgreSQL |
| File storage | S3 with CDN |
| API rate limiting | 1000 req/min per user |

---

## 7. Pricing Strategy

### Tier 1: Starter — $29/month ($290/year — save 17%)
- Unlimited invoices + payment tracking
- Smart scheduling (1 booking page)
- 100 AI actions/month (drafts, auto-replies)
- Basic dashboard & analytics
- Email + SMS reminders
- 1 user

### Tier 2: Professional — $79/month ($790/year — save 17%)
- Everything in Starter
- Unlimited AI actions
- Client Communication AI (auto-responses, broadcasts)
- Cash flow predictor
- Receipt scanning + expense tracking
- Client portal
- 3 users
- Priority support

### Tier 3: Business — $149/month ($1,490/year — save 17%)
- Everything in Professional
- AI Bookkeeping + tax reports
- Team management (up to 15 users)
- Advanced analytics + AI business advisor
- Custom branding
- API access
- Dedicated account manager

### Enterprise: Custom pricing
- Unlimited users
- Custom integrations
- SLA guarantees
- On-boarding support

### Free Trial
- 14-day free trial of Professional plan
- No credit card required
- Guided onboarding wizard

---

## 8. Success Metrics (KPIs)

### Product Metrics
| KPI | Target (Year 1) |
|-----|-----------------|
| Monthly Active Users (MAU) | 10,000+ |
| Paid Subscribers | 2,000–4,000 |
| Monthly Recurring Revenue (MRR) | $80K–$300K |
| Annual Recurring Revenue (ARR) | $1M–$3.6M |
| Churn Rate (Monthly) | < 5% |
| Net Promoter Score (NPS) | > 50 |

### Engagement Metrics
| KPI | Target |
|-----|--------|
| Invoices sent per user/month | 8+ |
| Appointments booked per user/month | 15+ |
| AI features used per user/week | 10+ |
| Daily active users / MAU | > 40% |
| Time saved per user/week | 10+ hours |

### Business Metrics
| KPI | Target (Year 1) |
|-----|-----------------|
| Customer Acquisition Cost (CAC) | < $150 |
| Lifetime Value (LTV) | > $1,500 |
| LTV:CAC Ratio | > 10:1 |
| Payback Period | < 3 months |
| Gross Margin | > 80% |

---

## 9. Competitive Landscape

| Competitor | Strength | Weakness | BizPilot Advantage |
|-----------|----------|----------|-------------------|
| **QuickBooks** | Market leader in accounting | No scheduling, no AI, complex UI | All-in-one + AI simplicity |
| **Calendly** | Best-in-class scheduling | ONLY does scheduling | Scheduling + invoicing + AI |
| **HubSpot** | Powerful CRM | Too complex & expensive for SMBs ($800+/mo) | Simple, affordable, AI-first |
| **FreshBooks** | Good invoicing | Weak scheduling, no AI | AI automation across all features |
| **Honeybook** | Good for creatives | Limited AI, niche focus | Broader market + superior AI |
| **Wave** | Free accounting | No scheduling, no AI, limited features | Full suite + AI differentiator |
| **Dubsado** | Good workflows | Complex setup, no AI | Zero-setup AI automation |

### Our Unfair Advantage
1. **AI-First:** Every feature is AI-powered — competitors are bolting AI onto legacy products
2. **All-in-One:** Replace 5-8 tools with one platform
3. **Simplicity:** Set up in 5 minutes, not 5 hours
4. **Price:** $29-149/mo vs. $200-800/mo for equivalent tool stack
5. **Speed:** AI makes every action 10x faster

---

## 10. User Flows (Key Journeys)

### Onboarding Flow (< 5 minutes)
```
Sign Up (email/Google/Apple)
→ Business Setup Wizard
  → Business name, type, logo
  → Connect calendar (Google/Outlook)
  → Set working hours
  → Import existing clients (CSV or manual)
→ First Invoice (guided)
  → AI helps create first invoice
→ Booking Page (auto-generated)
  → Share link with clients
→ Dashboard (ready to go!)
```

### Invoice Creation Flow
```
Dashboard → "New Invoice" (or type/speak command)
→ AI auto-fills based on client history
→ Add/edit line items
→ Preview → Send via email
→ Track: Sent → Viewed → Paid
→ Auto-reminder if overdue
```

### Client Booking Flow
```
Client receives booking link
→ Sees available time slots
→ Selects date/time
→ Fills in details (name, email, notes)
→ Confirmation email + calendar invite (both parties)
→ Auto-reminders (24hr, 1hr before)
→ Post-appointment: auto-follow-up + invoice option
```

---

## 11. MVP Scope Definition

### In Scope (MVP — 4 months)
- [ ] User authentication (email, Google, Apple)
- [ ] Business profile setup wizard
- [ ] AI Invoice Generator (create, send, track, reminders)
- [ ] Payment processing (Stripe)
- [ ] Smart Scheduling (booking page, calendar sync, reminders)
- [ ] Basic Client Management (contacts, notes, history)
- [ ] Dashboard with key metrics
- [ ] AI daily briefing
- [ ] Email notifications
- [ ] SMS notifications (Twilio)
- [ ] Mobile app (iOS + Android)
- [ ] Web app (responsive dashboard)
- [ ] Landing page + marketing site

### Out of Scope (MVP)
- Bookkeeping / expense tracking
- Cash flow prediction
- Team management
- Client portal
- Integrations (except calendar)
- Marketing tools
- Proposals / contracts

---

## 12. Timeline — MVP Development

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 0: Foundation** | Week 1-2 | Project setup, CI/CD, design system, database schema |
| **Phase 1: Auth + Onboarding** | Week 3-4 | Sign up, login, business profile, onboarding wizard |
| **Phase 2: Invoicing** | Week 5-8 | Invoice CRUD, AI generation, templates, payments, reminders |
| **Phase 3: Scheduling** | Week 9-12 | Booking pages, calendar sync, availability, reminders |
| **Phase 4: Client Management** | Week 13-14 | Contacts, notes, history timeline, tags |
| **Phase 5: Dashboard + AI** | Week 15-16 | Analytics dashboard, AI briefing, quick actions |
| **Phase 6: Mobile App** | Week 13-18 | iOS + Android app (parallel with Phase 4-5) |
| **Phase 7: Testing + Launch** | Week 17-18 | QA, beta testing, landing page, launch |

**Total: ~18 weeks (4.5 months)**

---

*This PRD is a living document and will be updated as we learn from user feedback during beta testing.*
