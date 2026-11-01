import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyDashboard, submitPaymentReference } from "@/lib/network.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentMethods } from "@/components/PaymentMethods";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods";
import { UGX, ENTRY_FEE } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [
    { title: "Membership Payment — Dixab" },
    { name: "description", content: "Pay your Dixab entry product by Airtel Money or MTN Mobile Money and submit your transaction reference for director approval." },
    { property: "og:title", content: "Membership Payment — Dixab" },
    { property: "og:description", content: "Complete your Dixab membership payment." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getDash = useServerFn(getMyDashboard);
  const submitRef = useServerFn(submitPaymentReference);
  const [ready, setReady] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("airtel");
  const [ref, setRef] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setReady(true);
    });
  }, [navigate]);

  const dashQuery = useQuery(
    queryOptions({
      queryKey: ["dashboard"],
      queryFn: () => getDash(),
      enabled: ready,
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    }),
  );

  const refMut = useMutation({
    mutationFn: (reference: string) => submitRef({ data: { reference, method } }),
    onSuccess: () => {
      toast.success("Payment reference submitted. Awaiting director approval.");
      setRef("");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || dashQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (dashQuery.isError) return <div role="alert" className="space-y-3"><p className="text-destructive">Your payment details could not be loaded. Please try again.</p><Button onClick={() => dashQuery.refetch()}>Retry</Button></div>;
  const data = dashQuery.data;
  if (!data) return <p>No profile found.</p>;

  const { profile, latestPayment } = data;
  const isActive = profile.status === "active";
  const isRejected = profile.status === "rejected" || latestPayment?.status === "rejected";
  const awaitingApproval = !isActive && !isRejected && !!latestPayment?.reference;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Membership payment</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hello {profile.full_name.split(" ")[0]} — one last step to activate your account.</p>
      </div>

      {isActive ? (
        <Card className="space-y-3 p-6 text-center">
          <Badge>Active</Badge>
          <p className="text-sm text-muted-foreground">Your account is active. Your community and earnings are on your member page.</p>
          <Button asChild><Link to="/dashboard">Go to my member page</Link></Button>
        </Card>
      ) : awaitingApproval ? (
        <Card className="space-y-3 p-6">
          <Badge variant="secondary">Awaiting director approval</Badge>
          <p className="text-sm text-muted-foreground">
            Your payment reference <span className="font-mono">{latestPayment?.reference}</span> was submitted.
            A director will verify your payment and activate your account. This page updates automatically.
          </p>
          <Button asChild variant="outline"><Link to="/dashboard">View my member page</Link></Button>
        </Card>
      ) : (
        <Card className="border-accent/40 bg-accent/10 p-5">
          {isRejected && <p role="alert" className="mb-3 text-sm text-destructive">Your previous payment could not be verified. Please pay again and submit the new transaction reference.</p>}
          <h3 className="font-semibold">Pay {UGX(latestPayment?.amount ?? ENTRY_FEE)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Send the exact amount to one of the company merchant codes below, then enter the transaction reference from your phone.</p>
          <div className="mt-4"><PaymentMethods /></div>
          <form onSubmit={(e) => { e.preventDefault(); if (ref.trim()) refMut.mutate(ref.trim()); }} className="mt-4 space-y-2">
            <select aria-label="Payment method" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <Input aria-label="Transaction reference" maxLength={70} required value={ref} onChange={(e) => setRef(e.target.value)} placeholder="MoMo transaction ID / reference" />
            <Button type="submit" className="w-full" disabled={refMut.isPending}>{refMut.isPending ? "Submitting…" : "Submit payment reference"}</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Your account is activated after a director verifies your payment.</p>
        </Card>
      )}
    </div>
  );
}
