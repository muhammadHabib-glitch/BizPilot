import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

function addInterval(date: Date, interval: string): Date {
  const d = new Date(date);
  switch (interval) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
}

export async function POST(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find PAID recurring invoices that don't already have a child invoice
    const paidRecurring = await prisma.invoice.findMany({
      where: {
        isRecurring: true,
        status: "PAID",
        childInvoices: { none: {} },
      },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        business: true,
      },
    });

    let created = 0;

    for (const parent of paidRecurring) {
      const interval = parent.recurringInterval ?? "monthly";
      const newDueDate = addInterval(parent.dueDate, interval);
      const invoiceNumber = `${parent.business.invoicePrefix}-${parent.business.nextInvoiceNo}`;

      await prisma.$transaction(async (tx) => {
        await tx.business.update({
          where: { id: parent.businessId },
          data: { nextInvoiceNo: { increment: 1 } },
        });

        await tx.invoice.create({
          data: {
            businessId: parent.businessId,
            clientId: parent.clientId,
            number: invoiceNumber,
            status: "DRAFT",
            dueDate: newDueDate,
            subtotal: parent.subtotal,
            taxRate: Number(parent.taxRate),
            taxAmount: parent.taxAmount,
            discount: parent.discount,
            total: parent.total,
            currency: parent.currency,
            notes: parent.notes,
            terms: parent.terms,
            isRecurring: true,
            recurringInterval: interval,
            parentInvoiceId: parent.id,
            items: {
              create: parent.items.map((item, index) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                sortOrder: index,
              })),
            },
          },
        });
      });

      created++;
    }

    return NextResponse.json({
      success: true,
      processed: paidRecurring.length,
      created,
    });
  } catch (error) {
    console.error("Recurring invoice cron error:", error);
    return NextResponse.json(
      { error: "Failed to process recurring invoices" },
      { status: 500 }
    );
  }
}
