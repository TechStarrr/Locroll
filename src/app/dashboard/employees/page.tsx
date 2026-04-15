"use client";

import { useState, useEffect, useRef } from "react";
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

interface CsvRow {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  jobTitle: string;
  department: string;
  salaryAmount: string;
  currency: string;
  payFrequency: string;
  error?: string;
}

function generateToken() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const REQUIRED = ["firstName", "lastName", "email"];
const HEADERS = [
  "firstName", "lastName", "email", "countryCode",
  "jobTitle", "department", "salaryAmount", "currency", "payFrequency",
];

function parseCSV(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split(",").map((h) => h.trim().toLowerCase());
  // Map flexible header names → canonical field names
  const headerMap: Record<string, string> = {
    firstname: "firstName", first_name: "firstName", "first name": "firstName",
    lastname: "lastName", last_name: "lastName", "last name": "lastName",
    email: "email", "work email": "email", workemail: "email",
    countrycode: "countryCode", country_code: "countryCode", country: "countryCode",
    jobtitle: "jobTitle", job_title: "jobTitle", title: "jobTitle", role: "jobTitle",
    department: "department", dept: "department",
    salaryamount: "salaryAmount", salary_amount: "salaryAmount", salary: "salaryAmount", amount: "salaryAmount",
    currency: "currency",
    payfrequency: "payFrequency", pay_frequency: "payFrequency", frequency: "payFrequency",
  };

  const mappedHeaders = rawHeaders.map((h) => headerMap[h] ?? h);

  return lines.slice(1).filter(Boolean).map((line) => {
    // Handle quoted commas
    const values: string[] = [];
    let cur = "", inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { values.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    values.push(cur.trim());

    const row: Record<string, string> = {};
    mappedHeaders.forEach((h, i) => { row[h] = values[i] ?? ""; });

    const missing = REQUIRED.filter((f) => !row[f]);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email ?? "");

    return {
      firstName: row.firstName ?? "",
      lastName: row.lastName ?? "",
      email: row.email ?? "",
      countryCode: (row.countryCode ?? "").toUpperCase().slice(0, 2),
      jobTitle: row.jobTitle ?? "",
      department: row.department ?? "",
      salaryAmount: row.salaryAmount ?? "",
      currency: row.currency || "USD",
      payFrequency: row.payFrequency || "Monthly",
      error: missing.length
        ? `Missing: ${missing.join(", ")}`
        : !emailValid
        ? "Invalid email"
        : undefined,
    };
  });
}

export default function EmployeesPage() {
  const { user, logout } = usePrivy();

  const displayName =
    user?.email?.address ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : "User");
  const initials = displayName.slice(0, 2).toUpperCase();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [csvRows, setCsvRows] = useState<CsvRow[] | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored: Employee[] = JSON.parse(localStorage.getItem("locroll_employees") ?? "[]");
    setEmployees(stored);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setCsvRows(rows);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleImportConfirm() {
    if (!csvRows) return;
    setImporting(true);
    const valid = csvRows.filter((r) => !r.error);
    const origin = window.location.origin;
    const newEmployees: Employee[] = valid.map((r) => {
      const token = generateToken();
      return {
        ...r,
        id: token,
        inviteToken: token,
        inviteLink: `${origin}/invite/${token}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    });
    const existing: Employee[] = JSON.parse(localStorage.getItem("locroll_employees") ?? "[]");
    const merged = [...existing, ...newEmployees];
    localStorage.setItem("locroll_employees", JSON.stringify(merged));
    setEmployees(merged);
    setCsvRows(null);
    setCsvFileName("");
    setImporting(false);
  }

  const filtered = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const validRows = csvRows?.filter((r) => !r.error) ?? [];
  const invalidRows = csvRows?.filter((r) => r.error) ?? [];

  return (
    <main className="relative min-h-screen">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── CSV Preview Modal ── */}
      {csvRows && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-3xl bg-[#0c1324] border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/10">
              <div>
                <h2 className="font-black text-on-surface tracking-tight">CSV Import Preview</h2>
                <p className="text-xs text-on-surface-variant mt-0.5 font-['IBM_Plex_Mono']">{csvFileName}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#13f09c]">
                  {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-red-400">
                    {invalidRows.length} invalid
                  </span>
                )}
                <button
                  onClick={() => { setCsvRows(null); setCsvFileName(""); }}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[50vh]">
              <table className="w-full text-xs font-['IBM_Plex_Mono']">
                <thead className="bg-surface-container-lowest sticky top-0">
                  <tr>
                    {["", "Name", "Email", "Country", "Job Title", "Salary", "Frequency"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.map((row, i) => (
                    <tr key={i} className={`border-t border-outline-variant/10 ${row.error ? "bg-red-500/5" : ""}`}>
                      <td className="px-5 py-3">
                        {row.error ? (
                          <span className="material-symbols-outlined text-red-400 text-base" title={row.error}>error</span>
                        ) : (
                          <span className="material-symbols-outlined text-[#13f09c] text-base">check_circle</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-on-surface">{row.firstName} {row.lastName}</td>
                      <td className="px-5 py-3 text-on-surface-variant">{row.email}</td>
                      <td className="px-5 py-3 text-on-surface-variant">{row.countryCode || "—"}</td>
                      <td className="px-5 py-3 text-on-surface-variant">{row.jobTitle || "—"}</td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {row.salaryAmount ? `${row.salaryAmount} ${row.currency}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">{row.payFrequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Error summary */}
            {invalidRows.length > 0 && (
              <div className="px-8 py-4 border-t border-red-500/10 bg-red-500/5">
                <p className="text-[10px] text-red-400 font-['IBM_Plex_Mono'] uppercase tracking-widest mb-2">Row errors (will be skipped)</p>
                {invalidRows.map((r, i) => (
                  <p key={i} className="text-[11px] text-red-300/70">
                    Row {csvRows.indexOf(r) + 2}: {r.firstName} {r.lastName} — {r.error}
                  </p>
                ))}
              </div>
            )}

            {/* Modal footer */}
            <div className="flex items-center justify-between px-8 py-5 border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant">
                {validRows.length === 0
                  ? "No valid rows to import."
                  : `${validRows.length} employee${validRows.length > 1 ? "s" : ""} will be added and invite links generated.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setCsvRows(null); setCsvFileName(""); }}
                  className="text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant hover:text-on-surface border border-outline-variant/20 px-5 py-2.5 rounded-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportConfirm}
                  disabled={validRows.length === 0 || importing}
                  className="flex items-center gap-2 liquid-gradient text-on-primary font-bold px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest hover:scale-95 duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-base">upload</span>
                  Import {validRows.length} employee{validRows.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 font-['Geist_Sans'] tracking-tight border-b border-white/5">
        <div className="flex items-center gap-8">
          <div>
            <div className="flex items-center text-[10px] text-on-surface-variant font-['IBM_Plex_Mono'] uppercase tracking-widest mb-1">
              <span>Locroll</span>
              <span className="mx-2 text-[#13f09c]/30">/</span>
              <span className="text-[#13f09c]">Team</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-[#13f09c]">TEAM_MGMT</h1>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-container-highest border-none rounded-sm pl-10 pr-4 py-2 text-xs font-['IBM_Plex_Mono'] text-on-surface focus:ring-1 focus:ring-primary-fixed w-64 placeholder:text-on-surface-variant/30"
              placeholder="SEARCH_EMPLOYEES..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button className="text-[#dce1fb] hover:text-[#13f09c] transition-colors duration-300">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-[#dce1fb] hover:text-[#13f09c] transition-colors duration-300">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/20 mx-2" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase">SYS_ADMIN</div>
              <div className="text-xs font-bold text-on-surface">{displayName}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-primary-container/20 bg-[#13f09c]/20 flex items-center justify-center text-[#13f09c] font-bold text-sm">
              {initials}
            </div>
            <button onClick={logout} title="Sign out" className="text-[#dce1fb]/40 hover:text-red-400 transition-colors duration-200 ml-1">
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        {/* Title row */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-on-surface">Team</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {employees.length} employee{employees.length !== 1 ? "s" : ""} · manage your team
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-outline-variant/30 text-on-surface bg-surface-container-highest hover:bg-surface-container-high px-3 sm:px-5 py-2.5 rounded-sm text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest transition-all duration-200"
            >
              <span className="material-symbols-outlined text-base">upload</span>
              <span className="hidden sm:inline">Upload CSV</span>
            </button>
            <Link
              href="/dashboard/employees/add"
              className="flex items-center gap-2 liquid-gradient text-on-primary font-bold px-3 sm:px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest hover:scale-95 duration-200"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span className="hidden sm:inline">Add Employee</span>
            </Link>
          </div>
        </div>

        {/* CSV format hint */}
        <div className="mb-6 text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant/50 uppercase tracking-widest">
          CSV format: firstName, lastName, email, countryCode, jobTitle, department, salaryAmount, currency, payFrequency
        </div>

        {employees.length === 0 ? (
          /* Empty state */
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl flex flex-col items-center justify-center text-center py-32">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 border border-[#13f09c]/10">
              <span className="material-symbols-outlined text-4xl text-[#13f09c]/30">group</span>
            </div>
            <h3 className="text-lg font-black text-on-surface mb-2 tracking-tight">Add your first team member</h3>
            <p className="text-on-surface-variant max-w-sm mb-10 text-sm leading-relaxed">
              Invite employees to onboard onto Locroll for gasless, instant cross-border payroll.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border border-outline-variant/30 text-on-surface bg-surface-container-highest hover:bg-surface-container-high px-5 py-2.5 rounded-sm text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base">upload</span>
                Upload CSV
              </button>
              <Link
                href="/dashboard/employees/add"
                className="flex items-center gap-2 liquid-gradient text-on-primary font-bold px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest hover:scale-95 duration-200"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                Add Employee
              </Link>
            </div>
          </div>
        ) : (
          /* Employee table */
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-xs font-['IBM_Plex_Mono'] min-w-[640px]">
              <thead className="bg-surface-container border-b border-outline-variant/10">
                <tr>
                  {["Name", "Email", "Role", "Department", "Salary", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-t border-outline-variant/5 hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#13f09c]/10 border border-[#13f09c]/20 flex items-center justify-center text-[#13f09c] font-bold text-[10px]">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <span className="text-on-surface font-semibold">{emp.firstName} {emp.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{emp.email}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{emp.jobTitle || "—"}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{emp.department || "—"}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {emp.salaryAmount ? `${emp.salaryAmount} ${emp.currency}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        emp.status === "active"
                          ? "text-[#13f09c] bg-[#13f09c]/10 border-[#13f09c]/20"
                          : "text-on-surface-variant bg-surface-container border-outline-variant/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "active" ? "bg-[#13f09c]" : "bg-on-surface-variant"}`} />
                        {emp.status === "active" ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(emp.inviteLink);
                        }}
                        title="Copy invite link"
                        className="text-on-surface-variant hover:text-[#13f09c] transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">content_copy</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant">
                      No employees match &quot;{search}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      <footer className="px-4 sm:px-6 lg:px-10 py-8 border-t border-outline-variant/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
        <div className="flex items-center gap-6">
          <span className="font-['IBM_Plex_Mono'] text-[10px] text-on-surface-variant tracking-widest uppercase">© 2026 LOCROLL</span>
          <div className="flex gap-4">
            <a className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase hover:text-[#13f09c] transition-colors" href="#">Privacy</a>
            <a className="text-[10px] font-['IBM_Plex_Mono'] text-on-surface-variant uppercase hover:text-[#13f09c] transition-colors" href="#">Terms</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#13f09c]" />
            ))}
          </div>
          <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#13f09c] tracking-widest uppercase">System Operational</span>
        </div>
      </footer>
    </main>
  );
}

