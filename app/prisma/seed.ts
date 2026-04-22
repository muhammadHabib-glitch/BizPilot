import { prisma } from "../src/lib/prisma";

async function seed() {
  console.log("Seeding database...");

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: "demo@bizpilot.app" },
    update: {},
    create: {
      email: "demo@bizpilot.app",
      name: "Demo User",
      supabaseId: "demo-supabase-id-for-development",
      provider: "EMAIL",
    },
  });
  console.log(`  User: ${user.email}`);

  // Create a test business
  const business = await prisma.business.upsert({
    where: { slug: "demo-business" },
    update: {},
    create: {
      name: "Demo Business",
      slug: "demo-business",
      email: "hello@demobiz.com",
      phone: "(555) 123-4567",
      industry: "Consulting",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      timezone: "America/New_York",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
      subscription: {
        create: {
          plan: "STARTER",
          status: "TRIALING",
          aiActionsLimit: 100,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });
  console.log(`  Business: ${business.name}`);

  // Create test clients
  const clients = await Promise.all(
    [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "(555) 111-1111",
        company: "Johnson Design Co",
        city: "Los Angeles",
        state: "CA",
      },
      {
        name: "Bob Williams",
        email: "bob@example.com",
        phone: "(555) 222-2222",
        company: "Williams Consulting",
        city: "Chicago",
        state: "IL",
      },
      {
        name: "Carol Davis",
        email: "carol@example.com",
        phone: "(555) 333-3333",
        company: "Davis Photography",
        city: "Miami",
        state: "FL",
      },
    ].map((client) =>
      prisma.client.upsert({
        where: {
          businessId_email: {
            businessId: business.id,
            email: client.email,
          },
        },
        update: {},
        create: {
          businessId: business.id,
          ...client,
        },
      })
    )
  );
  console.log(`  Clients: ${clients.length} created`);

  // Create test invoices
  const invoices = await Promise.all(
    [
      {
        number: "INV-1001",
        clientId: clients[0].id,
        status: "PAID" as const,
        subtotal: 250000,
        total: 250000,
        dueDate: new Date("2026-03-01"),
        paidAt: new Date("2026-02-28"),
      },
      {
        number: "INV-1002",
        clientId: clients[1].id,
        status: "SENT" as const,
        subtotal: 150000,
        total: 150000,
        dueDate: new Date("2026-03-15"),
      },
      {
        number: "INV-1003",
        clientId: clients[2].id,
        status: "DRAFT" as const,
        subtotal: 75000,
        total: 75000,
        dueDate: new Date("2026-03-20"),
      },
    ].map((inv) =>
      prisma.invoice.upsert({
        where: {
          businessId_number: {
            businessId: business.id,
            number: inv.number,
          },
        },
        update: {},
        create: {
          businessId: business.id,
          ...inv,
          items: {
            create: [
              {
                description: `Service for ${inv.number}`,
                quantity: 1,
                unitPrice: inv.subtotal,
                total: inv.subtotal,
              },
            ],
          },
        },
      })
    )
  );
  console.log(`  Invoices: ${invoices.length} created`);

  // Create a booking page
  const bookingPage = await prisma.bookingPage.upsert({
    where: {
      businessId_slug: {
        businessId: business.id,
        slug: "consultation",
      },
    },
    update: {},
    create: {
      businessId: business.id,
      slug: "consultation",
      title: "Free Consultation",
      description: "30-minute intro call to discuss your needs",
      duration: 30,
      bufferAfter: 15,
      isActive: true,
    },
  });
  console.log(`  Booking page: ${bookingPage.title}`);

  console.log("\nSeed complete!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
