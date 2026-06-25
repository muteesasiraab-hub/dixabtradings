import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-showroom.jpg";
import logo from "@/assets/abbdix-logo.png";
import productFlash from "@/assets/product-flashdisk.jpg";
import productEarbuds from "@/assets/product-earbuds.jpg";
import productBag from "@/assets/product-bag.jpg";
import productMug from "@/assets/product-mug.jpg";
import dicksonAsset from "@/assets/dickson.jpg.asset.json";
import muteesasiraAsset from "@/assets/muteesasira.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight, Shield, Lock } from "lucide-react";
import { UGX, USD, ENTRY_FEE, EARNING_PER_REFERRAL } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Index });

const products = [
  { img: productFlash, name: "Premium Flash Disk", category: "Electronics", price: 100000, tag: "Entry product", featured: true },
  { img: productEarbuds, featured: false },
  { img: productBag, featured: false },
  { img: productMug, featured: false },
];


function Index() {
  return (
    <div className="space-y-28 pb-12">
      {/* HERO */}
      <section className="grid items-center gap-12 pt-6 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-12 bg-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>
              The Future of African Sales
            </span>
          </div>
          <div className="inline-block rounded-md bg-white p-4 shadow-elegant ring-1 ring-gold/40">
            <img src={logo} alt="Abbdix General Trading logo" className="h-24 w-24 object-contain" width={96} height={96} />
          </div>
          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-emerald-deep sm:text-6xl lg:text-7xl">
            Discover the world of <em className="italic font-light text-gold">sales</em> with Abbdix General Trading.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            A platform where opportunities meet innovation. Explore a diverse range of physical products starting from just{" "}
            <span className="font-semibold text-emerald-deep">100,000 UGX</span> and unlock your potential in our recommendation earning model.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild size="lg" className="group relative h-auto overflow-hidden rounded-none bg-emerald-deep px-8 py-5 text-sm font-semibold uppercase tracking-widest text-cream hover:bg-emerald-deep">
              <Link to="/register">
                <span className="relative z-10">Start Earning</span>
                <span className="absolute inset-0 translate-y-full bg-gold transition-transform duration-300 group-hover:translate-y-0" />
                <ArrowRight className="relative z-10 ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-auto rounded-none border-2 border-emerald-deep bg-transparent px-8 py-5 text-sm font-semibold uppercase tracking-widest text-emerald-deep hover:bg-emerald-deep hover:text-cream">
              <Link to="/login">Member Login</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="group relative aspect-[10/12] overflow-hidden shadow-elegant">
            <img
              src={heroImg}
              alt="Premium emerald and gold showroom display"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              width={896}
              height={1088}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-white/5 p-6 backdrop-blur-md sm:p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold">Platform Launch</p>
              <p className="font-serif text-2xl italic text-white sm:text-3xl">
                Empowering 10,000+ Entrepreneurs across Uganda
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-4 -top-4 hidden h-40 w-40 border border-gold sm:block" />
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="grid grid-cols-2 gap-y-6 border-y border-border/60 py-8 text-center sm:grid-cols-4">
        {[
          { k: "10K+", v: "Entrepreneurs" },
          { k: "5", v: "Levels deep" },
          { k: "363", v: "Community per leg" },
          { k: "100%", v: "Verified payouts" },
        ].map((s) => (
          <div key={s.v}>
            <p className="font-serif text-4xl text-emerald-deep">{s.k}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-foreground/60">{s.v}</p>
          </div>
        ))}
      </section>

      {/* VISION & MISSION */}
      <section className="grid gap-8 lg:grid-cols-2">
        <article className="relative overflow-hidden border border-border bg-white p-8 shadow-card sm:p-10">
          <span className="absolute right-6 top-6 text-[10px] font-black uppercase tracking-[0.3em] text-gold">01 · Vision</span>
          <h3 className="font-serif text-3xl text-emerald-deep sm:text-4xl">Our Vision</h3>
          <div className="mt-4 h-px w-16 bg-gold" />
          <p className="mt-6 leading-relaxed text-foreground/80">
            To become Africa's most trusted platform for premium physical products and shared prosperity — empowering
            everyday people to build sustainable income through community, innovation and integrity.
          </p>
        </article>
        <article className="relative overflow-hidden border border-emerald-deep bg-emerald-deep p-8 text-cream shadow-elegant sm:p-10">
          <span className="absolute right-6 top-6 text-[10px] font-black uppercase tracking-[0.3em] text-gold">02 · Mission</span>
          <h3 className="font-serif text-3xl text-cream sm:text-4xl">Our Mission</h3>
          <div className="mt-4 h-px w-16 bg-gold" />
          <p className="mt-6 leading-relaxed text-cream/80">
            To deliver exceptional, quality-assured products at fair prices while operating a transparent 5-level
            recommendation model that rewards every member fairly, grows local entrepreneurship and uplifts communities
            across Uganda and beyond.
          </p>
        </article>
      </section>


      {/* PRODUCT SHOWCASE */}
      <section className="space-y-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>Active inventory</p>
            <h2 className="font-serif text-4xl text-emerald-deep sm:text-5xl">The catalog that pays you back by 10%.</h2>
            <p className="mt-3 text-sm text-foreground/70">
              Buy the Abbdix entry product to join — earn{" "}
              <span className="font-semibold text-emerald-deep">10% per recommendation</span> across 5 community levels.
            </p>
          </div>
          <Link to="/products" className="group inline-flex items-center gap-2 border-b-2 border-gold pb-1 text-sm font-semibold text-emerald-deep">
            Browse profiled products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <div key={i} className={`group ${p.featured ? "cursor-pointer" : "pointer-events-none"}`}>
              <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-white shadow-card ring-1 ring-border/60">
                <img
                  src={p.img}
                  alt={p.featured ? p.name : "Upcoming product"}
                  loading="lazy"
                  width={640}
                  height={800}
                  className={`h-full w-full object-cover transition-transform duration-700 ${p.featured ? "group-hover:scale-110" : "blur-2xl scale-110 opacity-40"}`}
                />
                {p.featured ? (
                  <span className="absolute left-3 top-3 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-deep backdrop-blur">
                    {p.tag}
                  </span>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-deep/40">
                    <span className="bg-emerald-deep px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cream">Coming soon</span>
                  </div>
                )}
              </div>
              {p.featured && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{p.category}</p>
                  <h3 className="mt-1 font-serif text-xl text-emerald-deep">{p.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-emerald-deep">
                    {UGX(p.price!)} <span className="ml-1 text-foreground/55">≈ {USD(p.price!)}</span>
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button asChild size="lg" className="h-auto rounded-none bg-gold px-8 py-5 text-sm font-semibold uppercase tracking-widest text-emerald-deep hover:bg-gold/90">
            <Link to="/products">Browse profiled products <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>


      {/* EARNINGS CALCULATOR */}
      <section className="relative overflow-hidden bg-emerald-deep p-8 text-cream shadow-elegant sm:p-12 lg:p-16">
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-emerald)] opacity-25 blur-3xl" />
        <div className="relative z-10 grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold">Recommendation Model</p>
            <h2 className="font-serif text-4xl text-cream sm:text-5xl">Project your success.</h2>
            <p className="mt-6 leading-relaxed text-cream/70 sm:text-lg">
              Our 5-level recommendation system is built for scalability. See how much you could earn by sharing products
              and growing your community.
            </p>
            <div className="mt-10 h-px w-24 bg-gold" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3">
            <div className="space-y-10 border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-cream/80">Monthly volume</label>
                  <span className="font-bold text-gold">121 units</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-3/4 rounded-full bg-gold transition-all duration-700" />
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-cream/80">Community size</label>
                  <span className="font-bold text-gold">363 members</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-5/6 rounded-full bg-gold transition-all duration-700" />
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-cream/80">Community depth</label>
                  <span className="font-bold text-gold">5 levels</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-full rounded-full bg-gold" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-gold p-8 text-center text-emerald-deep">
              <span className="mb-3 text-[10px] font-black uppercase tracking-[0.3em]">Projected payout</span>
              <span className="font-serif text-5xl leading-none sm:text-6xl">3,630,000</span>
              <span className="mt-3 text-xs font-bold uppercase tracking-widest">UGX / Monthly</span>
              <div className="mt-6 h-px w-16 bg-emerald-deep/40" />
              <p className="mt-4 max-w-[14rem] text-xs leading-relaxed text-emerald-deep/80">
                363 × {UGX(EARNING_PER_REFERRAL)} per recommendation across a full 5-level community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-12">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>How it works</p>
          <h2 className="font-serif text-4xl text-emerald-deep sm:text-5xl">Three steps to consistent income.</h2>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {[
            { n: "01", t: "Buy and Recommend Abbdix product", d: `Activate your account with ${UGX(ENTRY_FEE)} and receive your premium Abbdix product.` },
            { n: "02", t: "Share with three", d: "Each member recommends up to 3 directly — your community compounds quietly." },
            { n: "03", t: "Earn five levels deep", d: `${UGX(EARNING_PER_REFERRAL)} credited for every signup anywhere in your 5-level community.` },
          ].map((s) => (
            <div key={s.n} className="group relative bg-card p-8 transition-colors hover:bg-emerald-deep">
              <span className="font-serif text-5xl text-gold transition-transform group-hover:scale-110">{s.n}</span>
              <h3 className="mt-6 font-serif text-2xl text-emerald-deep group-hover:text-cream">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75 group-hover:text-cream/80">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIRECTORS */}
      <section className="space-y-16">
        <div className="text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>Board of Directors</p>
          <h2 className="font-serif text-4xl text-emerald-deep sm:text-5xl">Visionary governance.</h2>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {[
            {
              img: dicksonAsset.url,
              name: "Dickson Niwagaba",
              role: "Director",
              bio: [
                "President of VX Uganda, a sports association recognised by the National Council of Sports in Uganda.",
                "Former Hospital Administrator at Old Kampala Hospital, a non-profit under the Uganda Muslim Supreme Council, supervised by the Government of Uganda through the Ministry of Health.",
                "Served the Government of Uganda as Head of Internal Audit Department and District Internal Auditor at Oyam District Local Government.",
                "Businessman and consultant in Governance and Management, Policy and Human Resource structural formulation, and internal control system design in Business Management.",
                "Graduate of Bachelor of Business Administration (Accounting option), Makerere University.",
              ],
            },
            {
              img: muteesasiraAsset.url,
              name: "Muteesasira Abbey",
              role: "Director · Executive Director, Nature Perk (U) Ltd",
              bio: [
                "Professional Interior Designer, skilled Barista, and Coffee Quality Consultant.",
                "Executive Director of Nature Perk (U) Ltd, providing strategic leadership and driving sustainable business growth.",
                "Guided by professionalism, creativity, and a commitment to quality.",
              ],
            },
          ].map((d, idx) => (
            <div key={d.name} className={`group space-y-6 ${idx === 1 ? "md:translate-y-12" : ""}`}>
              <div className="aspect-[3/4] overflow-hidden bg-muted grayscale transition-all duration-700 group-hover:grayscale-0">
                <img
                  src={d.img}
                  alt={`${d.name}, ${d.role}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-emerald-deep">{d.name}</h3>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gold">{d.role}</p>
                <div className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/80">
                  {d.bio.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — member stories (below directors) */}
      <section className="space-y-12">
        <div className="text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>Member stories</p>
          <h2 className="font-serif text-4xl text-emerald-deep sm:text-5xl">Real entrepreneurs. Real payouts.</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { name: "James O.", role: "Kampala", text: "I bought an Abbdix Flash at UGX 100,000 and grew my community to 98 members in 10 months. The dashboard makes every shilling visible." },
            { name: "Sarah N.", role: "Jinja", text: "The product I received was genuine and high quality. Earning while sharing something real feels honest." },
            { name: "Peter K.", role: "Mbarara", text: "Admin approvals are quick and the model is transparent. Abbdix turned a side idea into a real income stream." },
          ].map((t) => (
            <article key={t.name} className="flex flex-col bg-card p-8 shadow-card ring-1 ring-border/60">
              <div className="flex gap-1 text-gold">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-5 font-serif text-xl italic leading-snug text-emerald-deep">"{t.text}"</p>
              <div className="mt-auto flex items-center gap-3 pt-6">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-deep font-bold text-cream">{t.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-emerald-deep">{t.name}</p>
                  <p className="text-[11px] uppercase tracking-widest text-foreground/60">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>


      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-emerald-deep p-10 text-cream shadow-elegant sm:p-16">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gold opacity-15 blur-3xl" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">Ready when you are</p>
            <h3 className="font-serif text-4xl leading-tight sm:text-5xl">
              Your <em className="italic text-gold">first commission</em> is one referral away.
            </h3>
            <p className="mt-5 max-w-xl leading-relaxed text-cream/75">
              Get your unique identifier code instantly after registration. Print a card, share online, earn across 5 levels.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-auto rounded-none bg-gold px-8 py-5 text-sm font-semibold uppercase tracking-widest text-emerald-deep hover:bg-gold/90">
                <Link to="/register">Register now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-auto rounded-none border-2 border-cream/40 bg-transparent px-8 py-5 text-sm font-semibold uppercase tracking-widest text-cream hover:bg-cream/10 hover:text-cream">
                <Link to="/login">Member login</Link>
              </Button>
            </div>
          </div>
          <ul className="space-y-3 border-l border-white/15 pl-8 text-sm text-cream/85">
            {[
              "Printable identifier card",
              "Real-time earnings dashboard",
              "5-level downline tracking",
              "Verified manual payouts",
              "Secure member portal",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-gold" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 mt-10 flex items-center gap-2 text-xs text-cream/60">
          <Shield className="h-3.5 w-3.5" /> Payments verified manually by admin after Mobile Money or cash.
          <Lock className="ml-3 h-3.5 w-3.5" /> Encrypted member sessions.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border pt-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-bold tracking-tight">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-white p-1 ring-1 ring-border">
                <img src={logo} alt="Abbdix General Trading logo" className="h-full w-full object-contain" width={40} height={40} loading="lazy" />
              </span>
              <span className="font-serif text-2xl text-emerald-deep">Abbdix General Trading</span>
            </div>
            <p className="mt-3 text-xs text-foreground/65">Premium physical products and a trusted 5-level recommendation community based in Uganda.</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">Quick links</h4>
            <ul className="mt-3 space-y-1.5 text-xs text-foreground/70">
              <li><Link to="/products" className="hover:text-emerald-deep">Profiled products</Link></li>
              <li><Link to="/register" className="hover:text-emerald-deep">Register</Link></li>
              <li><Link to="/login" className="hover:text-emerald-deep">Member login</Link></li>
              <li><Link to="/" className="hover:text-emerald-deep">Home</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">Contact</h4>
            <p className="mt-3 text-xs text-foreground/70"><a href="mailto:support@abbdix.com" className="hover:text-emerald-deep">support@abbdix.com</a></p>
            <p className="text-xs text-foreground/70">Kampala, Uganda</p>
          </div>
        </div>
        <p className="mt-10 text-center text-[11px] text-foreground/55">© {new Date().getFullYear()} Abbdix General Trading. All rights reserved.</p>
      </footer>

    </div>
  );
}
