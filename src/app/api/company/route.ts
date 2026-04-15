import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const COOKIE = "locroll_cid";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

// GET /api/company?privyUserId=... — look up company and set cookie
export async function GET(req: NextRequest) {
  const privyUserId = req.nextUrl.searchParams.get("privyUserId");
  if (!privyUserId) return NextResponse.json({ error: "privyUserId required" }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { privyUserId } });
  if (!company) return NextResponse.json({ company: null });

  const res = NextResponse.json({ company });
  res.cookies.set(COOKIE, company.id, COOKIE_OPTS);
  return res;
}

// POST /api/company — create company on onboarding, set cookie
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, size, privyUserId } = body;

  if (!name || !privyUserId) {
    return NextResponse.json({ error: "name and privyUserId required" }, { status: 400 });
  }

  const company = await prisma.company.upsert({
    where: { privyUserId },
    update: { name, size: size ?? null },
    create: { name, size: size ?? null, privyUserId },
  });

  const res = NextResponse.json({ company }, { status: 201 });
  res.cookies.set(COOKIE, company.id, COOKIE_OPTS);
  return res;
}

// DELETE /api/company — sign out: clear the cookie
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  return res;
}
