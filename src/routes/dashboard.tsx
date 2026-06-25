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
import { ReferralCard } from "@/components/ReferralCard";
import { UGX, ENTRY_FEE, EARNING_PER_REFERRAL } from "@/lib/format";
import { Copy, Users, Wallet, Network, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getDash = useServerFn(getMyDashboard);
  const submitRef = useServerFn(submitPaymentReference);
  const [ready, setReady] = useState(false);

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
    }),
  );

  const [ref, setRef] = useState("");
  const refMut = useMutation({
    mutationFn: (reference: string) => submitRef({ data: { reference } }),
    onSuccess: () => {
      toast.success("Payment reference submitted. Awaiting admin approval.");
      setRef("");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready || dashQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const data = dashQuery.data;
  if (!data) return <p>No profile found.</p>;

  const { profile, levels, earnings, totalEarnings, latestPayment, isAdmin, directCount } = data;
  const isActive = profile.status === "active";

  const copyLink = () => {
    const url = `${window.location.origin}/register?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(url);
    toast.success("Identifier link copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {profile.full_name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">{profile.email} · {profile.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin"><ShieldCheck className="mr-1 h-4 w-4" /> Admin</Link>
            </Button>
          )}
          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Pending payment"}</Badge>
        </div>
      </div>

      {!isActive && (
        <Card className="border-accent/40 bg-accent/10 p-5">
          <h3 className="font-semibold">Activate your account</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay {UGX(ENTRY_FEE)} via Mobile Money to the admin and submit your transaction reference below.
            Earnings start flowing once approved.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); if (ref.trim()) refMut.mutate(ref.trim()); }}
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="MoMo transaction ID / reference" />
            <Button type="submit" disabled={refMut.isPending}>Submit</Button>
          </form>
          {latestPayment?.reference && (
            <p className="mt-2 text-xs text-muted-foreground">Submitted: <span className="font-mono">{latestPayment.reference}</span></p>
          )}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4" /> Total earnings</div>
          <p className="mt-2 text-2xl font-bold">{UGX(totalEarnings)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{earnings.length} credits · {UGX(EARNING_PER_REFERRAL)} each</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> Direct identifiers</div>
          <p className="mt-2 text-2xl font-bold">{directCount} <span className="text-sm font-normal text-muted-foreground">/ 3</span></p>
          <p className="mt-1 text-xs text-muted-foreground">{3 - directCount} slot(s) remaining</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Network className="h-4 w-4" /> Community size</div>
          <p className="mt-2 text-2xl font-bold">{levels.reduce((s, l) => s + l.members.length, 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">across 5 levels</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <ReferralCard name={profile.full_name} code={profile.referral_code} phone={profile.phone} />

        <Card className="p-5 no-print">
          <h3 className="font-semibold">Share your link</h3>
          <div className="mt-3 flex gap-2">
            <Input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${profile.referral_code}`} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Anyone who registers via this link will be placed under you.</p>
        </Card>
      </div>

      <Card className="p-5 no-print">
        <h3 className="font-semibold">Your 5-level community</h3>
        <div className="mt-4 space-y-4">
          {levels.every((l) => l.members.length === 0) && (
            <p className="text-sm text-muted-foreground">No members yet. Share your identifier code to start building your community.</p>
          )}
          {levels.map((lvl) =>
            lvl.members.length === 0 ? null : (
              <div key={lvl.level}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Level {lvl.level} · {lvl.members.length} member(s)</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {lvl.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                      <div>
                        <p className="text-sm font-medium">{m.full_name}</p>
                        <p className="text-xs text-muted-foreground">{m.phone}</p>
                      </div>
                      <Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </Card>

      <Card className="p-5 no-print">
        <h3 className="font-semibold">Earnings history</h3>
        {earnings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No earnings yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {earnings.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <span>Level {e.level} · {new Date(e.created_at).toLocaleDateString()}</span>
                <span className="font-semibold text-success">+{UGX(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
