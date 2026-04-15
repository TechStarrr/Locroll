import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/employees/bulk — create multiple employees at once (CSV import)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyId, employees } = body as {
    companyId: string;
    employees: {
      firstName: string; lastName: string; email: string; countryCode?: string;
      jobTitle?: string; department?: string; salaryAmount?: string;
      currency?: string; payFrequency?: string; inviteToken: string; inviteLink: string;
    }[];
  };

  if (!companyId || !Array.isArray(employees) || employees.length === 0) {
    return NextResponse.json({ error: "companyId and employees array required" }, { status: 400 });
  }

  // Use createMany but skip duplicates
  const result = await prisma.employee.createMany({
    data: employees.map((e) => ({
      companyId,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email.toLowerCase().trim(),
      countryCode: e.countryCode ?? "",
      jobTitle: e.jobTitle ?? "",
      department: e.department ?? "",
      salaryAmount: e.salaryAmount ?? "",
      currency: e.currency ?? "USD",
      payFrequency: e.payFrequency ?? "monthly",
      inviteToken: e.inviteToken,
      inviteLink: e.inviteLink,
      status: "pending",
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ count: result.count }, { status: 201 });
}
