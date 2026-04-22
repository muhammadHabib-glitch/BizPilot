import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

// Cron-safe auth: verify a secret token to prevent unauthorized calls
function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Step 1: Mark invoices as OVERDUE if past due date and still SENT/VIEWED
    const overdueResult = await prisma.invoice.updateMany({
      where: {
        status: { in: ["SENT", "VIEWED"] },
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });

    // Step 2: Find overdue invoices that need a reminder
    // Send reminders at 1 day, 3 days, 7 days, 14 days, 30 days overdue
    const reminderSchedule = [1, 3, 7, 14, 30];
    const maxReminders = reminderSchedule.length;

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: "OVERDUE",
        remindersSent: { lt: maxReminders },
        OR: [
          { nextReminderAt: null },
          { nextReminderAt: { lte: now } },
        ],
      },
      include: {
        client: true,
        business: true,
      },
    });

    let remindersSent = 0;

    for (const invoice of overdueInvoices) {
      // Need a client email to send reminders
      if (!invoice.client?.email) continue;

      const fmt = (cents: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(cents / 100);

      const fmtDate = (d: Date | string) =>
        new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(d));

      const daysOverdue = Math.floor(
        (now.getTime() - new Date(invoice.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const businessName = invoice.business.name;

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px;color:white;">
        <h1 style="margin:0;font-size:22px;font-weight:700;">Payment Reminder</h1>
        <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">from ${businessName}</p>
      </div>
      <div style="padding:32px;">
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
          Hi ${invoice.client.name},
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
          This is a friendly reminder that invoice <strong>${invoice.number}</strong> for <strong>${fmt(invoice.total)}</strong> was due on <strong>${fmtDate(invoice.dueDate)}</strong> and is now <strong>${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue</strong>.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
          <table style="width:100%;font-size:14px;">
            <tr>
              <td style="color:#6b7280;padding:4px 0;">Invoice</td>
              <td style="text-align:right;font-weight:600;color:#111827;">${invoice.number}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:4px 0;">Amount Due</td>
              <td style="text-align:right;font-weight:700;color:#dc2626;font-size:18px;">${fmt(invoice.total)}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:4px 0;">Due Date</td>
              <td style="text-align:right;font-weight:600;color:#111827;">${fmtDate(invoice.dueDate)}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:4px 0;">Days Overdue</td>
              <td style="text-align:right;font-weight:600;color:#dc2626;">${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}</td>
            </tr>
          </table>
        </div>
        <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;">
          Please arrange payment at your earliest convenience. If you&rsquo;ve already paid, please disregard this reminder.
        </p>
      </div>
      <div style="background:#f9fafb;padding:20px 32px;text-align:center;">
        <p style="font-size:13px;color:#9ca3af;margin:0;">
          Sent via <strong>BizPilot</strong> — Smart back-office for small businesses
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

      try {
        const resend = getResend();
        const { error } = await resend.emails.send({
          from: `${businessName} <invoices@${process.env.RESEND_EMAIL_DOMAIN || "resend.dev"}>`,
          to: [invoice.client.email],
          subject: `Payment Reminder: Invoice ${invoice.number} — ${fmt(invoice.total)} overdue`,
          html,
        });

        if (error) {
          console.error(`Failed to send reminder for ${invoice.number}:`, error);
          continue;
        }

        // Calculate next reminder date
        const nextReminderIndex = invoice.remindersSent + 1;
        const nextReminderDays =
          nextReminderIndex < reminderSchedule.length
            ? reminderSchedule[nextReminderIndex]
            : null;

        const nextReminderAt = nextReminderDays
          ? new Date(
              new Date(invoice.dueDate).getTime() +
                nextReminderDays * 24 * 60 * 60 * 1000
            )
          : null;

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            remindersSent: { increment: 1 },
            lastReminderAt: now,
            nextReminderAt,
          },
        });

        remindersSent++;
      } catch (e) {
        console.error(`Error sending reminder for ${invoice.number}:`, e);
      }
    }

    return NextResponse.json({
      markedOverdue: overdueResult.count,
      remindersSent,
      processed: overdueInvoices.length,
    });
  } catch (e) {
    console.error("Cron overdue error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
