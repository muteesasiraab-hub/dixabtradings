import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-flashdisk.jpg";
import dicksonAsset from "@/assets/dickson.jpg.asset.json";
import muteesasiraAsset from "@/assets/muteesasira.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Coins, Zap, Shield, Award, TrendingUp, Package, Headphones, Globe, Star, ChevronRight, BarChart3, Lock, Clock, HandCoins } from "lucide-react";
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
              Abbdix<br />investments
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

      {/* TRUST BADGES */}
      <section className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        <Badge variant="secondary" className="gap-1 px-3 py-1.5"><Shield className="h-3.5 w-3.5" /> Verified Network</Badge>
        <Badge variant="secondary" className="gap-1 px-3 py-1.5"><Users className="h-3.5 w-3.5" /> 5-Level Deep</Badge>
        <Badge variant="secondary" className="gap-1 px-3 py-1.5"><Lock className="h-3.5 w-3.5" /> Secure Portal</Badge>
        <Badge variant="secondary" className="gap-1 px-3 py-1.5"><Globe className="h-3.5 w-3.5" /> Uganda Based</Badge>
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
            { n: 1, t: "Join with a referral code", d: "Pay UGX 60,000 to activate your account and receive your flash disk." },
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

      {/* EARNINGS CALCULATOR */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Earnings potential</h2>
        <p className="mt-1 text-sm text-muted-foreground">Simulate your monthly income based on network growth.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          {[
            { label: "3 direct × 5 levels", val: UGX(1215000), note: "Full tree fill" },
            { label: "2 direct × 5 levels", val: UGX(620000), note: "Moderate growth" },
            { label: "1 direct × 5 levels", val: UGX(155000), note: "Steady start" },
            { label: "Direct only", val: UGX(15000), note: "3 referrals" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">{item.val}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground/70">{item.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">* Figures are illustrative. Actual earnings depend on active network growth and member activations.</p>
      </section>

      {/* WHY Abbdix */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Why Abbdix investments</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Package, title: "Premium product", desc: "Every member receives a high-quality branded flash disk with guaranteed storage capacity." },
            { icon: BarChart3, title: "Real-time tracking", desc: "Monitor your network, earnings, and referral slots from a clean member portal." },
            { icon: HandCoins, title: "Fair compensation", desc: "UGX 5,000 per member across 5 levels. No hidden fees, no subscription charges." },
            { icon: Headphones, title: "Member support", desc: "Our admin team verifies every payment manually to keep the network clean and trusted." },
            { icon: Lock, title: "Secure accounts", desc: "Email-based authentication with protected profiles and encrypted session handling." },
            { icon: Clock, title: "Fast activation", desc: "Submit your Mobile Money reference and get approved by admin within hours." },
            { icon: Award, title: "Printable cards", desc: "Generate a professional referral card you can print and share offline." },
            { icon: TrendingUp, title: "Scalable income", desc: "Even with only 3 direct referrals, your 5-level tree can reach 363 members." },
          ].map((f) => (
            <Card key={f.title} className="p-5">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Member stories</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { name: "James O.", role: "Kampala", text: "I joined with UGX 60,000 and in two months my network grew to 47 members. The dashboard makes it easy to track everything." },
            { name: "Sarah N.", role: "Jinja", text: "The flash disk I received was genuine and high quality. Earning while sharing a real product feels great." },
            { name: "Peter K.", role: "Mbarara", text: "Abbdix made it simple to build a side income. Admin approval is quick and the system is transparent." },
          ].map((t, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-1 text-amber-500">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{t.name[0]}</div>
                <div>
                  <p className="text-xs font-semibold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* NETWORK STATS */}
      <section className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant sm:p-8">
        <div className="grid gap-6 sm:grid-cols-3 text-center">
          <div>
            <p className="text-3xl font-bold">5</p>
            <p className="mt-1 text-sm text-white/80">Referral levels deep</p>
          </div>
          <div>
            <p className="text-3xl font-bold">3</p>
            <p className="mt-1 text-sm text-white/80">Direct referrals per member</p>
          </div>
          <div>
            <p className="text-3xl font-bold">363</p>
            <p className="mt-1 text-sm text-white/80">Max network size per leg</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="grid gap-3">
          {[
            { q: "How do I pay the UGX 60,000 entry fee?", a: "Send Mobile Money to the admin and submit your transaction reference on your dashboard. Admin will verify and activate your account." },
            { q: "Can I refer more than 3 people directly?", a: "No. Each member is limited to 3 direct referrals. Additional signups must be placed under your downline members." },
            { q: "How soon do I start earning?", a: "You earn UGX 5,000 for every new member that joins anywhere in your 5-level downline, starting from your first referral." },
            { q: "What product do I receive?", a: "Every activated member receives a branded premium flash disk shipped or delivered locally." },
            { q: "Is there a recurring fee?", a: "No. The UGX 60,000 is a one-time entry fee. There are no monthly or annual charges." },
          ].map((faq, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">{i + 1}</div>
                <div>
                  <h3 className="font-semibold text-sm">{faq.q}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* DIRECTORS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Our directors</h2>
        <p className="text-sm text-muted-foreground">Meet the leadership behind Abbdix investments.</p>
        <Card className="overflow-hidden">
          <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
            <div className="bg-muted">
              <img src={dicksonAsset.url} alt="Dickson Niwagaba, Director" className="h-full w-full object-cover aspect-square sm:aspect-auto" />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-lg font-bold">Dickson Niwagaba</h3>
              <p className="text-sm text-primary font-medium">Director</p>
              <div className="mt-3 space-y-2 text-sm text-foreground/85 leading-relaxed">
                <p>President of VX Uganda, a sports association recognised by the National Council of Sports in Uganda.</p>
                <p>Former Hospital Administrator at Old Kampala Hospital, a non-profit under the Uganda Muslim Supreme Council, supervised by the Government of Uganda through the Ministry of Health.</p>
                <p>Served the Government of Uganda as Head Internal Auditor and District Internal Auditor in Oyam District Local Government.</p>
                <p>Businessman and consultant in management, policy, structure, and internal control systems in the hospitality industry.</p>
                <p>Graduate of Bachelor of Business Administration (Accounting option), Makerere University.</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
            <div className="bg-muted">
              <img src={muteesasiraAsset.url} alt="Muteesasira Abbey, Director" className="h-full w-full object-cover aspect-square sm:aspect-auto" />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-lg font-bold">Muteesasira Abbey</h3>
              <p className="text-sm text-primary font-medium">Director · Executive Director, Nature Perk (U) Ltd</p>
              <div className="mt-3 space-y-2 text-sm text-foreground/85 leading-relaxed">
                <p>Professional Interior Designer, skilled Barista, and Coffee Quality Consultant with a passion for excellence and innovation.</p>
                <p>Specialises in creating functional and aesthetically appealing interior spaces while promoting high standards in coffee quality and customer experience.</p>
                <p>Businessman and Executive Director of Nature Perk (U) Ltd, where he provides strategic leadership and drives business growth.</p>
                <p>His diverse expertise reflects a strong commitment to professionalism, quality, and sustainable development.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
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

      {/* FOOTER LINKS */}
      <footer className="border-t border-border pt-8 pb-4">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-bold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-primary text-primary-foreground text-[10px]">AI</span>
              <span>Abbdix investments</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Premium flash disks and a trusted 5-level referral network based in Uganda.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Quick links</h4>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li><Link to="/register" className="hover:text-foreground">Register</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Member login</Link></li>
              <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Contact</h4>
            <p className="mt-2 text-xs text-muted-foreground">support@abbdic.com</p>
            <p className="text-xs text-muted-foreground">Kampala, Uganda</p>
          </div>
        </div>
        <p className="mt-8 text-center text-[11px] text-muted-foreground">© {new Date().getFullYear()} Abbdix investments. All rights reserved.</p>
      </footer>
    </div>
  );
}
