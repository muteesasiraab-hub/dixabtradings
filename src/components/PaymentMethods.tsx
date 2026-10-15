import { PAYMENT_METHODS } from "@/lib/payment-methods";

export function PaymentMethods() {
  return (
    <dl className="grid gap-3 sm:grid-cols-2" aria-label="Merchant payment methods">
      {PAYMENT_METHODS.map((method) => (
        <div key={method.id} className="border-l-2 border-primary pl-3">
          <dt className="text-sm font-semibold">{method.name}</dt>
          <dd className="mt-1 text-sm text-muted-foreground">Merchant code <span className="font-mono font-semibold text-foreground">{method.code}</span></dd>
        </div>
      ))}
    </dl>
  );
}