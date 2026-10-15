import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { directorLogin, directorLogout, getDirectorOverview, directorApprovePayment, directorRejectPayment, directorRecordPayout } from "@/lib/director.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UGX } from "@/lib/format";

export const Route = createFileRoute("/directors")({
  head: () => ({
    meta: [
      { title: "Directors' Portal — Dixab General Tradings Co. Ltd" },
      { name: "description", content: "Private overview of all Dixab members for the company directors." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Directors' Portal — Dixab" },
      { property: "og:description", content: "Private directors' dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => getDirectorOverview(),
  component: DirectorsPage,
});

function DirectorsPage() {
  const data = Route.useLoaderData();
  return data.authed ? <Overview data={data} /> : <LoginForm />;
}

function LoginForm() {
  const router = useRouter();
  const login = useServerFn(directorLogin);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", password: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await login({ data: form });
      if (!r.ok) toast.error("Incorrect name or password");
      else await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Directors' Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your full name and password.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="director-name">Full name</Label>
            <Input id="director-name" autoComplete="username" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Muteesasira Abbey" required />
          </div>
          <div>
            <Label htmlFor="director-password">Password</Label>
            <Input id="director-password" autoComplete="current-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
      </Card>
    </div>
  );
}

type OverviewData = Extract<Awaited<ReturnType<typeof getDirectorOverview>>, { authed: true }>;

function Overview({ data }: { data: OverviewData }) {
  const router = useRouter();
  const logout = useServerFn(directorLogout);
  const approve = useServerFn(directorApprovePayment);
  const reject = useServerFn(directorRejectPayment);
  const recordPayout = useServerFn(directorRecordPayout);
  const [tab, setTab] = useState<"members" | "payments" | "payouts">("payments");
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [pay, setPay] = useState<{ userId: string; amount: string; method: string; reference: string }>({ userId: "", amount: "", method: "Mobile Money", reference: "" });

  const run = async (key: string, fn: () => Promise<unknown>, msg: string) => {
    setBusy(key);
    try { await fn(); toast.success(msg); await router.invalidate(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Action failed"); }
    finally { setBusy(null); }
  };

  const list = data.members.filter((m) =>
    [m.full_name, m.phone, m.email, m.referral_code].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  const stats = [
    ["Total members", String(data.stats.total)],
    ["Active", String(data.stats.active)],
    ["Not yet active", String(data.stats.pending)],
    ["Payments awaiting approval", String(data.stats.pendingPayments)],
    ["Approved payments", UGX(data.stats.revenue)],
    ["Earnings owed to members", UGX(data.stats.paidOut)],
    ["Paid out to members", UGX(data.stats.disbursed)],
    ["Balance still owed", UGX(data.stats.paidOut - data.stats.disbursed)],
  ];
  const tabs = [["payments", "Payments"], ["payouts", "Payouts"], ["members", "Members"]] as const;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Directors' Dashboard</h1>
          <p className="text-sm capitalize text-muted-foreground">Signed in as {data.director}</p>
          {"error" in data && data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
        </div>
        <Button variant="outline" onClick={async () => { await logout(); await router.invalidate(); }}>Sign out</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <Card key={k} className="p-4">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="mt-1 text-lg font-bold">{v}</div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        {tabs.map(([k, l]) => (
          <Button key={k} variant={tab === k ? "default" : "outline"} size="sm" onClick={() => setTab(k)}>{l}</Button>
        ))}
      </div>

      {tab === "payments" && (
        <Card className="p-4">
          <h2 className="font-semibold">Member payments</h2>
          <p className="text-xs text-muted-foreground">Approving a verified transaction activates the member and credits UGX 10,000 to each active member up to 5 levels above.</p>
          <div className="mt-4 space-y-3">
            {data.payments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <div>
                  <p className="font-medium">{p.member}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}{p.reference ? ` · Ref ${p.reference}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{UGX(p.amount)}</span>
                  <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>{p.status}</Badge>
                  {p.status === "pending" && (
                    <>
                      <Button size="sm" disabled={!!busy || !p.reference} title={!p.reference ? "Member must submit a transaction reference first" : "Approve verified payment"} onClick={() => run(p.id, () => approve({ data: { paymentId: p.id } }), "Payment approved")}>Approve</Button>
                      <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run(p.id, () => reject({ data: { paymentId: p.id } }), "Payment rejected")}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {data.payments.length === 0 && <p className="text-sm text-muted-foreground">No payments yet.</p>}
          </div>
        </Card>
      )}

      {tab === "payouts" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="font-semibold">Record a payout</h2>
            {!data.payoutsReady && <p className="text-sm text-destructive">Payout records aren't set up in the database yet.</p>}
            <form className="mt-3 grid gap-3 md:grid-cols-5" onSubmit={(e) => {
              e.preventDefault();
              const amount = Number(pay.amount);
              if (!pay.userId || !amount) { toast.error("Choose a member and amount"); return; }
              run("payout", () => recordPayout({ data: { userId: pay.userId, amount, method: pay.method || undefined, reference: pay.reference || undefined } }), "Payout recorded")
                .then(() => setPay({ ...pay, amount: "", reference: "" }));
            }}>
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm md:col-span-2" value={pay.userId} onChange={(e) => {
                const b = data.balances.find((x) => x.id === e.target.value);
                setPay({ ...pay, userId: e.target.value, amount: b && b.balance > 0 ? String(b.balance) : pay.amount });
              }}>
                <option value="">Select member…</option>
                {data.balances.map((b) => <option key={b.id} value={b.id}>{b.full_name} — owed {UGX(b.balance)}</option>)}
              </select>
              <Input type="number" placeholder="Amount (UGX)" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
              <Input placeholder="Method" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} />
              <Input placeholder="Reference" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
              <Button type="submit" className="md:col-span-5" disabled={!!busy}>Record payout</Button>
            </form>
          </Card>
          <Card className="p-4 overflow-x-auto">
            <h2 className="font-semibold">Member balances</h2>
            <table className="mt-2 w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-2">Member</th><th className="p-2">Earned</th><th className="p-2">Paid</th><th className="p-2">Owed</th></tr></thead>
              <tbody>
                {data.balances.map((b) => (
                  <tr key={b.id} className="border-t border-border"><td className="p-2">{b.full_name}<div className="text-xs text-muted-foreground">{b.phone}</div></td><td className="p-2">{UGX(b.earned)}</td><td className="p-2">{UGX(b.paid)}</td><td className="p-2 font-semibold">{UGX(b.balance)}</td></tr>
                ))}
                {data.balances.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No earnings yet</td></tr>}
              </tbody>
            </table>
          </Card>
          <Card className="p-4 overflow-x-auto">
            <h2 className="font-semibold">Payout history</h2>
            <table className="mt-2 w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-2">Date</th><th className="p-2">Member</th><th className="p-2">Amount</th><th className="p-2">Method</th><th className="p-2">Ref</th><th className="p-2">By</th></tr></thead>
              <tbody>
                {data.payouts.map((p) => (
                  <tr key={p.id} className="border-t border-border"><td className="p-2">{new Date(p.created_at).toLocaleDateString()}</td><td className="p-2">{p.member}</td><td className="p-2">{UGX(p.amount)}</td><td className="p-2">{p.method}</td><td className="p-2">{p.reference}</td><td className="p-2 capitalize">{p.paid_by}</td></tr>
                ))}
                {data.payouts.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No payouts yet</td></tr>}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "members" && (
      <Card className="p-4">
        <Input placeholder="Search name, phone, email or code" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Code</th><th className="p-2">Sponsor</th><th className="p-2">Directs</th><th className="p-2">Earnings</th><th className="p-2">Status</th><th className="p-2">Joined</th></tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="p-2 font-medium">{m.full_name}<div className="text-xs text-muted-foreground">{m.email}</div></td>
                  <td className="p-2">{m.phone}</td>
                  <td className="p-2 font-mono">{m.referral_code}</td>
                  <td className="p-2">{m.sponsor_name}</td>
                  <td className="p-2">{m.directs}/3</td>
                  <td className="p-2">{UGX(m.earnings)}</td>
                  <td className="p-2"><Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge></td>
                  <td className="p-2">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">No members found</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}
