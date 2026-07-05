import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyDashboard } from "@/lib/network.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UGX, EARNING_PER_REFERRAL } from "@/lib/format";
import { Users, Wallet, Network, TrendingUp, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
  head: () => ({
    meta: [
      { title: "Client Portal · Abbdix" },
      { name: "description", content: "Track your 5-level referral network and earnings breakdown." },
    ],
  }),
});

function PortalPage() {
  const navigate = useNavigate();
  const getDash = useServerFn(getMyDashboard);
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

  if (!ready || dashQuery.isLoading)
    return <p className="text-sm text-muted-foreground">Loading your portal…</p>;
  const data = dashQuery.data;
  if (!data) return <p>No profile found.</p>;

  const { profile, levels, earnings, totalEarnings } = data;

  // Earnings breakdown per level
  const perLevel = [1, 2, 3, 4, 5].map((lvl) => {
    const rows = earnings.filter((e) => e.level === lvl);
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const members = levels.find((l) => l.level === lvl)?.members ?? [];
    return { level: lvl, count: rows.length, total, members };
  });

  const totalMembers = levels.reduce((s, l) => s + l.members.length, 0);
  const activeMembers = levels.reduce(
    (s, l) => s + l.members.filter((m) => m.status === "active").length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Network className="h-3.5 w-3.5" /> Client Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.full_name}'s Network
          </h1>
          <p className="text-sm text-muted-foreground">
            Code <span className="font-mono font-semibold text-foreground">{profile.referral_code}</span>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> Dashboard</Link>
        </Button>
      </div>

      {/* Top summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-4 w-4" /> Total earnings</div>
          <p className="mt-2 text-2xl font-bold">{UGX(totalEarnings)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-4 w-4" /> Community</div>
          <p className="mt-2 text-2xl font-bold">{totalMembers}</p>
          <p className="mt-1 text-xs text-muted-foreground">{activeMembers} active</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-4 w-4" /> Credits</div>
          <p className="mt-2 text-2xl font-bold">{earnings.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{UGX(EARNING_PER_REFERRAL)} each</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Network className="h-4 w-4" /> Depth</div>
          <p className="mt-2 text-2xl font-bold">{perLevel.filter((l) => l.members.length > 0).length}/5</p>
          <p className="mt-1 text-xs text-muted-foreground">levels reached</p>
        </Card>
      </div>

      {/* Earnings breakdown by level */}
      <Card className="p-5">
        <h2 className="text-lg font-semibold">Earnings breakdown by level</h2>
        <p className="text-sm text-muted-foreground">You earn {UGX(EARNING_PER_REFERRAL)} for every activated member across 5 levels below you.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Level</th>
                <th className="py-2 pr-4">Members</th>
                <th className="py-2 pr-4">Credits</th>
                <th className="py-2 pr-4 text-right">Earned</th>
              </tr>
            </thead>
            <tbody>
              {perLevel.map((row) => {
                const pct = totalEarnings > 0 ? (row.total / totalEarnings) * 100 : 0;
                return (
                  <tr key={row.level} className="border-b border-border/60">
                    <td className="py-3 pr-4">
                      <Badge variant="outline">L{row.level}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {row.members.length}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({row.members.filter((m) => m.status === "active").length} active)
                      </span>
                    </td>
                    <td className="py-3 pr-4">{row.count}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="font-semibold text-success">{UGX(row.total)}</div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="py-3 pr-4 font-semibold" colSpan={3}>Total</td>
                <td className="py-3 pr-4 text-right font-bold text-success">{UGX(totalEarnings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Network tree */}
      <Card className="p-5">
        <h2 className="text-lg font-semibold">Referral network · 5 levels</h2>
        <div className="mt-4 space-y-5">
          {perLevel.every((l) => l.members.length === 0) && (
            <p className="text-sm text-muted-foreground">Your network is empty. Share your code to start building it.</p>
          )}
          {perLevel.map((lvl) =>
            lvl.members.length === 0 ? null : (
              <div key={lvl.level} className="relative">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {lvl.level}
                  </div>
                  <div className="text-sm font-semibold">Level {lvl.level}</div>
                  <div className="text-xs text-muted-foreground">
                    · {lvl.members.length} member{lvl.members.length === 1 ? "" : "s"} · {UGX(lvl.total)} earned
                  </div>
                </div>
                <div
                  className="ml-3 border-l-2 border-dashed border-border pl-4"
                  style={{ marginLeft: `${(lvl.level - 1) * 12}px` }}
                >
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {lvl.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{m.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.phone}</p>
                        </div>
                        <Badge variant={m.status === "active" ? "default" : "secondary"}>
                          {m.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}
