import { NextRequest, NextResponse } from "next/server";

const LOCUS_API_BASE = process.env.LOCUS_API_BASE ?? "https://api.paywithlocus.com/api";

export async function GET(req: NextRequest) {
  const companyId = req.cookies.get("locroll_cid")?.value;
  if (!companyId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const apiKey = process.env.API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API_KEY not configured" }, { status: 500 });

  try {
    const res = await fetch(`${LOCUS_API_BASE}/pay/transactions`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? "Failed");
    return NextResponse.json({ success: true, transactions: json.data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error", transactions: [] },
      { status: 500 }
    );
  }
}
