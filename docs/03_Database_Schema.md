# BizPilot — Database Schema (Prisma)

**Version:** 1.0 (MVP)  
**Date:** March 6, 2026  
**Database:** PostgreSQL (Neon Serverless)  
**ORM:** Prisma  

---

## Complete Prisma Schema

```prisma
// ============================================================
// BizPilot Database Schema
// ============================================================

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [pgVector(map: "vector")]
}

// ============================================================
// ENUMS
// ============================================================

enum AuthProvider {
  EMAIL
  GOOGLE
  APPLE
}

enum UserRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum SubscriptionPlan {
  FREE
  STARTER
  PROFESSIONAL
  BUSINESS
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
  PAUSED
}

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PAID
  OVERDUE
  CANCELED
  REFUNDED
}

enum AppointmentStatus {
  CONFIRMED
  PENDING
  CANCELED
  COMPLETED
  NO_SHOW
  RESCHEDULED
}

enum NotificationType {
  INVOICE_SENT
  INVOICE_PAID
  INVOICE_OVERDUE
  PAYMENT_RECEIVED
  APPOINTMENT_BOOKED
  APPOINTMENT_REMINDER
  APPOINTMENT_CANCELED
  CLIENT_CREATED
  AI_BRIEFING
  SYSTEM
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
  IN_APP
}

enum Currency {
  USD
  EUR
  GBP
  CAD
  AUD
}

enum AIActionType {
  INVOICE_GENERATE
  EMAIL_DRAFT
  DAILY_BRIEFING
  SMART_REPLY
  TIME_SUGGEST
  CHAT
}

// ============================================================
// USER & AUTHENTICATION
// ============================================================

model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String?
  avatar        String?
  passwordHash  String?
  provider      AuthProvider  @default(EMAIL)
  providerId    String?
  emailVerified DateTime?
  lastLoginAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  memberships   BusinessMember[]
  sessions      Session[]
  accounts      Account[]
  notifications Notification[]

  @@index([email])
  @@index([provider, providerId])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================================
// BUSINESS & TEAM
// ============================================================

model Business {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique          // URL-friendly name
  logo         String?                   // S3 URL
  email        String?                   // Business contact email
  phone        String?
  website      String?
  industry     String?
  address      String?
  city         String?
  state        String?
  zipCode      String?
  country      String   @default("US")
  timezone     String   @default("America/New_York")
  currency     Currency @default(USD)
  taxRate      Decimal? @default(0)      // Default tax rate %
  invoicePrefix String  @default("INV")  // Invoice number prefix
  nextInvoiceNo Int     @default(1001)   // Next invoice number
  
  // Working Hours (JSON)
  workingHours Json?    // { mon: { start: "09:00", end: "17:00" }, ... }
  
  // Stripe
  stripeCustomerId     String?  @unique
  stripeConnectId      String?  @unique  // For receiving payments
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  members       BusinessMember[]
  subscription  Subscription?
  clients       Client[]
  invoices      Invoice[]
  bookingPages  BookingPage[]
  appointments  Appointment[]
  notifications Notification[]
  aiActions     AIAction[]
  activityLogs  ActivityLog[]

  @@index([slug])
  @@index([stripeCustomerId])
}

model BusinessMember {
  id         String   @id @default(cuid())
  businessId String
  userId     String
  role       UserRole @default(MEMBER)
  joinedAt   DateTime @default(now())

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([businessId, userId])
  @@index([businessId])
  @@index([userId])
}

// ============================================================
// SUBSCRIPTION & BILLING
// ============================================================

model Subscription {
  id                  String             @id @default(cuid())
  businessId          String             @unique
  plan                SubscriptionPlan   @default(FREE)
  status              SubscriptionStatus @default(TRIALING)
  stripeSubscriptionId String?           @unique
  stripePriceId       String?
  
  // Limits
  aiActionsUsed       Int                @default(0)
  aiActionsLimit      Int                @default(100)   // per month
  teamMembersLimit    Int                @default(1)
  
  // Dates
  trialEndsAt         DateTime?
  currentPeriodStart  DateTime?
  currentPeriodEnd    DateTime?
  canceledAt          DateTime?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@index([stripeSubscriptionId])
}

// ============================================================
// CLIENT MANAGEMENT
// ============================================================

model Client {
  id         String   @id @default(cuid())
  businessId String
  
  // Contact Info
  name       String
  email      String?
  phone      String?
  company    String?
  
  // Address
  address    String?
  city       String?
  state      String?
  zipCode    String?
  country    String?
  
  // Metadata
  tags       String[] @default([])
  notes      String?  @db.Text
  source     String?  // How they found the business
  
  // Computed (denormalized for performance)
  totalRevenue    Decimal  @default(0)
  totalInvoices   Int      @default(0)
  lastInvoiceDate DateTime?
  lastAppointment DateTime?
  
  isArchived Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  business     Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  invoices     Invoice[]
  appointments Appointment[]

  @@unique([businessId, email])
  @@index([businessId])
  @@index([businessId, name])
  @@index([businessId, email])
  @@index([businessId, tags])
}

// ============================================================
// INVOICING
// ============================================================

model Invoice {
  id          String        @id @default(cuid())
  businessId  String
  clientId    String?
  
  // Invoice Details
  number      String                    // e.g., "INV-1001"
  status      InvoiceStatus @default(DRAFT)
  
  // Dates
  issueDate   DateTime      @default(now())
  dueDate     DateTime
  paidAt      DateTime?
  sentAt      DateTime?
  viewedAt    DateTime?
  
  // Amounts (stored in cents to avoid floating point issues)
  subtotal    Int           @default(0)  // in cents
  taxRate     Decimal       @default(0)
  taxAmount   Int           @default(0)  // in cents
  discount    Int           @default(0)  // in cents
  total       Int           @default(0)  // in cents
  currency    Currency      @default(USD)
  
  // Payment
  stripePaymentIntentId String?
  stripeInvoiceUrl      String?
  paymentMethod         String?         // "card", "ach", "manual"
  
  // Content
  notes       String?      @db.Text      // Notes to client
  terms       String?      @db.Text      // Payment terms
  footer      String?                     // Footer text
  
  // PDF
  pdfUrl      String?                     // S3 URL to generated PDF
  
  // Reminders
  remindersSent    Int      @default(0)
  lastReminderAt   DateTime?
  nextReminderAt   DateTime?
  
  // Template
  templateId  String?
  
  // Recurring
  isRecurring       Boolean   @default(false)
  recurringInterval String?   // "weekly", "monthly", "quarterly"
  recurringEndDate  DateTime?
  parentInvoiceId   String?   // Link to original if recurring copy
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relations
  business    Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  client      Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)
  items       InvoiceItem[]
  parentInvoice Invoice?    @relation("RecurringInvoice", fields: [parentInvoiceId], references: [id])
  childInvoices Invoice[]   @relation("RecurringInvoice")

  @@unique([businessId, number])
  @@index([businessId])
  @@index([businessId, status])
  @@index([businessId, clientId])
  @@index([businessId, dueDate])
  @@index([status, nextReminderAt])
  @@index([stripePaymentIntentId])
}

model InvoiceItem {
  id          String  @id @default(cuid())
  invoiceId   String
  
  description String
  quantity    Decimal @default(1)
  unitPrice   Int                       // in cents
  total       Int                       // in cents (quantity * unitPrice)
  sortOrder   Int     @default(0)
  
  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
}

model InvoiceTemplate {
  id          String  @id @default(cuid())
  businessId  String?                   // null = system template
  name        String
  html        String  @db.Text          // Template HTML
  css         String? @db.Text          // Custom CSS
  isDefault   Boolean @default(false)
  createdAt   DateTime @default(now())

  @@index([businessId])
}

// ============================================================
// SCHEDULING
// ============================================================

model BookingPage {
  id          String   @id @default(cuid())
  businessId  String
  
  // Page Details
  slug        String                    // Public URL: bizpilot.app/book/{slug}
  title       String                    // "30-min Consultation"
  description String?  @db.Text
  
  // Scheduling Rules
  duration    Int      @default(30)     // minutes
  bufferBefore Int     @default(0)      // minutes before appointment
  bufferAfter  Int     @default(15)     // minutes after appointment
  minNotice    Int     @default(60)     // minimum minutes before booking
  maxAdvance   Int     @default(30)     // max days in advance
  
  // Availability override (JSON)
  // If null, uses business working hours
  availability Json?   // { mon: [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }] }
  
  // Customization
  color       String   @default("#2563eb")
  showLogo    Boolean  @default(true)
  requirePhone Boolean @default(false)
  
  // Questions for booker
  questions   Json?    // [{ question: "What's this about?", required: true }]
  
  // Limits
  maxPerDay    Int?                     // Max appointments per day
  
  // Location
  locationType String  @default("video") // "video", "phone", "in_person", "custom"
  locationDetails String?               // Address, Zoom link, etc.
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  business     Business      @relation(fields: [businessId], references: [id], onDelete: Cascade)
  appointments Appointment[]

  @@unique([businessId, slug])
  @@index([businessId])
  @@index([slug])
}

model Appointment {
  id            String            @id @default(cuid())
  businessId    String
  bookingPageId String?
  clientId      String?
  
  // Time
  startTime     DateTime
  endTime       DateTime
  timezone      String            @default("America/New_York")
  
  // Status
  status        AppointmentStatus @default(CONFIRMED)
  
  // Details
  title         String?
  notes         String?           @db.Text
  answers       Json?             // Answers to booking page questions
  
  // Client info (for non-registered clients)
  clientName    String?
  clientEmail   String?
  clientPhone   String?
  
  // Calendar Sync
  googleEventId   String?
  outlookEventId  String?
  
  // Reminders
  reminder24hSent Boolean @default(false)
  reminder1hSent  Boolean @default(false)
  
  // Cancellation / Reschedule
  cancelToken    String?  @unique @default(cuid()) // Token for client to cancel
  canceledAt     DateTime?
  cancelReason   String?
  rescheduledFrom DateTime?        // Original time if rescheduled
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  business    Business     @relation(fields: [businessId], references: [id], onDelete: Cascade)
  bookingPage BookingPage? @relation(fields: [bookingPageId], references: [id], onDelete: SetNull)
  client      Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)

  @@index([businessId])
  @@index([businessId, startTime])
  @@index([businessId, status])
  @@index([bookingPageId, startTime])
  @@index([clientId])
  @@index([cancelToken])
  @@index([startTime, reminder24hSent])
  @@index([startTime, reminder1hSent])
}

// ============================================================
// NOTIFICATIONS
// ============================================================

model Notification {
  id         String              @id @default(cuid())
  userId     String?
  businessId String
  
  type       NotificationType
  channel    NotificationChannel @default(IN_APP)
  
  subject    String?
  body       String              @db.Text
  metadata   Json?               // Additional data (invoiceId, appointmentId, etc.)
  
  sentAt     DateTime?
  readAt     DateTime?
  failedAt   DateTime?
  failReason String?
  
  createdAt  DateTime            @default(now())

  user     User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@index([userId, readAt])
  @@index([businessId])
  @@index([type, sentAt])
}

// ============================================================
// AI TRACKING
// ============================================================

model AIAction {
  id         String       @id @default(cuid())
  businessId String
  
  type       AIActionType
  prompt     String       @db.Text
  result     String?      @db.Text
  model      String       @default("gpt-4o")
  
  // Usage
  promptTokens     Int    @default(0)
  completionTokens Int    @default(0)
  totalTokens      Int    @default(0)
  costCents        Int    @default(0)   // Cost in cents
  latencyMs        Int    @default(0)   // Response time
  
  // Context
  entityType String?      // "invoice", "appointment", "client"
  entityId   String?      // Related entity ID
  
  createdAt  DateTime     @default(now())

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@index([businessId])
  @@index([businessId, type])
  @@index([businessId, createdAt])
}

// ============================================================
// ACTIVITY LOG (AUDIT TRAIL)
// ============================================================

model ActivityLog {
  id         String   @id @default(cuid())
  businessId String
  userId     String?  // Who performed the action
  
  entityType String   // "invoice", "appointment", "client", "booking_page"
  entityId   String   // ID of the entity
  action     String   // "created", "updated", "sent", "paid", "deleted"
  
  description String  // Human readable: "Invoice INV-1001 sent to John"
  metadata    Json?   // Changed fields, old values, etc.
  
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@index([businessId, createdAt])
  @@index([businessId, entityType, entityId])
  @@index([userId])
}

// ============================================================
// WAITLIST (Pre-launch)
// ============================================================

model WaitlistEntry {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  businessType String?
  referralCode String?  @unique @default(cuid())
  referredBy   String?  // Referral code of who referred them
  position     Int      @default(autoincrement())
  createdAt    DateTime @default(now())

  @@index([email])
  @@index([referralCode])
}
```

---

## Entity Relationship Summary

```
User (1) ──── (N) BusinessMember (N) ──── (1) Business
                                                │
                    ┌───────────────┬────────────┼────────────┐
                    │               │            │            │
                    ▼               ▼            ▼            ▼
                 Client          Invoice     BookingPage   Subscription
                    │               │            │
                    │               ▼            ▼
                    │          InvoiceItem   Appointment
                    │                            │
                    └────────────────────────────┘
                         (Client can be linked to 
                          Invoices & Appointments)
```

---

## Key Design Decisions

1. **Money in cents (Int):** All monetary values stored as integers in cents to avoid floating-point precision issues. Convert to dollars in application layer.

2. **Multi-tenant by businessId:** Every business-owned entity has a `businessId` foreign key. Prisma middleware will enforce tenant isolation.

3. **Soft delete via isArchived:** Clients use `isArchived` instead of hard delete to preserve invoice/appointment history.

4. **Denormalized counters:** `Client.totalRevenue` and `Client.totalInvoices` are denormalized for dashboard performance. Updated via Prisma middleware on invoice changes.

5. **JSON for flexible fields:** `workingHours`, `availability`, `questions`, `answers`, `metadata` use JSON for flexibility without schema migrations.

6. **Cancel tokens:** Appointments have unique cancel tokens so clients can cancel/reschedule via email link without authentication.

7. **Composite unique constraints:** Prevent duplicate invoice numbers per business, duplicate client emails per business, etc.

8. **Strategic indexing:** Indexes on commonly queried fields and compound indexes for dashboard queries.

---

*This schema supports the full MVP feature set and is designed to scale to Phase 2 (bookkeeping, expenses) with minimal breaking changes.*
