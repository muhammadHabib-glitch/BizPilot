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
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId, to, message } = body as {
      invoiceId: string;
      to: string;
      message?: string;
    };

    if (!invoiceId || !to) {
      return NextResponse.json(
        { error: "Missing invoiceId or recipient email" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Get business membership
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

    // Get invoice with details
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, businessId: membership.businessId },
      include: {
        client: true,
        items: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: membership.businessId },
    });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Format currency
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

    // Build line items HTML
    const typedItems = invoice.items as Array<{ description: string; quantity: unknown; unitPrice: number; total: number }>;
    const itemsHtml = typedItems
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#374151;">${item.description}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;color:#6b7280;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;color:#6b7280;">${fmt(item.unitPrice)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;color:#111827;">${fmt(item.total)}</td>
        </tr>`
      )
      .join("");

    const taxHtml =
      Number(invoice.taxRate) > 0
        ? `<tr>
            <td colspan="3" style="padding:6px 12px;text-align:right;color:#6b7280;">Tax (${Number(invoice.taxRate)}%)</td>
            <td style="padding:6px 12px;text-align:right;font-weight:600;">${fmt(invoice.taxAmount)}</td>
          </tr>`
        : "";

    // Build email HTML
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1e293b,#334155);padding:32px;color:white;">
        <h1 style="margin:0;font-size:24px;font-weight:700;">${business.name}</h1>
        ${business.address ? `<p style="margin:4px 0 0;font-size:14px;opacity:0.8;">${business.address}</p>` : ""}
        ${business.city || business.state ? `<p style="margin:2px 0 0;font-size:14px;opacity:0.8;">${[business.city, business.state, business.zipCode].filter(Boolean).join(", ")}</p>` : ""}
      </div>

      <div style="padding:32px;">
        ${message ? `<p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : ""}

        <!-- Invoice Header -->
        <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
          <div>
            <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Invoice</p>
            <p style="font-size:20px;font-weight:700;color:#111827;margin:0;">${invoice.number}</p>
          </div>
        </div>

        <!-- Dates -->
        <table style="width:100%;margin-bottom:24px;font-size:14px;">
          <tr>
            <td style="color:#6b7280;">Issued: <strong style="color:#111827;">${fmtDate(invoice.createdAt)}</strong></td>
            <td style="text-align:right;color:#6b7280;">Due: <strong style="color:#111827;">${fmtDate(invoice.dueDate)}</strong></td>
          </tr>
        </table>

        ${invoice.client ? `
        <!-- Bill To -->
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Bill To</p>
          <p style="font-size:15px;font-weight:600;color:#111827;margin:0;">${invoice.client.name}</p>
          ${invoice.client.company ? `<p style="font-size:14px;color:#6b7280;margin:2px 0 0;">${invoice.client.company}</p>` : ""}
          ${invoice.client.email ? `<p style="font-size:14px;color:#6b7280;margin:2px 0 0;">${invoice.client.email}</p>` : ""}
        </div>` : ""}

        <!-- Line Items -->
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:10px 12px;font-weight:600;color:#374151;font-size:13px;">Description</th>
              <th style="text-align:center;padding:10px 12px;font-weight:600;color:#374151;font-size:13px;width:60px;">Qty</th>
              <th style="text-align:right;padding:10px 12px;font-weight:600;color:#374151;font-size:13px;width:90px;">Price</th>
              <th style="text-align:right;padding:10px 12px;font-weight:600;color:#374151;font-size:13px;width:90px;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Totals -->
        <table style="width:100%;font-size:14px;">
          <tr>
            <td colspan="3" style="padding:6px 12px;text-align:right;color:#6b7280;">Subtotal</td>
            <td style="padding:6px 12px;text-align:right;font-weight:600;">${fmt(invoice.subtotal)}</td>
          </tr>
          ${taxHtml}
          <tr style="border-top:2px solid #e5e7eb;">
            <td colspan="3" style="padding:12px 12px 6px;text-align:right;font-size:16px;font-weight:700;color:#111827;">Total Due</td>
            <td style="padding:12px 12px 6px;text-align:right;font-size:16px;font-weight:700;color:#111827;">${fmt(invoice.total)}</td>
          </tr>
        </table>

        ${invoice.notes ? `
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <p style="font-size:12px;font-weight:600;color:#6b7280;margin:0 0 4px;">Notes</p>
          <p style="font-size:14px;color:#6b7280;margin:0;white-space:pre-wrap;">${invoice.notes.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>` : ""}

        ${invoice.terms ? `
        <div style="margin-top:16px;">
          <p style="font-size:12px;font-weight:600;color:#6b7280;margin:0 0 4px;">Terms</p>
          <p style="font-size:14px;color:#6b7280;margin:0;white-space:pre-wrap;">${invoice.terms.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>` : ""}
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px 32px;text-align:center;">
        <p style="font-size:13px;color:#9ca3af;margin:0;">
          Sent via <strong>BizPilot</strong> — Smart back-office for small businesses
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Send email via Resend
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: `${business.name} <invoices@${process.env.RESEND_EMAIL_DOMAIN || "resend.dev"}>`,
      to: [to],
      subject: `Invoice ${invoice.number} from ${business.name}`,
      html,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    // Update invoice status to SENT if it was DRAFT
    if (invoice.status === "DRAFT") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Email send error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
