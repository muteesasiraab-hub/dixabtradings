import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerMemberAccount } from "@/lib/network.functions";
import { PaymentMethods } from "@/components/PaymentMethods";
import { ENTRY_FEE, UGX } from "@/lib/format";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({ ref: (s.ref as string) || "" }),
  head: () => ({ meta: [
    { title: "Member Registration — Dixab" },
    { name: "description", content: "Register with your sponsor’s identifier code and submit your merchant payment for verification." },
    { property: "og:title", content: "Member Registration — Dixab" },
    { property: "og:description", content: "Join the Dixab community and manage your member payments." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  referralCode: z.string().trim().max(20).optional(),
});

function RegisterPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const register = useServerFn(registerMemberAccount);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    referralCode: ref || "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await register({ data: parsed.data });
      const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email.toLowerCase(), password: parsed.data.password });
      if (error) {
        toast.success("Account registered. Please sign in to view your payment details.");
        navigate({ to: "/login" });
        return;
      }
      toast.success("Registered. Submit your payment reference for director approval.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
      // If profile creation failed, sign out to avoid orphaned session
      if (!String(msg).toLowerCase().includes("already")) {
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Already registered? <Link to="/login" className="text-primary underline">Log in</Link>
        </p>
        <div className="mt-5 space-y-3 border-y border-border py-4"><p className="text-sm font-semibold">Entry product · {UGX(ENTRY_FEE)}</p><PaymentMethods /><p className="text-xs text-muted-foreground">After registration, submit your transaction reference on your member page. Your account is activated after a director verifies payment.</p></div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div><Label>Full name</Label><Input value={form.fullName} onChange={update("fullName")} required /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={update("phone")} placeholder="07XX..." required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={update("email")} required /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={update("password")} required /></div>
          <div>
            <Label>Identifier code</Label>
            <Input value={form.referralCode} onChange={update("referralCode")} placeholder="DAXXXXXX" className="uppercase" required />
            <p className="mt-1 text-xs text-muted-foreground">Use the identifier code given to you by your sponsor.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
