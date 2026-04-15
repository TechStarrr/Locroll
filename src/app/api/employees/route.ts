import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/employees?companyId=...
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

  const employees = await prisma.employee.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ employees });
}

// POST /api/employees — create one employee
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    companyId, firstName, lastName, email, countryCode, jobTitle,
    department, salaryAmount, currency, payFrequency, inviteToken, inviteLink,
  } = body;

  if (!companyId || !firstName || !lastName || !email || !inviteToken || !inviteLink) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.create({
      data: {
        companyId, firstName, lastName, email: email.toLowerCase().trim(),
        countryCode: countryCode ?? "",
        jobTitle: jobTitle ?? "",
        department: department ?? "",
        salaryAmount: salaryAmount ?? "",
        currency: currency ?? "USD",
        payFrequency: payFrequency ?? "monthly",
        inviteToken, inviteLink,
        status: "pending",
      },
    });
    return NextResponse.json({ employee }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 409 });
    }
    throw err;
  }
}
