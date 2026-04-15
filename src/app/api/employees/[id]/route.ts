import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH /api/employees/[id] — update status, walletAddress, privyUserId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, walletAddress, privyUserId } = body;

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(walletAddress && { walletAddress }),
      ...(privyUserId && { privyUserId }),
    },
  });

  return NextResponse.json({ employee });
}

// GET /api/employees/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ employee });
}
