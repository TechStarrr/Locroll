"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

interface Transaction {
  id: string;
  created_at: string;
  status: string;
  amount_usdc: string;
  memo: string;
  to_address: string | null;
  recipient_email: string | null;
  category: string;
  tx_hash: string | null;
}

export default function PaymentsPage() {
  const { user, logout } = usePrivy();
  const displayName =
    user?.email?.address ??
    (user?.wallet?.address
      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      : "User");
  const initials = displayName.slice(0, 2).toUpperCase();

  const [balance, setBalance] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/locus/balance").then((r) => r.json()),
      fetch("/api/locus/transactions").then((r) => r.json()),
    ])
      .then(([bal, txs]) => {
        if (bal.success) {
          setBalance(bal.data.balance);
          setWalletAddress(bal.data.wallet_address ?? null);
        }
        if (txs.success) {
          setTransactions(txs.transactions);
        } else {
          setError(txs.error ?? "Failed to load transactions");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  function statusColor(status: string) {
    if (status === "completed" || status === "confirmed") return "text-[#13f09c]";
    if (status === "pending" || status === "queued") return "text-yellow-400";
    return "text-red-400";
  }

  function statusDot(status: string) {
    if (status === "completed" || status === "confirmed") return "bg-[#13f09c]";
    if (status === "pending" || status === "queued") return "bg-yellow-400";
    return "bg-red-400";
  }

  return (
    <main className="relative min-h-screen">
      <header className="sticky top-0 z-20 bg-[#0c1324]/60 backdrop-blur-2xl flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 font-['Geist_Sans'] tracking-tight border-b border-white/5">
        <div>
          <div className="flex items-center text-[10px] text-on-surface-variant font-['IBM_Plex_Mono'] uppercase tracking-widest mb-1">
            <span>Locroll</span>
            <span className="mx-2 text-[#13f09c]/30">/</span>
            <span className="text-[#13f09c]">Payments</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-[#13f09c]">PAYMENTS</h1>
        </div>
        <div className="flex items-center gap-6">
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
            <h2 className="text-2xl font-black tracking-tight text-on-surface">Payment History</h2>
            <p className="text-sm text-on-surface-variant mt-1">All outgoing USDC transactions from your Locus treasury.</p>
          </div>
        </div>

        {/* Treasury balance card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6">
            <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">Treasury Balance</div>
            <div className="text-3xl font-black text-[#13f09c] font-['IBM_Plex_Mono']">
              {balance === null ? "—" : `$${parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC`}
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6">
            <div className="text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-on-surface-variant mb-2">Wallet Address</div>
            {walletAddress ? (
              <div className="text-sm text-on-surface font-['IBM_Plex_Mono'] break-all">{walletAddress}</div>
            ) : (
              <div className="text-sm text-on-surface-variant font-['IBM_Plex_Mono']">—</div>
            )}
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h3 className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-widest text-on-surface-variant">
              Transactions {transactions.length > 0 && `(${transactions.length})`}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-[#13f09c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">error_outline</span>
              <p className="text-sm text-on-surface-variant">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-surface-container border border-outline-variant/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">receipt_long</span>
              </div>
              <h3 className="text-sm font-black text-on-surface mb-1">No transactions yet</h3>
              <p className="text-xs text-on-surface-variant max-w-xs">
                Transactions will appear here after your first payroll run.
              </p>
              <Link href="/dashboard/payroll" className="mt-5 text-[10px] font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#13f09c] hover:underline">
                Run Payroll →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-['IBM_Plex_Mono'] min-w-[640px]">
                <thead className="bg-surface-container">
                  <tr>
                    {["Date", "Recipient", "Amount", "Memo", "Status", "Tx Hash"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-outline-variant/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-on-surface max-w-[180px] truncate">
                        {tx.recipient_email ?? (tx.to_address ? `${tx.to_address.slice(0, 8)}…${tx.to_address.slice(-6)}` : "—")}
                      </td>
                      <td className="px-6 py-4 text-[#13f09c] font-bold whitespace-nowrap">
                        {parseFloat(tx.amount_usdc).toFixed(2)} USDC
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant max-w-[200px] truncate" title={tx.memo}>
                        {tx.memo || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${statusColor(tx.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(tx.status)}`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {tx.tx_hash ? (
                          <a
                            href={`https://basescan.org/tx/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#13f09c]/70 hover:text-[#13f09c] transition-colors"
                          >
                            {tx.tx_hash.slice(0, 8)}…{tx.tx_hash.slice(-6)}
                          </a>
                        ) : (
                          <span className="text-on-surface-variant/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
