import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/audit
export async function GET(req: NextRequest) {
  const companyId = req.cookies.get("locroll_cid")?.value;
  if (!companyId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const logs = await prisma.auditLog.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ logs });
}
