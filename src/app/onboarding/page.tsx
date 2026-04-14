"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

export default function OnboardingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) { setError("Company name is required"); return; }
    setLoading(true);

    // Persist to localStorage
    localStorage.setItem(
      "locroll_company",
      JSON.stringify({ name: companyName.trim(), size: companySize, createdAt: new Date().toISOString() })
    );

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#070d1f] grid grid-cols-1 lg:grid-cols-2">
      {/* ── Left panel ── */}
      <div className="relative flex flex-col justify-between p-12 overflow-hidden">
        {/* Background teal glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#13f09c]/8 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-20">
            <div className="w-8 h-8 rounded-md bg-[#13f09c] flex items-center justify-center">
              <span className="text-[#0c1324] font-black text-sm">L</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Locroll</span>
          </div>

          <div className="max-w-sm">
            <p className="text-[#13f09c] text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest mb-4">
              Get started in minutes
            </p>
            <h1 className="text-4xl font-black text-white leading-tight mb-6 tracking-tight">
              Run payroll{" "}
              <span className="text-[#13f09c]">onchain</span>{" "}
              from day one.
            </h1>
            <p className="text-[#dce1fb]/60 text-sm leading-relaxed mb-12">
              Set up your company in under two minutes. Add employees, fund your treasury, and run your first payroll — all from a single dashboard.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="relative z-10 space-y-4 mb-8">
          {[
            { n: "01", label: "Create your company profile" },
            { n: "02", label: "Invite employees via link" },
            { n: "03", label: "Fund treasury and run payroll" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-6">
              <span className="text-[#13f09c] font-['IBM_Plex_Mono'] text-[10px]">{n}</span>
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="text-[#dce1fb]/60 text-xs">{label}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-[#dce1fb]/20 text-[10px] font-['IBM_Plex_Mono']">
          Powered by Locus · Secured by Privy · Compliant by default
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center p-12 bg-[#0c1324]/50">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            Set up your company
          </h2>
          <p className="text-[#dce1fb]/50 text-sm mb-8">Tell us a bit about your organization</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Company name */}
            <div>
              <label className="block text-xs text-[#dce1fb]/60 mb-2 font-['IBM_Plex_Mono'] uppercase tracking-widest">
                Company name
              </label>
              <input
                autoFocus
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); setError(""); }}
                placeholder="Acme Corp"
                className={`w-full bg-[#070d1f] border rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#13f09c] transition ${
                  error ? "border-red-500" : "border-white/10"
                }`}
              />
              {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
            </div>

            {/* Company size */}
            <div>
              <label className="block text-xs text-[#dce1fb]/60 mb-2 font-['IBM_Plex_Mono'] uppercase tracking-widest">
                Company size{" "}
                <span className="text-[#13f09c]/50 normal-case">(optional)</span>
              </label>
              <div className="relative">
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full appearance-none bg-[#070d1f] border border-[#13f09c] rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#13f09c] transition"
                >
                  <option value="">Select size</option>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">expand_more</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d6e4a] hover:bg-[#0a5d3f] text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Create company"}
            </button>
          </form>

          <p className="text-center text-[#dce1fb]/40 text-xs mt-6">
            Already have a company?{" "}
            <Link href="/dashboard" className="text-[#13f09c] hover:underline">
              Go to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
