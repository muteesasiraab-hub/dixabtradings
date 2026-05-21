import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createProfile } from "@/lib/network.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({ ref: (s.ref as string) || "" }),
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(100),
  referralCode: z.string().trim().max(20).optional(),
});

function RegisterPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const createProfileFn = useServerFn(createProfile);
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
      const { error: signErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (signErr) throw signErr;
      // Ensure session
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInErr) throw signInErr;
      }
      const res = await createProfileFn({
        data: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          referralCode: form.referralCode || undefined,
        },
      });
      toast.success(
        res.isFirstUser
          ? "Welcome — you are the founding admin!"
          : "Registered! Pay UGX 50,000 to activate.",
      );
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
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div><Label>Full name</Label><Input value={form.fullName} onChange={update("fullName")} required /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={update("phone")} placeholder="07XX..." required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={update("email")} required /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={update("password")} required /></div>
          <div>
            <Label>Referral code</Label>
            <Input value={form.referralCode} onChange={update("referralCode")} placeholder="DAXXXXXX" className="uppercase" />
            <p className="mt-1 text-xs text-muted-foreground">Required unless you are the very first user.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
