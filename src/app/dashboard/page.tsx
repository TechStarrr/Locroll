"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import SectionHeader from "@/components/SectionHeader";

interface PayrollRun {
  id: string;
  createdAt: string;
  lines: { name: string; email: string; amount: string; currency: string }[];
  total: string;
  currency: string;
  status: "completed" | "pending" | "partial" | "failed";
}

export default function DashboardPage() {
  const { user, logout } = usePrivy();

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [teamSize, setTeamSize] = useState(0);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);

  useEffect(() => {
    // Cookie is sent automatically — no companyId needed in URL
    fetch("/api/employees")
      .then((r) => r.json())
      .then((j) => setTeamSize(j.employees?.length ?? 0))
      .catch(() => {});

    fetch("/api/payroll/run")
      .then((r) => r.json())
      .then((j) => setPayrollRuns(j.runs ?? []))
      .catch(() => {});

    // Fetch real balance from Locus
    fetch("/api/locus/balance")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setBalance(json.data.balance);
        } else {
          setBalanceError(true);
        }
      })
      .catch(() => setBalanceError(true));
  }, []);

  const displayName =
    user?.email?.address ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : "User");

  const initials = displayName.slice(0, 2).toUpperCase();

  const lastRun = payrollRuns[0];
  const lastRunLabel = lastRun
    ? new Date(lastRun.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "NO_RECENT_ACTIVITY";

  const balanceLabel = balanceError
    ? "—"
    : balance === null
    ? "…"
    : `$${parseFloat(balance).toFixed(2)}`;

  const balanceStatus = balanceError
    ? "CONNECT WALLET"
    : balance === null
    ? "SYNCING…"
    : "ACCOUNT_SYNCED";

  return (
    <main className="relative min-h-screen">
      <header className="sticky top-0 z-20 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 font-['Geist_Sans'] tracking-tight border-b border-white/5">
        <div className="flex items-center gap-8">
          <div>
            <div className="flex items-center text-[10px] text-on-surface-variant font-['IBM_Plex_Mono'] uppercase tracking-widest">
              <span>Locroll</span>
              <span className="mx-2 text-[#13f09c]/30">/</span>
              <span className="text-[#13f09c]">Dashboard</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
            </div>
            <input
              className="bg-surface-container-highest border-none rounded-sm pl-10 pr-4 py-2 text-xs font-['IBM_Plex_Mono'] text-on-surface focus:ring-1 focus:ring-primary-fixed w-64 placeholder:text-on-surface-variant/30"
              placeholder="SEARCH_SYSTEM..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button className="text-[#dce1fb] hover:text-[#13f09c] transition-colors duration-300">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hidden sm:flex text-[#dce1fb] hover:text-[#13f09c] transition-colors duration-300">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/20 mx-2 hidden sm:block"></div>
          <Link href="/dashboard/payroll" className="liquid-gradient text-on-primary font-bold px-4 sm:px-6 py-2 rounded-sm text-xs uppercase tracking-widest hidden sm:flex items-center gap-2 hover:scale-95 duration-200">
            <span>Run Payroll</span>
            <span className="material-symbols-outlined text-sm">bolt</span>
          </Link>
          <div className="flex items-center gap-3 ml-2">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase">SYS_ADMIN</div>
              <div className="text-xs font-bold text-on-surface">{displayName}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-primary-container/20 bg-[#13f09c]/20 flex items-center justify-center text-[#13f09c] font-bold text-sm">
              {initials}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-[#dce1fb]/40 hover:text-red-400 transition-colors duration-200 ml-1"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <StatCard title="Treasury Balance" value={balanceLabel} unit="USDC" icon="account_balance" status={balanceStatus} />
          <StatCard title="Last Payroll Run" value={lastRunLabel} italic={!lastRun} icon="history" />
          <StatCard title="Team Size" value={String(teamSize)} unit="USERS" icon="groups" pending={teamSize === 0} />
          <StatCard title="Yield Earned" value="$0.00" icon="trending_up" yieldText="3.7% APY" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <SectionHeader title="Recent payroll runs" />
            {payrollRuns.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 border border-[#13f09c]/10">
                  <span className="material-symbols-outlined text-4xl text-[#13f09c]/20">inventory_2</span>
                </div>
                <h3 className="text-xl font-black text-on-surface mb-2 tracking-tight">No payroll runs yet</h3>
                <p className="text-on-surface-variant max-w-sm mb-10 text-sm leading-relaxed">
                  Once your first payroll batch is executed, runs will appear here.
                </p>
                <Link href="/dashboard/payroll" className="bg-surface-container-highest hover:bg-surface-container-high text-[#13f09c] border border-[#13f09c]/20 font-bold px-8 py-3 rounded-sm text-[10px] uppercase tracking-widest transition-all duration-200">
                  Run Payroll
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-['IBM_Plex_Mono'] min-w-[400px]">
                  <thead className="bg-surface-container">
                    <tr>
                      {["Date", "Recipients", "Total", "Status"].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRuns.slice(0, 10).map((run) => (
                      <tr key={run.id} className="border-t border-outline-variant/5">
                        <td className="px-6 py-4 text-on-surface">
                          {new Date(run.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{run.lines.length}</td>
                        <td className="px-6 py-4 text-[#13f09c] font-bold">{run.total} {run.currency}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[#13f09c] bg-[#13f09c]/10 border border-[#13f09c]/20 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#13f09c]" />
                            {run.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SectionHeader title="30-day treasury" hideAction />
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-8 h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-48 opacity-10 flex items-end justify-between px-4 gap-1">
                {[10, 15, 12, 25, 20, 40, 35].map((h, i) => (
                  <div key={i} className="w-full bg-[#13f09c] rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/20 text-5xl mb-4">bar_chart</span>
              <div className="font-['IBM_Plex_Mono'] text-[10px] text-on-surface-variant uppercase tracking-widest">Awaiting transaction data</div>
              <p className="text-on-surface-variant/40 text-[9px] mt-2 max-w-[200px] text-center">
                Activity visualization will update automatically as funds move through your ecosystem.
              </p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container/5 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13f09c]">verified</span>
                </div>
                <div>
                  <div className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase">Compliance Status</div>
                  <div className="text-sm font-bold text-on-surface">Ready for Onboarding</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="px-4 sm:px-6 lg:px-10 py-8 border-t border-outline-variant/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <span className="font-['IBM_Plex_Mono'] text-[10px] text-on-surface-variant tracking-widest uppercase">© 2026 LOCROLL</span>
          <div className="flex gap-4">
            <a className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase hover:text-[#13f09c] transition-colors" href="#">Privacy</a>
            <a className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase hover:text-[#13f09c] transition-colors" href="#">Terms</a>
            <a className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase hover:text-[#13f09c] transition-colors" href="#">Support</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#13f09c]"></div>
            ))}
          </div>
          <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#13f09c] tracking-widest uppercase">System Operational</span>
        </div>
      </footer>
    </main>
  );
}
