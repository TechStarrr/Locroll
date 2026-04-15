import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// POST /api/webhooks/locus
// Receives Locus Checkout payment confirmation events.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature-256") ?? "";
  const secret = process.env.LOCUS_WEBHOOK_SECRET ?? "";

  if (secret && !verifyWebhook(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "checkout.session.paid") {
    const { sessionId, amount, currency, paymentTxHash, metadata } = event.data as {
      sessionId: string;
      amount: string;
      currency: string;
      paymentTxHash: string;
      metadata: Record<string, string>;
    };
    console.log(
      `[Locus Webhook] checkout.session.paid — session=${sessionId}, amount=${amount} ${currency}, tx=${paymentTxHash}, company=${metadata?.companyId}`
    );
    // Payroll distribution is triggered client-side via the onSuccess callback.
    // This webhook can be used for additional audit logging if needed.
  }

  return NextResponse.json({ received: true });
}
