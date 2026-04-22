import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await request.json();
  if (!prompt || typeof prompt !== "string" || prompt.length > 2000) {
    return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
  }

  // Get business context
  const membership = await prisma.businessMember.findFirst({
    where: { user: { supabaseId: user.id } },
    include: {
      business: {
        include: { subscription: true },
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const business = membership.business;

  // Check AI usage limits
  const sub = business.subscription;
  if (sub && sub.aiActionsUsed >= sub.aiActionsLimit) {
    return NextResponse.json(
      { error: "AI action limit reached. Upgrade your plan for more." },
      { status: 429 }
    );
  }

  // Get client list for matching
  const clients = await prisma.client.findMany({
    where: { businessId: business.id, isArchived: false },
    select: { id: true, name: true, email: true, company: true },
  });

  const clientList =
    clients.length > 0
      ? clients.map((c: { id: string; name: string; email: string | null; company: string | null }) => `- ${c.name} (${c.email || "no email"})${c.company ? ` at ${c.company}` : ""}`).join("\n")
      : "No clients yet.";

  const systemPrompt = `You are an invoice assistant for "${business.name}". Extract invoice details from natural language.

Current clients:
${clientList}

Return ONLY valid JSON (no markdown, no explanation) with this structure:
{
  "clientName": "matched client name or new client name",
  "clientId": "matched client ID or null if new",
  "items": [
    { "description": "service description", "quantity": 1, "unitPrice": 50000 }
  ],
  "dueDate": "YYYY-MM-DD",
  "notes": "any notes mentioned or null"
}

Rules:
- unitPrice is in CENTS (e.g. $500 = 50000)
- Match client names fuzzy (e.g. "John" matches "John Smith")
- Default due date: 30 days from today (${new Date().toISOString().split("T")[0]})
- Default quantity: 1
- If multiple services mentioned, create multiple line items`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI API error:", errorBody);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // Parse AI response
    const parsed = JSON.parse(content);

    // Increment AI usage counter
    if (sub) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { aiActionsUsed: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      invoice: parsed,
      aiActionsRemaining: sub
        ? sub.aiActionsLimit - sub.aiActionsUsed - 1
        : null,
    });
  } catch (error) {
    console.error("AI invoice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
