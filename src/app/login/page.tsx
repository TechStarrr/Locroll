"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !authenticated || !user) return;

    async function checkCompany() {
      // Look up company by Privy user ID — API will set the HttpOnly cookie if found
      const res = await fetch(`/api/company?privyUserId=${encodeURIComponent(user!.id)}`);
      if (res.ok) {
        const { company } = await res.json();
        if (company) { router.push("/dashboard"); return; }
      }
      router.push("/onboarding");
    }

    checkCompany();
  }, [ready, authenticated, user, router]);

  return (
    <div className="min-h-screen bg-[#070d1f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#13f09c]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-[#0c1324] border border-white/10 rounded-2xl p-10 shadow-2xl">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="text-2xl font-black uppercase tracking-tighter text-[#13f09c]">
            LOCROLL
          </Link>
          <div className="text-[#dce1fb]/30 text-[10px] font-mono mt-1 tracking-tighter">
            V1.0.0-ALPHA
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#13f09c]/30 to-transparent mb-10" />

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Access Terminal
        </h1>
        <p className="text-[#dce1fb]/50 text-sm mb-10 leading-relaxed">
          Connect your wallet or sign in with email to access the payroll dashboard.
        </p>

        {/* Connect button */}
        <button
          onClick={login}
          disabled={!ready}
          className="w-full bg-[#13f09c] text-[#0c1324] py-4 rounded-sm font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
          Connect Wallet / Sign In
        </button>

        <p className="text-center text-[#dce1fb]/30 text-[10px] font-mono uppercase tracking-widest mt-6">
          Secured by{" "}
          <span className="text-[#13f09c]">Privy</span>
        </p>
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="relative z-10 mt-8 text-[#dce1fb]/40 text-xs font-mono uppercase tracking-widest hover:text-[#13f09c] transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
}
