# BizPilot — Development Roadmap & Sprint Plan

**Version:** 1.0  
**Date:** March 6, 2026  
**Total MVP Timeline:** 18 weeks (~4.5 months)  
**Target Launch:** July 2026  

---

## Overview Timeline

```
March 2026                                                    July 2026
│                                                                    │
▼                                                                    ▼
┌──────┬──────┬──────────────┬──────────────┬────────┬──────┬───────┐
│ P0   │ P1   │     P2       │     P3       │  P4    │  P5  │  P6   │
│Found-│Auth +│  Invoicing   │  Scheduling  │Client  │Dash +│Mobile │
│ation │Onbrd │              │              │Mgmt    │ AI   │+ QA   │
│Wk1-2 │Wk3-4 │   Wk 5-8    │   Wk 9-12   │Wk13-14 │15-16 │ 13-18 │
└──────┴──────┴──────────────┴──────────────┴────────┴──────┴───────┘
```

---

## Phase 0: Foundation (Week 1-2)

### Week 1: Project Setup
- [ ] Initialize Turborepo monorepo
- [ ] Set up Next.js 15 app (apps/web)
- [ ] Set up React Native Expo app (apps/mobile)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Set up Prisma + PostgreSQL (Neon)
- [ ] Set up tRPC
- [ ] Configure environment variables (.env)
- [ ] Set up GitHub repository + branch protection
- [ ] Set up CI/CD (GitHub Actions)

### Week 2: Design System & Infrastructure
- [ ] Create design tokens (colors, typography, spacing)
- [ ] Build core UI components (Button, Input, Card, Modal, Table, Form)
- [ ] Set up email templates (React Email + Resend)
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (PostHog)
- [ ] Create database schema + initial migration
- [ ] Seed database with test data
- [ ] Set up file storage (Cloudflare R2)
- [ ] Deploy initial version to Vercel (staging)
- [ ] **Launch landing page + waitlist** (Priority!)

**Deliverables:** Fully configured monorepo, design system, database, CI/CD, landing page live

---

## Phase 1: Authentication & Onboarding (Week 3-4)

### Week 3: Authentication
- [ ] NextAuth.js setup
- [ ] Google OAuth integration
- [ ] Apple Sign-In integration
- [ ] Email + Password authentication
- [ ] Magic link authentication
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Session management + JWT
- [ ] Protected route middleware
- [ ] Auth pages UI (Login, Signup, Forgot Password)

### Week 4: Onboarding Wizard
- [ ] Multi-step onboarding wizard UI
  - Step 1: Business name, type, industry
  - Step 2: Upload logo + set timezone
  - Step 3: Working hours configuration
  - Step 4: Connect Google Calendar (optional)
  - Step 5: Import clients (CSV) or add manually (optional)
- [ ] Business profile creation API
- [ ] Business settings page
- [ ] User profile/account settings
- [ ] Billing settings (Stripe Customer creation)
- [ ] Subscription plan selection
- [ ] Stripe Checkout integration for paid plans

**Deliverables:** Users can sign up, complete onboarding, set up their business

---

## Phase 2: Invoicing System (Week 5-8)

### Week 5: Invoice CRUD
- [ ] Invoice list page (filterable: all, draft, sent, paid, overdue)
- [ ] Invoice creation form
  - Client selection/creation
  - Line items (add, remove, reorder)
  - Tax calculation
  - Notes and terms
- [ ] Invoice detail/view page
- [ ] Invoice edit functionality
- [ ] Invoice deletion (with confirmation)
- [ ] Invoice duplication
- [ ] Auto-incrementing invoice numbers
- [ ] tRPC invoice router (all CRUD endpoints)

### Week 6: AI Invoice Generation
- [ ] Natural language invoice creation
  - Input: "Invoice John $500 for logo design, due net 30"
  - Output: Pre-filled invoice form
- [ ] AI prompt engineering for invoice extraction
- [ ] OpenAI/Claude integration via Vercel AI SDK
- [ ] Streaming AI responses
- [ ] AI action tracking (tokens, cost, latency)
- [ ] AI usage limits per subscription plan

### Week 7: Payments & PDF
- [ ] Stripe Connect setup (for receiving payments)
- [ ] Payment link generation per invoice
- [ ] Public invoice payment page (no auth required)
- [ ] Stripe payment processing (card + ACH)
- [ ] Payment webhook handling (mark invoice as paid)
- [ ] Invoice PDF generation (using React-PDF or Puppeteer)
- [ ] PDF download/print
- [ ] Professional invoice templates (3-5 designs)
- [ ] Template customization (logo, colors, font)

### Week 8: Reminders & Recurring
- [ ] Email sending for invoices (Resend)
- [ ] "Invoice sent" email template
- [ ] Late payment reminder system
  - Auto-send at 7, 14, 30 days overdue
  - AI-crafted reminder messages
  - Configurable reminder schedule
- [ ] Manual reminder sending
- [ ] Recurring invoices
  - Set frequency (weekly, monthly, quarterly)
  - Auto-generate on schedule
  - End date setting
- [ ] Invoice analytics
  - Total sent, paid, overdue
  - Average payment time
  - Revenue by month chart
- [ ] Background job: check overdue invoices hourly

**Deliverables:** Complete invoicing system — create, AI generate, send, track, get paid, reminders

---

## Phase 3: Scheduling System (Week 9-12)

### Week 9: Booking Pages
- [ ] Booking page creation form
  - Title, description, duration
  - Buffer time settings
  - Availability rules
  - Custom questions for bookers
  - Location type (video, phone, in-person)
- [ ] Booking page list/management
- [ ] Booking page activation/deactivation
- [ ] Public booking page (SSR for SEO)
  - Business branding (logo, colors)
  - Available time slots display
  - Date picker
  - Booking form (name, email, phone, answers)
- [ ] Shareable booking link generation

### Week 10: Calendar & Availability
- [ ] Google Calendar OAuth integration
- [ ] Two-way calendar sync
  - Read events → block times
  - Write appointments → create events
- [ ] Availability engine
  - Working hours defined
  - Existing appointments blocked
  - Google Calendar events blocked
  - Buffer time respected
  - Min notice enforced
  - Max advance days enforced
- [ ] Time zone handling
  - Auto-detect client timezone
  - Convert and display correctly
- [ ] Outlook Calendar integration (via Microsoft Graph)

### Week 11: Booking Flow & Management
- [ ] Client booking confirmation email
- [ ] Business notification (new booking)
- [ ] Calendar invite generation (.ics)
- [ ] Appointment management dashboard
  - Today's appointments
  - Week/month calendar view
  - Filter by status
- [ ] Appointment detail page
- [ ] Cancel appointment (by business)
- [ ] Cancel appointment (by client — via token link)
- [ ] Reschedule flow (by client — via token link)
- [ ] Mark as completed / no-show

### Week 12: Reminders & Polish
- [ ] SMS reminder (24hr before) — Twilio
- [ ] Email reminder (24hr before) — Resend
- [ ] SMS reminder (1hr before)
- [ ] Background job: send reminders on schedule
- [ ] No-show tracking and flagging
- [ ] Post-appointment follow-up email
  - "Thank you for your visit"
  - Optional: "Would you like to book again?"
  - Optional: auto-send invoice for the appointment
- [ ] Group booking support (optional, stretch goal)
- [ ] Scheduling analytics
  - Total bookings, cancellation rate, busiest days/times

**Deliverables:** Complete scheduling — booking pages, calendar sync, reminders, management

---

## Phase 4: Client Management (Week 13-14)

### Week 13: Client CRUD & Data
- [ ] Client list page
  - Search by name/email/company
  - Filter by tags
  - Sort by name, revenue, last activity
- [ ] Client creation form
- [ ] Client detail page
  - Contact info
  - Notes (rich text)
  - Tags
- [ ] Client edit/update
- [ ] Client archive (soft delete)
- [ ] CSV import (batch client creation)
- [ ] Client tags system (create, assign, filter)
- [ ] tRPC client router (all endpoints)

### Week 14: Client History & Interactions
- [ ] Client timeline view
  - All interactions in chronological order
  - Invoices sent/paid
  - Appointments booked/completed
  - Emails sent
  - Notes added
- [ ] Quick actions from client page
  - Create invoice for this client
  - Schedule appointment with this client
  - Send email to this client
- [ ] Client revenue tracking (total, this month, last month)
- [ ] Client insights
  - Top clients by revenue
  - New vs. returning
  - At-risk (haven't interacted recently)

**Deliverables:** Full CRM lite — client management with interaction history

---

## Phase 5: Dashboard & AI Features (Week 15-16)

### Week 15: Dashboard
- [ ] Main dashboard page
  - Revenue overview (total, this month, trend chart)
  - Outstanding invoices (amount, count)
  - Today's schedule (upcoming appointments)
  - Recent activity feed
  - Quick action buttons
- [ ] Revenue chart (monthly, last 12 months)
- [ ] Invoice status breakdown (pie chart)
- [ ] Upcoming appointments (next 7 days)
- [ ] Overdue invoices alert banner
- [ ] New clients this month
- [ ] Top clients widget

### Week 16: AI Features & Notifications
- [ ] AI Daily Briefing
  - Auto-generated every morning
  - Summary: appointments, outstanding invoices, tasks
  - Push notification + in-app card
- [ ] AI Email Drafter
  - Context-aware: knows client history
  - Tone selection (professional, friendly, firm)
  - Edit before sending
- [ ] In-app notification system
  - Notification bell + dropdown
  - Real-time updates (WebSocket or polling)
  - Mark as read/unread
- [ ] Notification preferences page
  - Email, SMS, push per notification type
  - Quiet hours
- [ ] Search (global search across invoices, clients, appointments)

**Deliverables:** Beautiful dashboard, AI briefing, notification system, global search

---

## Phase 6: Mobile App & QA (Week 13-18, parallel)

### Week 13-15: Mobile App Development (parallel with Phase 4-5)
- [ ] Expo project configuration
- [ ] Authentication screens (Login, Signup)
- [ ] Business switching (if multiple)
- [ ] Home/Dashboard screen
- [ ] Invoice list + detail screens
- [ ] Quick invoice creation
- [ ] Appointment list + detail screens
- [ ] Client list + detail screens
- [ ] Push notification setup
- [ ] Biometric authentication (Face ID, fingerprint)
- [ ] Pull-to-refresh + offline handling

### Week 16-17: Mobile Polish
- [ ] App icon + splash screen
- [ ] Deep linking (tap notification → go to invoice/appointment)
- [ ] Haptic feedback on actions
- [ ] Bottom navigation
- [ ] Dark mode support
- [ ] Responsive layout testing (phone + tablet)
- [ ] App Store screenshots + preview video

### Week 17-18: QA & Launch Prep
- [ ] End-to-end testing (critical flows)
  - Sign up → onboard → create invoice → send → get paid
  - Create booking page → client books → reminder → complete
  - Create client → tag → view history
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile testing (iOS + Android, various devices)
- [ ] Performance audit (Lighthouse score > 90)
- [ ] Security audit (OWASP top 10 checklist)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Fix critical bugs
- [ ] Beta user feedback incorporation
- [ ] App Store submission (iOS + Android)
- [ ] Production deployment
- [ ] DNS + SSL setup for custom domain
- [ ] Status page setup (Better Uptime)
- [ ] Final documentation review

**Deliverables:** Production-ready web + mobile apps, deployed and tested

---

## Launch Day Checklist

- [ ] Production environment verified
- [ ] Database backups configured
- [ ] Error monitoring active (Sentry)
- [ ] Analytics tracking verified (PostHog)
- [ ] Stripe production keys configured
- [ ] Transactional emails tested (Resend)
- [ ] SMS tested (Twilio)
- [ ] Product Hunt listing prepared
- [ ] Social media posts scheduled
- [ ] PR outreach emails sent
- [ ] Blog post: "Introducing BizPilot" published
- [ ] Support email configured (support@bizpilot.app)
- [ ] Help docs / FAQ published
- [ ] Waitlist notification email sent
- [ ] Team on standby for support

---

## Post-Launch Priorities (Month 6-8)

1. **Stability:** Fix bugs, improve performance based on real usage
2. **Retention:** Analyze churn, improve onboarding completion
3. **AI Bookkeeping (Phase 2):** Bank connection, expense categorization
4. **Cash Flow Predictor (Phase 2):** Revenue forecasting
5. **Client Portal:** Public portal for clients to view invoices/book
6. **Integrations:** QuickBooks, Zapier
7. **Team Features:** Multi-user, roles, permissions
8. **Accountant Dashboard:** Multi-client management

---

## Weekly Development Rhythm

```
Monday:    Sprint planning, review priorities
Tuesday:   Deep development work
Wednesday: Deep development work
Thursday:  Deep development work + code review
Friday:    Testing, bug fixes, deploy to staging
Saturday:  Content creation (blog, social), market research
Sunday:    Rest / light planning for next week
```

---

*This roadmap is aggressive but achievable for a skilled developer working full-time. Adjust timeline if working part-time or with a team.*
