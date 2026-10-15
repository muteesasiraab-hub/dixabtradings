import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createProfile, resolveEmailByIdentifier } from "@/lib/network.functions";
import { ensureProfileFromSignup } from "@/lib/registration";

export const Route = createFileRoute("/login")({ head: () => ({ meta: [
  { title: "Member Sign In — Dixab" }, { name: "description", content: "Sign in to view your Dixab community, payments and earnings." },
  { property: "og:title", content: "Member Sign In — Dixab" }, { property: "og:description", content: "Access your private Dixab member page." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const resolveEmail = useServerFn(resolveEmailByIdentifier);
  const createProfileFn = useServerFn(createProfile);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = form.identifier.includes("@")
        ? form.identifier.trim().toLowerCase()
        : (await resolveEmail({ data: { identifier: form.identifier } })).email;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: form.password });
      if (error) throw error;
      if (data.user) await ensureProfileFromSignup(data.user, createProfileFn);
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New here? <Link to="/register" search={{ ref: "" }} className="text-primary underline">Create an account</Link>
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="member-identifier">Identifier code or email</Label>
            <Input
              id="member-identifier" autoComplete="username"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              placeholder="AIXXXXXX or you@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="member-password">Password</Label>
            <Input
              id="member-password" autoComplete="current-password" type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
      </Card>
    </div>
  );
}
