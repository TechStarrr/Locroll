"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  inviteToken: string;
  walletAddress?: string;
  privyUserId?: string;
  status?: "pending" | "active";
}

type Step = "accept" | "authing" | "accepted" | "invalid";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { ready, authenticated, user, login } = usePrivy();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [step, setStep] = useState<Step>("accept");
  const [loading, setLoading] = useState(true);

  // Load employee from localStorage
  useEffect(() => {
    const employees: Employee[] = JSON.parse(
      localStorage.getItem("locroll_employees") ?? "[]"
    );
    const found = employees.find((e) => e.inviteToken === token);
    if (found) {
      setEmployee(found);
    } else {
      setStep("invalid");
    }
    setLoading(false);
  }, [token]);

  // Once Privy authenticates after the employee clicked Accept, attach wallet to record
  useEffect(() => {
    if (step !== "authing" || !ready || !authenticated || !user || !employee) return;

    const walletAddress =
      user.wallet?.address ??
      user.linkedAccounts.find((a) => a.type === "wallet")?.address;

    const updated: Employee = {
      ...employee,
      privyUserId: user.id,
      walletAddress: walletAddress ?? undefined,
      status: "active",
    };

    // Patch the record in localStorage
    const employees: Employee[] = JSON.parse(
      localStorage.getItem("locroll_employees") ?? "[]"
    );
    const next = employees.map((e) => (e.inviteToken === token ? updated : e));
    localStorage.setItem("locroll_employees", JSON.stringify(next));

    setEmployee(updated);
    setStep("accepted");
  }, [step, ready, authenticated, user, employee, token]);

  function handleAccept() {
    setStep("authing");
    // Privy login — employee signs in with email; embedded wallet is auto-created
    login();
  }

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#13f09c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <div className="min-h-screen bg-[#070d1f] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-red-400 text-3xl">link_off</span>
        </div>
        <h1 className="text-xl font-black text-white mb-2">Invalid invite link</h1>
        <p className="text-[#dce1fb]/50 text-sm max-w-sm">
          This invite link is invalid or has already been used.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1f] flex flex-col items-center justify-center px-6">
      {/* Background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#13f09c]/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-md bg-[#13f09c] flex items-center justify-center">
            <span className="text-[#0c1324] font-black text-sm">L</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Locroll</span>
        </div>

        {/* ── Step: accept ── */}
        {step === "accept" && (
          <div>
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">
              You&apos;ve been invited to Locroll
            </h1>
            <p className="text-[#dce1fb]/60 text-sm mb-8 leading-relaxed">
              Accept this invite to receive your salary onchain. Your embedded wallet will be created automatically — no crypto knowledge required.
            </p>

            <div className="mb-6">
              <label className="block text-xs text-[#dce1fb]/50 mb-2 font-['IBM_Plex_Mono'] uppercase tracking-widest">
                Email
              </label>
              <div className="w-full bg-[#0c1324] border border-white/10 rounded-xl px-5 py-4 text-sm text-white font-['IBM_Plex_Mono']">
                {employee?.email}
              </div>
            </div>

            <button
              onClick={handleAccept}
              className="w-full bg-[#13f09c] text-[#0c1324] font-black py-4 rounded-xl text-sm uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Accept Invite
            </button>

            <p className="text-center text-[#dce1fb]/30 text-[11px] mt-4">
              A Locroll wallet will be created for you automatically.
            </p>
          </div>
        )}

        {/* ── Step: authing (Privy modal open, waiting) ── */}
        {step === "authing" && (
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-[#13f09c] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-black text-white mb-2">Setting up your account</h1>
            <p className="text-[#dce1fb]/50 text-sm">
              Complete the sign-in to activate your wallet.
            </p>
          </div>
        )}

        {/* ── Step: accepted ── */}
        {step === "accepted" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#13f09c]/20 border border-[#13f09c]/40 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#13f09c] text-4xl">check_circle</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">
              Welcome, {employee?.firstName}!
            </h1>
            <p className="text-[#dce1fb]/60 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              Your Locroll account is live. Your employer can now include you in payroll — funds will land directly in your wallet.
            </p>
            <div className="bg-[#0c1324] border border-white/10 rounded-xl p-5 text-left space-y-4">
              <div>
                <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#dce1fb]/40 mb-1">Name</div>
                <div className="text-sm text-white font-semibold">{employee?.firstName} {employee?.lastName}</div>
              </div>
              <div>
                <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#dce1fb]/40 mb-1">Email</div>
                <div className="text-sm text-white font-semibold">{employee?.email}</div>
              </div>
              <div>
                <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#dce1fb]/40 mb-1">Wallet Address</div>
                {employee?.walletAddress ? (
                  <div className="text-sm text-[#13f09c] font-['IBM_Plex_Mono'] break-all">{employee.walletAddress}</div>
                ) : (
                  <div className="text-sm text-[#dce1fb]/40 font-['IBM_Plex_Mono']">Provisioning…</div>
                )}
              </div>
              <div>
                <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#dce1fb]/40 mb-1">Status</div>
                <div className="inline-flex items-center gap-1.5 bg-[#13f09c]/10 border border-[#13f09c]/20 text-[#13f09c] text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#13f09c]" />
                  Active
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
