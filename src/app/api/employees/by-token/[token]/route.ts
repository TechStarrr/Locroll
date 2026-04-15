import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/employees/by-token/[token]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const employee = await prisma.employee.findUnique({
    where: { inviteToken: token },
  });
  if (!employee) return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
  return NextResponse.json({ employee });
}
