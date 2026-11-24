import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createProfile, getMyDashboard } from "@/lib/network.functions";
import { ensureProfileFromSignup } from "@/lib/registration";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberPayments } from "@/components/MemberPayments";
import { Badge } from "@/components/ui/badge";
import { ReferralCard } from "@/components/ReferralCard";
import { UGX, EARNING_PER_REFERRAL } from "@/lib/format";
import { Copy, Users, Wallet, Network, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ head: () => ({ meta: [
  { title: "My Community & Payments — Dixab" }, { name: "description", content: "Your Dixab membership, five-level community, payment history and earnings." },
  { property: "og:title", content: "My Community & Payments — Dixab" }, { property: "og:description", content: "Your private Dixab member overview." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
] }), component: DashboardPage });

function DashboardPage() {
  const navigate = useNavigate();
  const getDash = useServerFn(getMyDashboard);
  const createProfileFn = useServerFn(createProfile);
  const [ready, setReady] = useState(false);
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else {
        try {
          await ensureProfileFromSignup(data.session.user, createProfileFn);
          setReady(true);
        } catch (error) {
          setSetupError(error instanceof Error ? error.message : "Registration could not be completed");
        }
      }
    });
  }, [navigate, createProfileFn]);

  const dashQuery = useQuery(
    queryOptions({
      queryKey: ["dashboard"],
      queryFn: () => getDash(),
      enabled: ready,
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
    }),
  );

  if (setupError) return <div role="alert" className="space-y-3"><h1 className="text-xl font-semibold">Registration needs attention</h1><p className="text-sm text-destructive">{setupError}</p><Button onClick={() => window.location.reload()}>Try again</Button></div>;
  if (dashQuery.isError) return <div role="alert" className="space-y-3"><p className="text-destructive">Your member details could not be loaded. Please try again.</p><Button onClick={() => dashQuery.refetch()}>Retry</Button></div>;
  if (!ready || dashQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const data = dashQuery.data;
  if (!data) return <p>No profile found.</p>;

  const { profile, levels, earnings, totalEarnings, latestPayment, isAdmin, directCount } = data;
  const isActive = profile.status === "active";
  const isRejected = profile.status === "rejected" || latestPayment?.status === "rejected";

  const copyLink = () => {
    if (!isActive || !profile.referral_code) return;
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
          <Button asChild variant="outline" size="sm">
            <Link to="/portal"><Network className="mr-1 h-4 w-4" /> Client Portal</Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin"><ShieldCheck className="mr-1 h-4 w-4" /> Admin</Link>
            </Button>
          )}
          <Badge variant={isActive ? "default" : isRejected ? "destructive" : "secondary"}>{isActive ? "Active" : isRejected ? "Payment rejected" : "Pending payment"}</Badge>
        </div>
      </div>

      <MemberPayments payments={data.paymentHistory} active={isActive} ready={data.installmentsReady} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4" /> Total earnings</div>
          <p className="mt-2 text-2xl font-bold">{UGX(totalEarnings)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{earnings.length} credits · {UGX(EARNING_PER_REFERRAL)} each</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> Direct identifiers</div>
          <p className="mt-2 text-2xl font-bold">{directCount} <span className="text-sm font-normal text-muted-foreground">/ 3</span></p>
          <p className="mt-1 text-xs text-muted-foreground">{Math.max(0, 3 - directCount)} slot(s) remaining · approved members only</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Network className="h-4 w-4" /> Community size</div>
          <p className="mt-2 text-2xl font-bold">{levels.reduce((s, l) => s + l.members.length, 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">across 5 levels</p>
        </Card>
      </div>

      {isActive && profile.referral_code ? <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <ReferralCard name={profile.full_name} code={profile.referral_code} phone={profile.phone} />

        <Card className="p-5 no-print">
          <h3 className="font-semibold">Share your link</h3>
          <div className="mt-3 flex gap-2">
            <Input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${profile.referral_code}`} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Anyone who registers via this link will be placed under you.</p>
        </Card>
      </div> : <section className="border-y border-border py-5"><h2 className="font-semibold">Your identifier code</h2><p className="mt-2 text-sm text-muted-foreground">Available after directors approve your full membership payment. Pending registrations do not use any of your three referral slots.</p></section>}

      <Card className="p-5 no-print">
        <h3 className="font-semibold">Your 5-level community</h3>
        <div className="mt-4 space-y-4">
          {levels.every((l) => l.members.length === 0) && (
            <p className="text-sm text-muted-foreground">{isActive ? "No members yet. Share your identifier code to start building your community." : "Your community begins after payment approval."}</p>
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
