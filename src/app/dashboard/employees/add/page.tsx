"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

interface EmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  jobTitle: string;
  department: string;
  salaryAmount: string;
  currency: string;
  payFrequency: string;
}

interface CreatedEmployee extends EmployeeForm {
  id: string;
  inviteToken: string;
  inviteLink: string;
  createdAt: string;
}

function generateToken() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function AddEmployeePage() {
  const { user } = usePrivy();
  const router = useRouter();

  const employerName =
    user?.email?.address?.split("@")[0] ??
    (user?.wallet?.address ? user.wallet.address.slice(0, 6) : "Admin");

  const [form, setForm] = useState<EmployeeForm>({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "USD",
    jobTitle: "",
    department: "",
    salaryAmount: "",
    currency: "USD",
    payFrequency: "Monthly",
  });
  const [created, setCreated] = useState<CreatedEmployee | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Partial<EmployeeForm>>({});

  function validate() {
    const e: Partial<EmployeeForm> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.countryCode.trim()) e.countryCode = "Required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const companyId = localStorage.getItem("locroll_company_id");
    if (!companyId) { setErrors({ email: "Company not found. Please complete onboarding." }); return; }

    const token = generateToken();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://locroll.xyz";
    const inviteLink = `${origin}/invite/${token}`;

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        companyId,
        inviteToken: token,
        inviteLink,
      }),
    });

    if (!res.ok) {
      setErrors({ email: "Failed to save employee. Email may already exist." });
      return;
    }

    const { employee } = await res.json();
    setCreated({ ...employee, inviteToken: employee.inviteToken, inviteLink: employee.inviteLink });
  }

  function handleCopy() {
    if (!created) return;
    navigator.clipboard.writeText(created.inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleChange(field: keyof EmployeeForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  return (
    <main className="relative min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 font-['Geist_Sans'] tracking-tight border-b border-white/5">
        <div>
          <div className="flex items-center text-[10px] text-on-surface-variant font-['IBM_Plex_Mono'] uppercase tracking-widest mb-1">
            <span>Locroll</span>
            <span className="mx-2 text-[#13f09c]/30">/</span>
            <span className="text-[#13f09c]">Add Employee</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-[#13f09c]">ADD_EMPLOYEE</h1>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-highest border border-outline-variant/20 rounded-sm px-4 py-2 text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant">
          Employer
          <span className="text-on-surface ml-1 font-bold capitalize">{employerName}</span>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        {/* Back link */}
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant hover:text-[#13f09c] transition-colors mb-8"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
          Back to Team
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Add Employee</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Invite a new team member, generate their onboarding links, and attach compensation details in one step.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main card */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 sm:p-8">
            {!created ? (
              /* ─── FORM ─── */
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      First Name
                    </label>
                    <input
                      autoFocus
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="Prudent"
                      className={`w-full bg-surface border rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition ${
                        errors.firstName ? "border-red-500" : "border-outline-variant/20"
                      }`}
                    />
                    {errors.firstName && <p className="text-red-400 text-[10px] mt-1">{errors.firstName}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Last Name
                    </label>
                    <input
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Harry"
                      className={`w-full bg-surface border rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition ${
                        errors.lastName ? "border-red-500" : "border-outline-variant/20"
                      }`}
                    />
                    {errors.lastName && <p className="text-red-400 text-[10px] mt-1">{errors.lastName}</p>}
                  </div>

                  {/* Work Email */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="prudent@company.com"
                      className={`w-full bg-surface border rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition ${
                        errors.email ? "border-red-500" : "border-outline-variant/20"
                      }`}
                    />
                    {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email}</p>}
                  </div>

                  {/* Country Code */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Country Code{" "}
                      <span className="text-[#13f09c]/50 normal-case">(optional)</span>
                    </label>
                    <input
                      value={form.countryCode}
                      onChange={(e) => handleChange("countryCode", e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="USD"
                      maxLength={2}
                      className="w-full bg-surface border border-outline-variant/20 rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Job Title{" "}
                      <span className="text-[#13f09c]/50 normal-case">(optional)</span>
                    </label>
                    <input
                      value={form.jobTitle}
                      onChange={(e) => handleChange("jobTitle", e.target.value)}
                      placeholder="Operations Manager"
                      className="w-full bg-surface border border-outline-variant/20 rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Department{" "}
                      <span className="text-[#13f09c]/50 normal-case">(optional)</span>
                    </label>
                    <input
                      value={form.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      placeholder="Finance"
                      className="w-full bg-surface border border-outline-variant/20 rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                    />
                  </div>

                  {/* Salary Amount */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Salary Amount{" "}
                      <span className="text-[#13f09c]/50 normal-case">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={form.salaryAmount}
                      onChange={(e) => handleChange("salaryAmount", e.target.value)}
                      placeholder="19000"
                      className="w-full bg-surface border border-outline-variant/20 rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Currency
                    </label>
                    <div className="relative">
                      <select
                        value={form.currency}
                        onChange={(e) => handleChange("currency", e.target.value)}
                        className="w-full appearance-none bg-surface border border-outline-variant/20 rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                      >
                        {["USD", "EUR", "GBP", "NGN", "KES", "GHS", "ZAR", "USDC", "USDT"].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
                    </div>
                  </div>

                  {/* Pay Frequency */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">
                      Pay Frequency
                    </label>
                    <div className="relative">
                      <select
                        value={form.payFrequency}
                        onChange={(e) => handleChange("payFrequency", e.target.value)}
                        className="w-full appearance-none bg-surface border border-outline-variant/20 rounded-sm px-4 py-3 text-sm text-on-surface font-['IBM_Plex_Mono'] focus:outline-none focus:ring-1 focus:ring-[#13f09c] transition"
                      >
                        {["Weekly", "Bi-weekly", "Monthly", "Quarterly"].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <button
                    type="submit"
                    className="flex items-center gap-2 liquid-gradient text-on-primary font-bold px-6 py-3 rounded-sm text-xs uppercase tracking-widest hover:scale-95 transition-transform duration-200"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Create employee
                  </button>
                  <Link
                    href="/dashboard/employees"
                    className="text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            ) : (
              /* ─── SUCCESS ─── */
              <div>
                {/* Success banner */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#13f09c]/20 border border-[#13f09c]/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#13f09c] text-2xl">check_circle</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-on-surface tracking-tight">Employee created</h3>
                    <p className="text-sm text-on-surface-variant">
                      {created.firstName} {created.lastName} is now attached to your team profile and ready for onboarding.
                    </p>
                  </div>
                </div>

                {/* Links grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Invite link */}
                  <div className="bg-surface border border-outline-variant/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-3">
                      <span className="material-symbols-outlined text-[#13f09c] text-base">mail</span>
                      Invite link
                    </div>
                    <p className="text-[11px] font-['IBM_Plex_Mono'] text-on-surface-variant break-all mb-4 leading-relaxed">
                      {created.inviteLink}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant/20 text-on-surface text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest px-3 py-2 rounded-sm transition"
                      >
                        <span className="material-symbols-outlined text-base">{copied ? "check" : "content_copy"}</span>
                        {copied ? "Copied!" : "Copy invite"}
                      </button>
                      <a
                        href={created.inviteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant/20 text-on-surface text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest px-3 py-2 rounded-sm transition"
                      >
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                        Open
                      </a>
                    </div>
                  </div>

                  {/* Bridge KYC */}
                  <div className="bg-surface border border-outline-variant/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-3">
                      <span className="material-symbols-outlined text-[#13f09c] text-base">verified_user</span>
                      Bridge KYC
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed mb-4">
                      KYC link not generated in this environment yet. The employee record was still created.
                    </p>
                    <button className="flex items-center gap-1.5 text-[#13f09c] text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest hover:underline">
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Open KYC link
                    </button>
                  </div>
                </div>

                {/* Next steps */}
                <div className="bg-surface border border-outline-variant/20 rounded-xl p-5 mb-8 text-sm text-on-surface-variant space-y-2 leading-relaxed">
                  <p className="font-semibold text-on-surface mb-3">Next steps</p>
                  <p>
                    Employee record is{" "}
                    <span className="text-[#13f09c]">live</span> in your team directory and can be included in{" "}
                    <span className="text-[#13f09c]">payroll batches</span>.
                  </p>
                  <p>Invite email was not sent automatically in this environment.</p>
                  <p>Bridge KYC can be generated later from the employee record once Bridge is configured.</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => { setCreated(null); setForm({ firstName: "", lastName: "", email: "", countryCode: "NG", jobTitle: "", department: "", salaryAmount: "", currency: "USD", payFrequency: "Monthly" }); }}
                    className="flex items-center gap-2 liquid-gradient text-on-primary font-bold px-6 py-3 rounded-sm text-xs uppercase tracking-widest hover:scale-95 transition-transform duration-200"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Add another employee
                  </button>
                  <Link
                    href="/dashboard/employees"
                    className="text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant hover:text-on-surface border border-outline-variant/20 px-6 py-3 rounded-sm transition"
                  >
                    Return to team
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right info panel */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-8">
            {!created ? (
              <>
                <h3 className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-6">
                  What happens next
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      n: "1",
                      title: "Employee record is created",
                      body: "Locroll stores the team member, compensation metadata, and invite state inside your employer workspace.",
                    },
                    {
                      n: "2",
                      title: "Invite and KYC links are prepared",
                      body: "The API returns a shareable invite link and, when Bridge is configured, a live KYC session for employee verification.",
                    },
                    {
                      n: "3",
                      title: "Payroll can include them immediately",
                      body: "Once the employee completes onboarding, their wallet and compliance status will be ready for Locus payroll execution.",
                    },
                  ].map(({ n, title, body }) => (
                    <div key={n} className="bg-surface border border-outline-variant/10 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-[#13f09c] font-['IBM_Plex_Mono'] text-[10px] mt-0.5">{n}.</span>
                        <div>
                          <p className="text-sm font-bold text-on-surface mb-1">{title}</p>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-6">
                  Invite Summary
                </h3>
                <div className="space-y-5">
                  {[
                    { label: "Name", value: `${created.firstName} ${created.lastName}` },
                    { label: "Email", value: created.email },
                    { label: "Role", value: created.jobTitle || "Not set" },
                    {
                      label: "Compensation",
                      value: created.salaryAmount
                        ? `${created.salaryAmount} ${created.currency} / ${created.payFrequency}`
                        : "Not set",
                    },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-1">
                        {label}
                      </div>
                      <div className="text-sm font-semibold text-on-surface">{value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
