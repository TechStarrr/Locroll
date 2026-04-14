"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  inviteToken: string;
}

type Step = "accept" | "accepted" | "invalid";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [step, setStep] = useState<Step>("accept");
  const [loading, setLoading] = useState(true);

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

  function handleAccept() {
    setStep("accepted");
  }

  if (loading) {
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

        {step === "accept" && (
          <div>
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">
              You&apos;ve been invited to Locroll
            </h1>
            <p className="text-[#dce1fb]/60 text-sm mb-8 leading-relaxed">
              Accept this invite to receive your salary onchain. Your embedded wallet will be created automatically — no crypto knowledge required.
            </p>

            {/* Email field (pre-filled, readonly) */}
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

        {step === "accepted" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#13f09c]/20 border border-[#13f09c]/40 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#13f09c] text-4xl">check_circle</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">
              Welcome, {employee?.firstName}!
            </h1>
            <p className="text-[#dce1fb]/60 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              Your invite has been accepted. Your embedded wallet is being set up. You&apos;ll receive your salary onchain once your employer runs payroll.
            </p>
            <div className="bg-[#0c1324] border border-white/10 rounded-xl p-5 text-left space-y-3">
              <div>
                <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#dce1fb]/40 mb-1">Name</div>
                <div className="text-sm text-white font-semibold">{employee?.firstName} {employee?.lastName}</div>
              </div>
              <div>
                <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#dce1fb]/40 mb-1">Email</div>
                <div className="text-sm text-white font-semibold">{employee?.email}</div>
              </div>
              <div>
                <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#dce1fb]/40 mb-1">Wallet Status</div>
                <div className="text-sm text-[#13f09c] font-semibold">Provisioning...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
