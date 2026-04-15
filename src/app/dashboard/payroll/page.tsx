"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  jobTitle: string;
  department: string;
  salaryAmount: string;
  currency: string;
  payFrequency: string;
  inviteToken: string;
  inviteLink: string;
  status?: "pending" | "active";
  walletAddress?: string;
  createdAt: string;
}

interface PayrollLine {
  employeeId: string;
  amount: string;
  currency: string;
  override: boolean;
}

interface PayrollRun {
  id: string;
  date: string;
  lines: { name: string; email: string; amount: string; currency: string; walletAddress: string }[];
  total: string;
  currency: string;
  status: "completed" | "pending";
}

export default function PayrollPage() {
  const { user, logout } = usePrivy();
  const displayName =
    user?.email?.address ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : "User");
  const initials = displayName.slice(0, 2).toUpperCase();

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [lines, setLines] = useState<Record<string, PayrollLine>>({});
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState<PayrollRun | null>(null);

  const payrollReady = allEmployees.filter((e) => e.status === "active" && e.walletAddress);

  useEffect(() => {
    const stored: Employee[] = JSON.parse(localStorage.getItem("locroll_employees") ?? "[]");
    setAllEmployees(stored);
    const storedRuns: PayrollRun[] = JSON.parse(localStorage.getItem("locroll_payroll_runs") ?? "[]");
    setRuns(storedRuns);

    // Pre-fill lines from saved salary
    const initial: Record<string, PayrollLine> = {};
    stored.forEach((e) => {
      if (e.status === "active" && e.walletAddress) {
        initial[e.id] = {
          employeeId: e.id,
          amount: e.salaryAmount || "",
          currency: e.currency || "USD",
          override: false,
        };
      }
    });
    setLines(initial);
  }, []);

  function updateLine(id: string, field: "amount" | "currency", value: string) {
    setLines((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value, override: true } }));
  }

  function totalFor(currency: string) {
    return payrollReady
      .filter((e) => (lines[e.id]?.currency || e.currency || "USD") === currency)
      .reduce((sum, e) => sum + parseFloat(lines[e.id]?.amount || e.salaryAmount || "0"), 0)
      .toFixed(2);
  }

  const currencies = [...new Set(payrollReady.map((e) => lines[e.id]?.currency || e.currency || "USD"))];

  async function handleRunPayroll() {
    setRunning(true);
    const runId = crypto.randomUUID();

    const runLines = payrollReady.map((e) => ({
      employeeId: e.id,
      name: `${e.firstName} ${e.lastName}`,
      email: e.email,
      amount: parseFloat(lines[e.id]?.amount || e.salaryAmount || "0"),
      currency: lines[e.id]?.currency || e.currency || "USD",
      walletAddress: e.walletAddress,
    }));

    const total = runLines.reduce((s, l) => s + l.amount, 0).toFixed(2);
    const primaryCurrency = runLines[0]?.currency ?? "USD";

    let runStatus: "completed" | "pending" = "pending";

    try {
      const res = await fetch("/api/payroll/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: runLines, runId }),
      });
      const json = await res.json();
      runStatus = json.success ? "completed" : "pending";
    } catch {
      // Network error — still record run locally
    }

    const displayLines = runLines.map((l) => ({
      name: l.name,
      email: l.email,
      amount: String(l.amount),
      currency: l.currency,
      walletAddress: l.walletAddress ?? l.email,
    }));

    const run: PayrollRun = {
      id: runId,
      date: new Date().toISOString(),
      lines: displayLines,
      total,
      currency: primaryCurrency,
      status: runStatus,
    };

    const existing: PayrollRun[] = JSON.parse(localStorage.getItem("locroll_payroll_runs") ?? "[]");
    const updated = [run, ...existing];
    localStorage.setItem("locroll_payroll_runs", JSON.stringify(updated));
    setRuns(updated);

    // Audit log
    const auditLog: object[] = JSON.parse(localStorage.getItem("locroll_audit_log") ?? "[]");
    auditLog.unshift({ type: "PAYROLL_RUN", runId: run.id, date: run.date, total: run.total, currency: run.currency, count: run.lines.length });
    localStorage.setItem("locroll_audit_log", JSON.stringify(auditLog));

    setRunning(false);
    setSuccess(run);
  }

  return (
    <main className="relative min-h-screen">
      <header className="sticky top-0 z-20 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 font-['Geist_Sans'] tracking-tight border-b border-white/5">
        <div>
          <div className="flex items-center text-[10px] text-on-surface-variant font-['IBM_Plex_Mono'] uppercase tracking-widest mb-1">
            <span>Locroll</span>
            <span className="mx-2 text-[#13f09c]/30">/</span>
            <span className="text-[#13f09c]">New Payroll</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-[#13f09c]">RUN_PAYROLL</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button className="text-[#dce1fb] hover:text-[#13f09c] transition-colors duration-300">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/20 mx-2" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase">SYS_ADMIN</div>
              <div className="text-xs font-bold text-on-surface">{displayName}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-primary-container/20 bg-[#13f09c]/20 flex items-center justify-center text-[#13f09c] font-bold text-sm">{initials}</div>
            <button onClick={logout} title="Sign out" className="text-[#dce1fb]/40 hover:text-red-400 transition-colors duration-200 ml-1">
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant hover:text-[#13f09c] transition-colors mb-3">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </Link>
            <h2 className="text-2xl font-black tracking-tight text-on-surface">Run Payroll</h2>
            <p className="text-sm text-on-surface-variant mt-1">Send on-chain payments to your team in seconds.</p>
          </div>
        </div>

        {/* Success state */}
        {success && (
          <div className="mb-8 bg-[#13f09c]/5 border border-[#13f09c]/20 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#13f09c]/20 border border-[#13f09c]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#13f09c] text-2xl">check_circle</span>
              </div>
              <div>
                <h3 className="font-black text-on-surface text-lg">Payroll executed</h3>
                <p className="text-sm text-on-surface-variant">{success.lines.length} payment{success.lines.length !== 1 ? "s" : ""} dispatched · Total {success.total} {success.currency}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="ml-auto text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-2">
              {success.lines.map((l, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-t border-white/5 gap-1 sm:gap-0">
                  <div>
                    <span className="text-on-surface font-semibold">{l.name}</span>
                    <span className="text-on-surface-variant ml-2 font-['IBM_Plex_Mono'] text-[10px] break-all sm:break-normal">{l.walletAddress.slice(0, 8)}…{l.walletAddress.slice(-4)}</span>
                  </div>
                  <span className="text-[#13f09c] font-bold font-['IBM_Plex_Mono'] shrink-0">{l.amount} {l.currency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main payroll builder */}
          <div className="xl:col-span-2">
            {payrollReady.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl flex flex-col items-center justify-center text-center py-24">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-5 border border-[#13f09c]/10">
                  <span className="material-symbols-outlined text-3xl text-[#13f09c]/30">group_off</span>
                </div>
                <h3 className="text-base font-black text-on-surface mb-2">No payroll-ready employees yet</h3>
                <p className="text-on-surface-variant text-sm max-w-xs">
                  Invite employees and complete wallet onboarding before running payroll.
                </p>
                <Link href="/dashboard/employees" className="mt-6 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#13f09c] hover:underline">
                  Go to Employees →
                </Link>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <h3 className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Payroll recipients ({payrollReady.length})
                  </h3>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant">
                    Amounts are editable per run
                  </span>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-xs font-['IBM_Plex_Mono'] min-w-[560px]">
                  <thead className="bg-surface-container">
                    <tr>
                      {["Employee", "Wallet", "Amount", "Currency"].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payrollReady.map((emp) => {
                      const line = lines[emp.id] ?? { amount: emp.salaryAmount, currency: emp.currency || "USD" };
                      return (
                        <tr key={emp.id} className="border-t border-outline-variant/5">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-on-surface">{emp.firstName} {emp.lastName}</div>
                            <div className="text-on-surface-variant text-[10px] mt-0.5">{emp.email}</div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant text-[10px]">
                            {emp.walletAddress!.slice(0, 8)}…{emp.walletAddress!.slice(-6)}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={line.amount}
                              onChange={(e) => updateLine(emp.id, "amount", e.target.value)}
                              className="w-28 bg-surface border border-outline-variant/20 rounded-sm px-3 py-1.5 text-on-surface focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={line.currency}
                              onChange={(e) => updateLine(emp.id, "currency", e.target.value)}
                              className="bg-surface border border-outline-variant/20 rounded-sm px-3 py-1.5 text-on-surface focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                            >
                              {["USD", "USDC", "USDT", "EUR", "GBP", "NGN", "KES"].map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>

                <div className="px-6 py-5 border-t border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                  <div className="space-y-0.5">
                    {currencies.map((c) => (
                      <div key={c} className="text-xs text-on-surface-variant">
                        Total: <span className="text-on-surface font-bold">{totalFor(c)} {c}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleRunPayroll}
                    disabled={running || payrollReady.every((e) => !lines[e.id]?.amount && !e.salaryAmount)}
                    className="flex items-center gap-2 liquid-gradient text-on-primary font-black px-6 sm:px-8 py-3 rounded-sm text-xs uppercase tracking-widest hover:scale-95 duration-200 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                  >
                    {running ? (
                      <>
                        <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                        Executing…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">bolt</span>
                        Execute payroll
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: payroll history */}
          <div className="space-y-4">
            <h3 className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-on-surface-variant">Recent Runs</h3>
            {runs.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-6 py-10 text-center">
                <span className="text-on-surface-variant text-xs">No payroll runs yet.</span>
              </div>
            ) : (
              runs.slice(0, 8).map((run) => (
                <div key={run.id} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-0.5">
                        {new Date(run.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div className="font-bold text-on-surface text-sm">{run.total} {run.currency}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[#13f09c] bg-[#13f09c]/10 border border-[#13f09c]/20 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13f09c]" />
                      {run.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">{run.lines.length} recipient{run.lines.length !== 1 ? "s" : ""}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
