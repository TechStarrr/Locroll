"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#13f09c] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#dce1fb]/40">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 h-14 bg-[#070d1f] border-b border-white/5 flex items-center px-4 gap-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-[#dce1fb]/60 hover:text-[#13f09c] transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <Link href="/" className="text-[#13f09c] font-['IBM_Plex_Mono'] font-bold text-sm tracking-widest uppercase">LOCROLL</Link>
      </div>

      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">{children}</div>
    </div>
  );
}
