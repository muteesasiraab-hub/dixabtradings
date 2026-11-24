import { ENTRY_FEE } from "@/lib/format";

export type StatementPayment = {
  id: string; amount: number; status: string; reference: string | null;
  created_at: string; approved_at: string | null;
};

export function paymentSummary(payments: ReadonlyArray<Pick<StatementPayment, "amount" | "status" | "reference">>) {
  const approved = payments.filter((p) => p.status === "approved").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "pending" && p.reference?.trim()).reduce((s, p) => s + p.amount, 0);
  return { total: ENTRY_FEE, approved, pending, balance: Math.max(0, ENTRY_FEE - approved), available: Math.max(0, ENTRY_FEE - approved - pending) };
}
