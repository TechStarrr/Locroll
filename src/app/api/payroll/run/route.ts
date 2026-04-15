import { NextRequest, NextResponse } from "next/server";
import { sendToEmail, sendToAddress } from "@/lib/locus";

interface PayrollLineInput {
  employeeId: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  walletAddress?: string;
}

export async function POST(req: NextRequest) {
  let body: { lines: PayrollLineInput[]; runId: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { lines, runId } = body;

  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ success: false, error: "No payroll lines provided" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    lines.map(async (line) => {
      const memo = `Locroll payroll run ${runId} — ${line.name} (${line.currency})`;

      // Prefer wallet address if known; fall back to email escrow
      if (line.walletAddress) {
        const result = await sendToAddress(line.walletAddress, line.amount, memo);
        return { employeeId: line.employeeId, ...result, method: "address" };
      } else {
        const result = await sendToEmail(line.email, line.amount, memo);
        return { employeeId: line.employeeId, ...result, method: "email" };
      }
    })
  );

  const settled = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return { employeeId: lines[i].employeeId, success: true, data: r.value };
    }
    return {
      employeeId: lines[i].employeeId,
      success: false,
      error: r.reason instanceof Error ? r.reason.message : "Payment failed",
    };
  });

  const allOk = settled.every((r) => r.success);
  const anyOk = settled.some((r) => r.success);

  return NextResponse.json(
    {
      success: allOk,
      partial: !allOk && anyOk,
      results: settled,
    },
    { status: allOk ? 200 : anyOk ? 207 : 500 }
  );
}
