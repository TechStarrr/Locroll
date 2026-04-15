import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/company?privyUserId=...
export async function GET(req: NextRequest) {
  const privyUserId = req.nextUrl.searchParams.get("privyUserId");
  if (!privyUserId) return NextResponse.json({ error: "privyUserId required" }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { privyUserId } });
  if (!company) return NextResponse.json({ company: null });
  return NextResponse.json({ company });
}

// POST /api/company — create company on onboarding
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, size, privyUserId } = body;

  if (!name || !privyUserId) {
    return NextResponse.json({ error: "name and privyUserId required" }, { status: 400 });
  }

  // Upsert: if company already exists for this user, update name/size
  const company = await prisma.company.upsert({
    where: { privyUserId },
    update: { name, size: size ?? null },
    create: { name, size: size ?? null, privyUserId },
  });

  return NextResponse.json({ company }, { status: 201 });
}
