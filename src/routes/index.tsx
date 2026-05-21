import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-flashdisk.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Users, Coins, Zap, Shield } from "lucide-react";
import { UGX, ENTRY_FEE, EARNING_PER_REFERRAL } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant sm:p-10">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Zap className="h-3.5 w-3.5" /> Sales & Referral Network
            </span>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Dickson×Abbey<br />Netflow
            </h1>
            <p className="text-base/relaxed text-white/85 sm:text-lg">
              Premium flash disks plus a 5-level referral network. Join with {UGX(ENTRY_FEE)} and earn {UGX(EARNING_PER_REFERRAL)} for every member in your downline.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/register">Join the network</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link to="/login">Member login</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img src={heroImg} alt="Premium flash disk" className="mx-auto w-full max-w-sm rounded-2xl object-cover shadow-2xl" />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Coins className="h-5 w-5" /></div>
            <h3 className="font-semibold">Entry fee</h3>
          </div>
          <p className="mt-4 text-3xl font-bold">{UGX(ENTRY_FEE)}</p>
          <p className="mt-1 text-sm text-muted-foreground">One-time. Includes your branded flash disk and access to the referral portal.</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent-foreground"><Users className="h-5 w-5" /></div>
            <h3 className="font-semibold">Earn per referral</h3>
          </div>
          <p className="mt-4 text-3xl font-bold">{UGX(EARNING_PER_REFERRAL)}</p>
          <p className="mt-1 text-sm text-muted-foreground">For every new member anywhere in your 5-level downline.</p>
        </Card>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { n: 1, t: "Join with a referral code", d: "Pay UGX 50,000 to activate your account and receive your flash disk." },
            { n: 2, t: "Share your code (max 3)", d: "Each member can directly refer up to 3 new people." },
            { n: 3, t: "Earn 5 levels deep", d: "UGX 5,000 credited for every signup in your 5-level network." },
          ].map((s) => (
            <Card key={s.n} className="p-5">
              <div className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{s.n}</div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Ready to start earning?</h3>
            <p className="text-sm text-muted-foreground">Get your unique referral code instantly after registration.</p>
          </div>
          <Button asChild size="lg"><Link to="/register">Register now</Link></Button>
        </div>
        <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {["Printable referral card", "Real-time earnings tracking", "Network tree across 5 levels", "Secure member portal"].map((f) => (
            <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {f}</li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5" /> Payments confirmed manually by admin after Mobile Money / cash.</p>
      </section>
    </div>
  );
}
