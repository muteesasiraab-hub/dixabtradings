import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { directorLogin, directorLogout, getDirectorOverview } from "@/lib/director.functions";
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
            <Label>Full name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Muteesasira Abbey" required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
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
  const [q, setQ] = useState("");
  const list = data.members.filter((m) =>
    [m.full_name, m.phone, m.email, m.referral_code].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  const stats = [
    ["Total members", String(data.stats.total)],
    ["Active", String(data.stats.active)],
    ["Pending", String(data.stats.pending)],
    ["Approved payments", UGX(data.stats.revenue)],
    ["Earnings paid out", UGX(data.stats.paidOut)],
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Directors' Overview</h1>
          <p className="text-sm capitalize text-muted-foreground">Signed in as {data.director}</p>
          {"error" in data && data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
        </div>
        <Button variant="outline" onClick={async () => { await logout(); await router.invalidate(); }}>Sign out</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(([k, v]) => (
          <Card key={k} className="p-4">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="mt-1 text-lg font-bold">{v}</div>
          </Card>
        ))}
      </div>
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
    </div>
  );
}
