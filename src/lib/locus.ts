const LOCUS_API_BASE = process.env.LOCUS_API_BASE ?? "https://api.paywithlocus.com/api";

function getApiKey(): string {
  const key = process.env.LOCUS_PAY_KEY;
  if (!key) throw new Error("LOCUS_PAY_KEY not configured");
  return key;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

export interface LocusBalance {
  usdc_balance: string;
  wallet_address: string;
  chain: string;
}

export interface LocusTransaction {
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

export interface LocusPaymentResult {
  transaction_id: string;
  queue_job_id: string;
  status: string;
  recipient_email?: string;
  to_address?: string;
  amount: number;
  token: string;
  escrow_id?: string;
  expires_at?: string;
}

export async function getBalance(): Promise<LocusBalance> {
  const res = await fetch(`${LOCUS_API_BASE}/pay/balance`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "Failed to fetch balance");
  return json.data as LocusBalance;
}

export async function sendToEmail(
  email: string,
  amount: number,
  memo: string,
  expiresInDays = 30
): Promise<LocusPaymentResult> {
  const res = await fetch(`${LOCUS_API_BASE}/pay/send-email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, amount, memo, expires_in_days: expiresInDays }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "Payment failed");
  return json.data as LocusPaymentResult;
}

export async function sendToAddress(
  toAddress: string,
  amount: number,
  memo: string
): Promise<LocusPaymentResult> {
  const res = await fetch(`${LOCUS_API_BASE}/pay/send`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ to_address: toAddress, amount, memo }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "Payment failed");
  return json.data as LocusPaymentResult;
}

export async function getTransactions(limit = 20): Promise<LocusTransaction[]> {
  const res = await fetch(`${LOCUS_API_BASE}/pay/transactions?limit=${limit}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "Failed to fetch transactions");
  return (json.data?.transactions ?? []) as LocusTransaction[];
}
