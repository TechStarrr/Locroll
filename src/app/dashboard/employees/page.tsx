"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function EmployeesPage() {
  const { user, logout } = usePrivy();

  const displayName =
    user?.email?.address ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : "User");

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <main className="relative min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-10 py-4 font-['Geist_Sans'] tracking-tight border-b border-white/5">
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

      {/* Page content */}
      <div className="px-10 py-10">
        {/* Page title row */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-on-surface">Team</h2>
            <p className="text-sm text-on-surface-variant mt-1">0 employees · manage your team</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-outline-variant/30 text-on-surface bg-surface-container-highest hover:bg-surface-container-high px-5 py-2.5 rounded-sm text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest transition-all duration-200">
              <span className="material-symbols-outlined text-base">upload</span>
              Upload CSV
            </button>
            <button className="flex items-center gap-2 liquid-gradient text-on-primary font-bold px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest hover:scale-95 duration-200">
              <span className="material-symbols-outlined text-base">person_add</span>
              Add Employee
            </button>
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl flex flex-col items-center justify-center text-center py-32">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 border border-[#13f09c]/10">
            <span className="material-symbols-outlined text-4xl text-[#13f09c]/30">group</span>
          </div>
          <h3 className="text-lg font-black text-on-surface mb-2 tracking-tight">Add your first team member</h3>
          <p className="text-on-surface-variant max-w-sm mb-10 text-sm leading-relaxed">
            Invite employees to onboard onto Locroll for gasless, instant cross-border payroll.
          </p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 border border-outline-variant/30 text-on-surface bg-surface-container-highest hover:bg-surface-container-high px-5 py-2.5 rounded-sm text-xs font-['IBM_Plex_Mono'] uppercase tracking-widest transition-all duration-200">
              <span className="material-symbols-outlined text-base">upload</span>
              Upload CSV
            </button>
            <button className="flex items-center gap-2 liquid-gradient text-on-primary font-bold px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest hover:scale-95 duration-200">
              <span className="material-symbols-outlined text-base">person_add</span>
              Add Employee
            </button>
          </div>
        </div>
      </div>

      <footer className="px-10 py-8 border-t border-outline-variant/5 flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
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
