"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const mainNav = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "group", label: "Employees", href: "/dashboard/employees" },
  { icon: "payments", label: "Payroll", href: "/dashboard/payroll" },
  { icon: "account_balance_wallet", label: "Payments", href: "/dashboard/payments" },
  { icon: "verified_user", label: "Compliance", href: "/dashboard/compliance" },
];

const bottomNav = [
  { icon: "terminal", label: "API & Demo", href: "/dashboard/api" },
  { icon: "settings", label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardSidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 z-50 bg-[#070d1f] flex flex-col py-8 font-['IBM_Plex_Mono'] text-xs uppercase tracking-widest border-r border-white/5 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
      <div className="px-8 mb-10 flex items-center justify-between">
        <div>
          <Link href="/" className="text-[#13f09c] font-bold text-lg">LOCROLL</Link>
          <div className="text-[#dce1fb]/30 text-[10px] mt-1 tracking-tighter">V1.0.0-ALPHA</div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-[#dce1fb]/40 hover:text-[#13f09c] transition-colors"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <nav className="flex-1 space-y-0.5">
        {mainNav.map(({ icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-8 py-3 transition-all duration-150 ease-in-out ${
                active
                  ? "bg-[#13f09c]/10 text-[#13f09c] border-r-2 border-[#13f09c]"
                  : "text-[#dce1fb]/50 hover:bg-[#13f09c]/5 hover:text-[#13f09c]"
              }`}
            >
              <span className="material-symbols-outlined mr-4 text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-0.5 border-t border-white/5 pt-4">
        {bottomNav.map(({ icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-8 py-3 transition-all duration-150 ease-in-out ${
                active
                  ? "bg-[#13f09c]/10 text-[#13f09c] border-r-2 border-[#13f09c]"
                  : "text-[#dce1fb]/50 hover:bg-[#13f09c]/5 hover:text-[#13f09c]"
              }`}
            >
              <span className="material-symbols-outlined mr-4 text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
    </>
  );
}
