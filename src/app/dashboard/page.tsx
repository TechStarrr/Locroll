"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import NavItem from "@/components/NavItem";
import StatCard from "@/components/StatCard";
import SectionHeader from "@/components/SectionHeader";

export default function DashboardPage() {
  const { user, logout } = usePrivy();

  const displayName =
    user?.email?.address ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : "User");

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-[#070d1f] flex flex-col py-8 gap-2 font-['IBM_Plex_Mono'] text-xs uppercase tracking-widest">
        <div className="px-8 mb-10">
          <Link href="/" className="text-[#13f09c] font-bold text-lg">REMLO_SYS</Link>
          <div className="text-[#dce1fb]/30 text-[10px] mt-1 tracking-tighter">V2.0.4-LOCKED</div>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center px-8 py-3 bg-[#13f09c]/10 text-[#13f09c] border-r-2 border-[#13f09c] transition-all duration-150 ease-in-out" href="#">
            <span className="material-symbols-outlined mr-4 text-lg">dashboard</span>
            <span>Dashboard</span>
          </a>
          <NavItem icon="group" label="Employees" />
          <NavItem icon="payments" label="Payroll" />
          <NavItem icon="account_balance_wallet" label="Payments" />
          <NavItem icon="verified_user" label="Compliance" />
          <NavItem icon="credit_card" label="Cards" />
        </nav>
        <div className="mt-auto px-8">
          <NavItem icon="settings" label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative min-h-screen">
        <header className="fixed top-0 right-0 left-64 z-40 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-10 py-4 font-['Geist_Sans'] tracking-tight">
          <div className="flex items-center gap-8">
            <div>
              <div className="flex items-center text-[10px] text-on-surface-variant font-['IBM_Plex_Mono'] uppercase tracking-widest mb-1">
                <span>Remlo</span>
                <span className="mx-2 text-[#13f09c]/30">/</span>
                <span className="text-[#13f09c]">Dashboard</span>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-[#13f09c]">DASHBOARD_OVR</h1>
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
              <button className="text-[#dce1fb] hover:text-[#13f09c] transition-colors duration-300">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
            <button className="liquid-gradient text-on-primary font-bold px-6 py-2 rounded-sm text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-95 duration-200">
              <span>Run Payroll</span>
              <span className="material-symbols-outlined text-sm">bolt</span>
            </button>
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

        <div className="pt-28 px-10 pb-12">
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <StatCard title="Treasury Balance" value="$0.00" unit="USD" icon="account_balance" status="ACCOUNT_SYNCED" />
            <StatCard title="Last Payroll Run" value="NO_RECENT_ACTIVITY" italic icon="history" />
            <StatCard title="Team Size" value="0" unit="USERS" icon="groups" pending />
            <StatCard title="Yield Earned" value="$0.00" icon="trending_up" yieldText="3.7% APY" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <SectionHeader title="Recent payroll runs" />
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 border border-[#13f09c]/10">
                  <span className="material-symbols-outlined text-4xl text-[#13f09c]/20">inventory_2</span>
                </div>
                <h3 className="text-xl font-black text-on-surface mb-2 tracking-tight">No payroll runs yet</h3>
                <p className="text-on-surface-variant max-w-sm mb-10 text-sm leading-relaxed">
                  Once your first payroll batch is prepared and submitted, recent runs will show up here for tracking and management.
                </p>
                <button className="bg-surface-container-highest hover:bg-surface-container-high text-[#13f09c] border border-[#13f09c]/20 font-bold px-8 py-3 rounded-sm text-[10px] uppercase tracking-widest transition-all duration-200">
                  Create first payroll
                </button>
              </div>
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

        <footer className="px-10 py-12 border-t border-outline-variant/5 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-on-surface-variant tracking-widest uppercase">© 2024 REMLO TECHNOLOGIES</span>
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
    </div>
  );
}
