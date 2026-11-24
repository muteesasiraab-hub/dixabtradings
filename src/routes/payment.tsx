import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyDashboard } from "@/lib/network.functions";
import { Button } from "@/components/ui/button";
import { MemberPayments } from "@/components/MemberPayments";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [
    { title: "Membership Payment — Dixab" },
    { name: "description", content: "Pay your Dixab membership in installments by Airtel or MTN and view your private payment statement." },
    { property: "og:title", content: "Membership Payment — Dixab" },
    { property: "og:description", content: "Complete your Dixab membership payment." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const getDash = useServerFn(getMyDashboard);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setReady(true);
    });
  }, [navigate]);
  const dashQuery = useQuery(queryOptions({ queryKey: ["dashboard"], queryFn: () => getDash(), enabled: ready, refetchInterval: 15000, refetchOnWindowFocus: true }));
  if (!ready || dashQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (dashQuery.isError) return <div role="alert" className="space-y-3"><p className="text-destructive">Your payment statement could not be loaded.</p><Button onClick={() => dashQuery.refetch()}>Retry</Button></div>;
  const data = dashQuery.data;
  if (!data) return <p>No profile found.</p>;
  return <div className="mx-auto max-w-3xl space-y-6">
    <h1 className="text-2xl font-bold">Membership payment</h1>
    <p className="text-sm text-muted-foreground">{data.profile.full_name}</p>
    <MemberPayments payments={data.paymentHistory} active={data.profile.status === "active"} ready={data.installmentsReady} />
    <Button asChild variant="outline"><Link to="/dashboard">My member dashboard</Link></Button>
  </div>;
}
