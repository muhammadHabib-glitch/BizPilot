import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId } = body as { invoiceId: string };

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Missing invoiceId" },
        { status: 400 }
      );
    }

    const membership = await prisma.businessMember.findFirst({
      where: { user: { supabaseId: user.id } },
      select: { businessId: true },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "No business found" },
        { status: 404 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, businessId: membership.businessId },
      include: { client: true },
    });
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (!["SENT", "VIEWED", "OVERDUE"].includes(invoice.status)) {
      return NextResponse.json(
        { error: "Reminders can only be sent for sent, viewed, or overdue invoices" },
        { status: 400 }
      );
    }

    if (!invoice.client?.email) {
      return NextResponse.json(
        { error: "Client has no email address" },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: membership.businessId },
    });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

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

    const now = new Date();
    const isOverdue = new Date(invoice.dueDate) < now;
    const daysOverdue = isOverdue
      ? Math.floor(
          (now.getTime() - new Date(invoice.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const subjectLine = isOverdue
      ? `Payment Reminder: Invoice ${invoice.number} — ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue`
      : `Reminder: Invoice ${invoice.number} — ${fmt(invoice.total)} due ${fmtDate(invoice.dueDate)}`;

    const urgencyBanner = isOverdue
      ? `<div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px;color:white;">
          <h1 style="margin:0;font-size:22px;font-weight:700;">Payment Reminder</h1>
          <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">from ${business.name}</p>
        </div>`
      : `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;color:white;">
          <h1 style="margin:0;font-size:22px;font-weight:700;">Friendly Reminder</h1>
          <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">from ${business.name}</p>
        </div>`;

    const statusColor = isOverdue ? "#dc2626" : "#d97706";
    const statusBg = isOverdue ? "#fef2f2" : "#fffbeb";
    const statusBorder = isOverdue ? "#fecaca" : "#fde68a";
    const overdueLabel = isOverdue
      ? `<tr>
          <td style="color:#6b7280;padding:4px 0;">Days Overdue</td>
          <td style="text-align:right;font-weight:600;color:${statusColor};">${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}</td>
        </tr>`
      : "";

    const message = isOverdue
      ? `This is a friendly reminder that invoice <strong>${invoice.number}</strong> for <strong>${fmt(invoice.total)}</strong> was due on <strong>${fmtDate(invoice.dueDate)}</strong> and is now <strong>${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue</strong>.`
      : `This is a friendly reminder that invoice <strong>${invoice.number}</strong> for <strong>${fmt(invoice.total)}</strong> is due on <strong>${fmtDate(invoice.dueDate)}</strong>.`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      ${urgencyBanner}
      <div style="padding:32px;">
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
          Hi ${invoice.client.name},
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
          ${message}
        </p>
        <div style="background:${statusBg};border:1px solid ${statusBorder};border-radius:8px;padding:16px;margin-bottom:24px;">
          <table style="width:100%;font-size:14px;">
            <tr>
              <td style="color:#6b7280;padding:4px 0;">Invoice</td>
              <td style="text-align:right;font-weight:600;color:#111827;">${invoice.number}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:4px 0;">Amount Due</td>
              <td style="text-align:right;font-weight:700;color:${statusColor};font-size:18px;">${fmt(invoice.total)}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;padding:4px 0;">Due Date</td>
              <td style="text-align:right;font-weight:600;color:#111827;">${fmtDate(invoice.dueDate)}</td>
            </tr>
            ${overdueLabel}
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

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: `${business.name} <invoices@${process.env.RESEND_EMAIL_DOMAIN || "resend.dev"}>`,
      to: [invoice.client.email],
      subject: subjectLine,
      html,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to send reminder" },
        { status: 500 }
      );
    }

    // Update reminder tracking
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        remindersSent: { increment: 1 },
        lastReminderAt: now,
      },
    });

    // Mark as overdue if past due and still SENT/VIEWED
    if (isOverdue && invoice.status !== "OVERDUE") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reminder send error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
