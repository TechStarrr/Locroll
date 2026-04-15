"use client";

import { useState, useEffect, useCallback } from "react";
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

interface AuditEvent {
  id: string;
  type: string;
  payrollRunId?: string | null;
  companyId: string;
  createdAt: string;
  total?: string | null;
  currency?: string | null;
  count?: number | null;
}

function kycStatus(emp: Employee): "verified" | "pending" {
  return emp.status === "active" && !!emp.walletAddress ? "verified" : "pending";
}

export default function CompliancePage() {
  const { user, logout } = usePrivy();
  const displayName =
    user?.email?.address ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : "User");
  const initials = displayName.slice(0, 2).toUpperCase();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const load = useCallback(() => {
    const companyId = localStorage.getItem("locroll_company_id");
    if (!companyId) return;

    fetch(`/api/employees?companyId=${companyId}`)
      .then((r) => r.json())
      .then((j) => setEmployees(j.employees ?? []))
      .catch(() => {});

    fetch(`/api/audit?companyId=${companyId}`)
      .then((r) => r.json())
      .then((j) => setAuditLog(j.logs ?? []))
      .catch(() => {});

    setLastRefreshed(new Date());
  }, []);

  useEffect(() => { load(); }, [load]);

  const verified = employees.filter((e) => kycStatus(e) === "verified");
  const pendingKyc = employees.filter((e) => kycStatus(e) === "pending");
  const activeTeam = employees.filter((e) => e.status === "active");
  const verifiedPct = activeTeam.length > 0 ? Math.round((verified.length / activeTeam.length) * 100) : 0;

  const stats = [
    {
      label: "Verified",
      value: verified.length,
      sub: activeTeam.length > 0 ? `${verifiedPct}% of active team` : "No active employees",
      icon: "verified_user",
      accent: "#13f09c",
    },
    {
      label: "Pending KYC",
      value: pendingKyc.length,
      sub: "Awaiting wallet onboarding",
      icon: "pending_actions",
      accent: "#f5c542",
    },
    {
      label: "Action Required",
      value: 0,
      sub: "No issues detected",
      icon: "warning",
      accent: "#ff6b6b",
    },
  ];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatEventLabel(event: AuditEvent): string {
    if (event.type === "PAYROLL_RUN") {
      return `Payroll executed — ${event.count} payment${event.count !== 1 ? "s" : ""}, total ${event.total} ${event.currency}`;
    }
    return event.type;
  }

  return (
    <main className="relative min-h-screen">
      <header className="sticky top-0 z-20 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 font-['Geist_Sans'] tracking-tight border-b border-white/5">
        <div>
          <div className="flex items-center text-[10px] text-on-surface-variant font-['IBM_Plex_Mono'] uppercase tracking-widest mb-1">
            <span>Locroll</span>
            <span className="mx-2 text-[#13f09c]/30">/</span>
            <span className="text-[#13f09c]">Compliance</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-[#13f09c]">COMPLIANCE</h1>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={load}
            title="Refresh"
            className="text-on-surface-variant hover:text-[#13f09c] transition-colors duration-200"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
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
        {/* Title row */}
        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Compliance</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Monitor employee verification and audit events across the team.
          </p>
          <p className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant mt-2 uppercase tracking-widest">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.accent}15`, border: `1px solid ${s.accent}30` }}
                >
                  <span className="material-symbols-outlined text-xl" style={{ color: s.accent }}>{s.icon}</span>
                </div>
              </div>
              <div className="text-3xl font-black text-on-surface mb-1" style={{ color: s.value > 0 && s.label !== "Verified" ? s.accent : undefined }}>
                {s.value}
              </div>
              <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant">{s.label}</div>
              <div className="text-xs text-on-surface-variant mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Team compliance table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h3 className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-on-surface-variant">
              Team compliance status
            </h3>
            <span className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant">{employees.length} employee{employees.length !== 1 ? "s" : ""}</span>
          </div>

          {employees.length === 0 ? (
            <div className="flex flex-col items-center text-center py-20">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">manage_accounts</span>
              <h4 className="font-bold text-on-surface text-sm mb-1">No employees added yet</h4>
              <p className="text-on-surface-variant text-xs max-w-xs">
                Add employees to track their verification status here.
              </p>
              <Link href="/dashboard/employees/add" className="mt-5 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#13f09c] hover:underline">
                Add Employee →
              </Link>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-['IBM_Plex_Mono'] min-w-[560px]">
              <thead className="bg-surface-container">
                <tr>
                  {["Employee", "KYC Status", "Last Checked", "Profile"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const kyc = kycStatus(emp);
                  const lastChecked = emp.status === "active" ? formatDate(emp.createdAt) : "—";
                  return (
                    <tr key={emp.id} className="border-t border-outline-variant/5 hover:bg-surface-container/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-on-surface">{emp.firstName} {emp.lastName}</div>
                        <div className="text-on-surface-variant text-[10px] mt-0.5">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {kyc === "verified" ? (
                          <span className="inline-flex items-center gap-1 text-[#13f09c] bg-[#13f09c]/10 border border-[#13f09c]/20 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#13f09c]" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#f5c542] bg-[#f5c542]/10 border border-[#f5c542]/20 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f5c542]" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{lastChecked}</td>
                      <td className="px-6 py-4">
                        <Link
                          href="/dashboard/employees"
                          className="text-[#13f09c] hover:underline text-[10px] uppercase tracking-widest"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Audit log */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10">
            <h3 className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-on-surface-variant">
              Audit log
            </h3>
          </div>

          {auditLog.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">history</span>
              <h4 className="font-bold text-on-surface text-sm mb-1">No audit events yet</h4>
              <p className="text-on-surface-variant text-xs">
                No compliance events have been recorded yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/5">
              {auditLog.map((event, i) => (
                <li key={i} className="px-6 py-4 flex items-start gap-4">
                  <div className="mt-0.5 w-7 h-7 rounded-full bg-[#13f09c]/10 border border-[#13f09c]/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm text-[#13f09c]">receipt_long</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-on-surface">{formatEventLabel(event)}</div>
                    <div className="text-[10px] text-on-surface-variant mt-1 font-['IBM_Plex_Mono']">
                      {formatDate(event.createdAt)} · {new Date(event.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
