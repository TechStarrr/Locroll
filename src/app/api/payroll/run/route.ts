import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendToEmail, sendToAddress } from "@/lib/locus";

interface PayrollLineInput {
  employeeId: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  walletAddress?: string;
}

// POST /api/payroll/run
export async function POST(req: NextRequest) {
  let body: { companyId: string; lines: PayrollLineInput[] };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { companyId, lines } = body;

  if (!companyId) {
    return NextResponse.json({ success: false, error: "companyId required" }, { status: 400 });
  }

  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ success: false, error: "No payroll lines provided" }, { status: 400 });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0).toFixed(2);
  const primaryCurrency = lines[0]?.currency ?? "USD";

  // Persist the run record before executing payments
  const run = await prisma.payrollRun.create({
    data: {
      companyId,
      total,
      currency: primaryCurrency,
      status: "pending",
      lines: {
        create: lines.map((l) => ({
          employeeId: l.employeeId,
          name: l.name,
          email: l.email,
          amount: String(l.amount),
          currency: l.currency,
          walletAddress: l.walletAddress ?? null,
        })),
      },
    },
    include: { lines: true },
  });

  const results = await Promise.allSettled(
    lines.map(async (line) => {
      const memo = `Locroll payroll run ${run.id} — ${line.name} (${line.currency})`;

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

  // Update run status based on payment results
  const updatedRun = await prisma.payrollRun.update({
    where: { id: run.id },
    data: { status: allOk ? "completed" : anyOk ? "partial" : "failed" },
  });

  // Write audit log
  await prisma.auditLog.create({
    data: {
      companyId,
      payrollRunId: run.id,
      type: "PAYROLL_RUN",
      count: lines.length,
      total,
      currency: primaryCurrency,
    },
  });

  return NextResponse.json(
    {
      success: allOk,
      partial: !allOk && anyOk,
      run: updatedRun,
      results: settled,
    },
    { status: allOk ? 200 : anyOk ? 207 : 500 }
  );
}

// GET /api/payroll/run?companyId=...
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const runs = await prisma.payrollRun.findMany({
    where: { companyId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ runs });
}
