"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

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
      <DashboardSidebar />
      <div className="flex-1 ml-64">{children}</div>
    </div>
  );
}
