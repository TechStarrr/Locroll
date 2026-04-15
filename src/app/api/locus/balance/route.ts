import { NextResponse } from "next/server";
import { getBalance } from "@/lib/locus";

export async function GET() {
  try {
    const data = await getBalance();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
