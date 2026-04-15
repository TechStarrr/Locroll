import { NextRequest, NextResponse } from "next/server";

// POST /api/payroll/checkout-session
// Creates a Locus Checkout session for the total payroll amount.
// The client renders <LocusCheckout> and on success calls /api/payroll/run.
export async function POST(req: NextRequest) {
  const companyId = req.cookies.get("locroll_cid")?.value;
  if (!companyId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const apiKey = process.env.LOCUS_PAY_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "LOCUS_PAY_KEY not configured — add your paywithlocus.com API key" }, { status: 500 });
  }

  let body: { total: number; lineCount: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { total, lineCount } = body;

  const origin =
    req.headers.get("origin") ??
    req.headers.get("x-forwarded-proto")?.concat("://").concat(req.headers.get("x-forwarded-host") ?? "") ??
    "https://svc-mo06ie69n25wsw45.buildwithlocus.com";

  const locusApiBase = process.env.LOCUS_API_BASE ?? "https://api.paywithlocus.com/api";
  const response = await fetch(`${locusApiBase}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: total.toFixed(2),
      description: `Locroll payroll — ${lineCount} employee${lineCount === 1 ? "" : "s"}`,
      metadata: { companyId, lineCount },
      successUrl: `${origin}/dashboard/payroll?paid=1`,
      cancelUrl: `${origin}/dashboard/payroll`,
      expiresInMinutes: 30,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    console.error("[checkout-session] Locus API error:", JSON.stringify(data));
    return NextResponse.json(
      { error: data.message ?? "Failed to create checkout session", detail: data },
      { status: 400 }
    );
  }

  return NextResponse.json({
    sessionId: data.data.id,
    checkoutUrl: data.data.checkoutUrl,
  });
}
