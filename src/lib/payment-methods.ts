export const PAYMENT_METHODS = [
  { id: "airtel", name: "Airtel Money", code: "4428053" },
  { id: "mtn", name: "MTN Mobile Money", code: "75087507" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

export function paymentReference(method: PaymentMethod, reference: string) {
  const provider = PAYMENT_METHODS.find((item) => item.id === method);
  if (!provider) throw new Error("Choose a payment method");
  return `${provider.name} · ${reference.trim()}`;
}