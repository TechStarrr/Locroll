import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

// POST /api/employees/bulk — create multiple employees at once (CSV import)
export async function POST(req: NextRequest) {
  const companyId = req.cookies.get("locroll_cid")?.value;
  if (!companyId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { employees } = body as {
    employees: {
      firstName: string; lastName: string; email: string; countryCode?: string;
      jobTitle?: string; department?: string; salaryAmount?: string;
      currency?: string; payFrequency?: string; inviteToken: string; inviteLink: string;
    }[];
  };

  if (!Array.isArray(employees) || employees.length === 0) {
    return NextResponse.json({ error: "employees array required" }, { status: 400 });
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

  // Send invite emails to all successfully created employees — fire and forget
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  for (const e of employees) {
    sendInviteEmail({
      to: e.email,
      firstName: e.firstName,
      companyName: company?.name ?? "Your company",
      inviteLink: e.inviteLink,
    }).catch(() => {});
  }

  return NextResponse.json({ count: result.count }, { status: 201 });
}
