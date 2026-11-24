import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentMethods } from "@/components/PaymentMethods";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods";
import { paymentSummary, type StatementPayment } from "@/lib/payment-summary";
import { submitPaymentReference } from "@/lib/network.functions";
import { UGX } from "@/lib/format";

export function MemberPayments({ payments, active, ready }: { payments: StatementPayment[]; active: boolean; ready: boolean }) {
  const summary = paymentSummary(payments);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("airtel");
  const submit = useServerFn(submitPaymentReference);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => submit({ data: { amount: Number(amount), reference: reference.trim(), method } }),
    onSuccess: () => { setAmount(""); setReference(""); toast.success("Installment submitted for director approval."); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["portal"] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const records = payments.filter((payment) => payment.reference || payment.status === "approved" || payment.status === "rejected");
  return <section className="space-y-5 border-y border-border py-5" aria-label="Membership payments">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Payment statement</h2>
      <Button variant="outline" size="icon" title="Print payment statement" aria-label="Print payment statement" className="no-print" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
    </div>
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[["Membership total", summary.total], ["Approved payments", summary.approved], ["Awaiting approval", summary.pending], ["Balance due", summary.balance]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-semibold">{UGX(Number(value))}</dd></div>)}
    </dl>
    {!active && <div className="space-y-4 no-print">
      <p className="text-sm text-muted-foreground">Pay in installments or in full. Your referral code and membership activate only after directors approve the full {UGX(summary.total)}. Partial payments do not use referral slots.</p>
      {!ready ? <p role="status" className="text-sm font-medium">Installment payments are awaiting company setup. Please contact a director before making an installment payment.</p> : summary.available > 0 ? <>
        <PaymentMethods />
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
          <div><label className="mb-1 block text-sm" htmlFor="installment-amount">Amount paid (UGX)</label><Input id="installment-amount" type="number" inputMode="numeric" min={1} max={summary.available} step={1} required value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
          <div><label className="mb-1 block text-sm" htmlFor="installment-method">Payment method</label><select id="installment-method" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>{PAYMENT_METHODS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-sm" htmlFor="installment-reference">Transaction reference</label><Input id="installment-reference" required minLength={2} maxLength={70} value={reference} onChange={(event) => setReference(event.target.value)} /></div>
          <p className="text-xs text-muted-foreground sm:col-span-2">Remaining to submit: {UGX(summary.available)}. Payments awaiting approval are excluded from this amount.</p>
          <Button type="submit" disabled={mutation.isPending} className="sm:col-span-2">{mutation.isPending ? "Submitting…" : "Submit installment"}</Button>
        </form>
      </> : <p className="text-sm font-medium">Full amount submitted — awaiting director approval.</p>}
    </div>}
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Transaction</th><th className="py-2 pr-3">Amount</th><th className="py-2">Status</th></tr></thead>
      <tbody>{records.map((payment) => <tr key={payment.id} className="border-t border-border"><td className="py-3 pr-3 whitespace-nowrap">{new Date(payment.created_at).toLocaleDateString()}{payment.approved_at && <p className="text-xs text-muted-foreground">Approved {new Date(payment.approved_at).toLocaleDateString()}</p>}</td><td className="max-w-48 break-words py-3 pr-3">{payment.reference ?? "—"}</td><td className="py-3 pr-3 whitespace-nowrap">{UGX(payment.amount)}</td><td className="py-3"><Badge variant={payment.status === "approved" ? "default" : payment.status === "rejected" ? "destructive" : "secondary"}>{payment.status === "pending" ? "Awaiting approval" : payment.status}</Badge></td></tr>)}
      {records.length === 0 && <tr><td className="py-4 text-muted-foreground" colSpan={4}>No installments submitted yet.</td></tr>}</tbody></table>
    </div>
  </section>;
}
