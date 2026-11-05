import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-showroom.jpg?format=webp";
import logo from "@/assets/dixab-logo.png?format=webp";
import productFlash from "@/assets/product-flashdisk.jpg?format=webp";
import productEarbuds from "@/assets/product-earbuds.jpg?format=webp";
import productBag from "@/assets/product-bag.jpg?format=webp";
import productMug from "@/assets/product-mug.jpg?format=webp";
import communityImg from "@/assets/community-entrepreneurs.jpg?format=webp";
import earningsImg from "@/assets/earnings-mobile.jpg?format=webp";
import dashboardImg from "@/assets/member-dashboard.jpg?format=webp";
import productCollectionImg from "@/assets/product-collection.jpg?format=webp";
import dicksonImg from "@/assets/dickson.jpg?format=webp";
import muteesasiraImg from "@/assets/muteesasira.jpg?format=webp";

import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Shield, Lock, MessageCircle } from "lucide-react";
import { UGX, USD, ENTRY_FEE, EARNING_PER_REFERRAL } from "@/lib/format";

const WHATSAPP_NUMBER = "256731981504";
const WHATSAPP_MESSAGE = "Hello Dixab, I would like to join the community and learn more.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-1.859-.173-.098-.298-.07-.404.128-.106.198-.405.683-.497.82-.09.135-.183.15-.38.05-.197-.1-.833-.308-1.585-.978-.587-.523-.98-1.17-1.095-1.368-.115-.198-.012-.304.086-.403.088-.088.197-.23.296-.345.099-.113.132-.198.198-.33.066-.132.033-.248-.016-.347s-.65-1.563-.89-2.139c-.23-.576-.461-.499-.65-.51-.168-.008-.36-.01-.552-.01-.192 0-.505.072-.77.359-.266.287-1.014.99-1.014 2.413s1.007 2.798 1.147 2.992c.14.194 1.98 3.029 4.8 4.245 1.686.74 2.96.83 4.02.696 1.299-.155 2.002-1.288 2.29-1.287.288 0 1.272.83 1.45 1.56.178.73.043 1.436-.183 1.793z"/>
    </svg>
  );
}

function WhatsAppButton({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl ${sizeClasses[size]} ${className}`}
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon className={size === "sm" ? "h-5 w-5" : "h-6 w-6"} />
    </a>
  );
}


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dixab General Tradings Co. Ltd — Word of Mouth Rewarded" },
      { name: "description", content: "Discover Dixab products and the recommendation community in Uganda." },
      { property: "og:title", content: "Dixab General Tradings Co. Ltd" },
      { property: "og:description", content: "Physical products and a community built on recommendations." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" },
    ],
  }),
  component: Index,
});

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
      <section className="relative -mx-4 overflow-hidden bg-emerald-deep text-cream">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold opacity-15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[var(--color-emerald)] opacity-25 blur-3xl" />
        <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 shrink-0 bg-gold" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                Word of mouth rewarded
              </span>
            </div>
            <h1 className="max-w-xl font-serif text-5xl leading-[1.08] sm:text-6xl">
              Turn your network into{" "}
              <em className="italic text-gold">income</em>.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
              Join Dixab General Tradings Co. Ltd with a premium flash disk for{" "}
              <span className="font-semibold text-cream">100,000 UGX</span> — then earn{" "}
              <span className="font-semibold text-gold">10% on every recommendation</span>, five levels deep.
            </p>

            <ul className="grid max-w-md gap-3 text-sm text-cream/90 sm:grid-cols-2">
              {[
                `Earn ${UGX(EARNING_PER_REFERRAL)} per referral`,
                "5 levels of community earnings",
                "Your own earnings dashboard",
                "Printable identifier card",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {f}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="h-auto rounded-none bg-cream px-8 py-5 text-sm font-semibold uppercase tracking-widest text-emerald-deep hover:bg-white">
                <Link to="/register" search={{ ref: "" }}>
                  Join & start earning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-auto rounded-none border-2 border-cream/40 bg-transparent px-8 py-5 text-sm font-semibold uppercase tracking-widest text-cream hover:bg-cream/10">
                <Link to="/login">Member Login</Link>
              </Button>
            </div>
            <p className="text-xs text-cream/60">
              One-time entry · No monthly fees · Pay by Airtel Money or MTN MoMo
            </p>
          </div>

          <div className="relative">
            <div className="group relative aspect-[4/3] overflow-hidden shadow-elegant lg:aspect-[10/12]">
              <img
                src={heroImg}
                alt="Dixab showroom with the company team"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                width={896}
                height={1088}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 border-t border-white/15 bg-white/5 p-6 backdrop-blur-md">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gold">Now launching in Uganda</p>
                <p className="font-serif text-xl italic text-cream sm:text-2xl">
                  Founding members earn first
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-4 -top-4 hidden h-40 w-40 border border-gold sm:block" />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="grid grid-cols-2 gap-y-6 border-y border-border/60 py-8 text-center sm:grid-cols-4">
        {[
          { k: "10%", v: "Per recommendation" },
          { k: "5", v: "Levels deep" },
          { k: UGX(ENTRY_FEE), v: "One-time entry" },
          { k: "MoMo", v: "Airtel & MTN payouts" },
        ].map((s) => (
          <div key={s.v}>
            <p className="font-serif text-3xl text-emerald-deep sm:text-4xl">{s.k}</p>
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
            To transform every African into an empowered entrepreneur by building a decentralized, trust-based sales
            ecosystem that rewards genuine connections.
          </p>
          <div className="mt-8 overflow-hidden border border-border/60">
            <img
              src={communityImg}
              alt="African entrepreneurs collaborating together"
              loading="lazy"
              width={640}
              height={480}
              className="h-56 w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </article>
        <article className="relative overflow-hidden border border-emerald-deep bg-emerald-deep p-8 text-cream shadow-elegant sm:p-10">
          <span className="absolute right-6 top-6 text-[10px] font-black uppercase tracking-[0.3em] text-gold">02 · Mission</span>
          <h3 className="font-serif text-3xl text-cream sm:text-4xl">Our Mission</h3>
          <div className="mt-4 h-px w-16 bg-gold" />
          <p className="mt-6 leading-relaxed text-cream/80">
            To unlock economic opportunity across Africa by empowering every individual to become a trusted brand
            ambassador, turning word-of-mouth into rewarding, sustainable income.
          </p>
          <div className="mt-8 overflow-hidden border border-white/20">
            <img
              src={dashboardImg}
              alt="Member viewing their Dixab earnings dashboard"
              loading="lazy"
              width={640}
              height={480}
              className="h-56 w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </article>
      </section>

      {/* PRODUCT GALLERY */}
      <section className="relative overflow-hidden">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>The collection</p>
            <h2 className="font-serif text-4xl text-emerald-deep sm:text-5xl">Premium products, premium value.</h2>
          </div>
          <WhatsAppButton size="sm" className="hidden sm:flex" />
        </div>
        <div className="group relative aspect-[21/9] overflow-hidden shadow-elegant">
          <img
            src={productCollectionImg}
            alt="Dixab premium product collection including flash disk, earbuds, tote bag and mug"
            loading="lazy"
            width={1344}
            height={576}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep/70 via-emerald-deep/20 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-8 text-cream sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Ready to start?</p>
            <h3 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Chat with us on WhatsApp</h3>
            <p className="mt-4 text-sm text-cream/85">
              Tap the button to join Dixab or ask questions directly. Our team is ready to guide you.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Message 0731 981 504
            </a>
          </div>
        </div>
      </section>



      {/* PRODUCT SHOWCASE */}
      <section className="space-y-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>Active inventory</p>
            <h2 className="font-serif text-4xl text-emerald-deep sm:text-5xl">The catalog that pays you back by 10%.</h2>
            <p className="mt-3 text-sm text-foreground/70">
              Buy the Dixab entry product to join — earn{" "}
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
          <Button asChild size="lg" className="h-auto rounded-none bg-emerald-deep px-8 py-5 text-sm font-semibold uppercase tracking-widest text-cream hover:bg-emerald-deep/90">
            <Link to="/products">Browse profiled products <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>


      {/* EARNINGS MODEL */}
      <section className="relative overflow-hidden bg-emerald-deep p-8 text-cream shadow-elegant sm:p-12 lg:p-16">
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-emerald)] opacity-25 blur-3xl" />
        <div className="relative z-10 grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold">Recommendation Model</p>
            <h2 className="font-serif text-4xl text-cream sm:text-5xl">How the earnings add up.</h2>
            <p className="mt-6 leading-relaxed text-cream/70 sm:text-lg">
              Every member recommends up to 3 people directly. You earn {UGX(EARNING_PER_REFERRAL)} for each new member
              anywhere in your community — across 5 levels.
            </p>
            <div className="mt-10 h-px w-24 bg-gold" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3">
            <div className="space-y-6 border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-cream/80">A full community, level by level</p>
              {[
                { level: "Level 1", members: 3, earn: 3 * EARNING_PER_REFERRAL },
                { level: "Level 2", members: 9, earn: 9 * EARNING_PER_REFERRAL },
                { level: "Level 3", members: 27, earn: 27 * EARNING_PER_REFERRAL },
                { level: "Level 4", members: 81, earn: 81 * EARNING_PER_REFERRAL },
                { level: "Level 5", members: 243, earn: 243 * EARNING_PER_REFERRAL },
              ].map((l) => (
                <div key={l.level} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-cream">{l.level}</p>
                    <p className="text-xs text-cream/60">{l.members} members</p>
                  </div>
                  <p className="font-serif text-xl font-semibold text-cream">{UGX(l.earn)}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center bg-cream p-8 text-center text-emerald-deep">
              <span className="mb-3 text-[10px] font-black uppercase tracking-[0.3em]">Full-community total</span>
              <span className="font-serif text-5xl leading-none sm:text-6xl">3,630,000</span>
              <span className="mt-3 text-xs font-bold uppercase tracking-widest">UGX</span>
              <div className="mt-6 h-px w-16 bg-emerald-deep/30" />
              <p className="mt-4 max-w-[16rem] text-xs leading-relaxed text-emerald-deep/70">
                363 members × {UGX(EARNING_PER_REFERRAL)}. An illustration of a complete 5-level community — actual
                earnings depend on how your community grows.
              </p>
            </div>

            <div className="relative overflow-hidden sm:col-span-2">
              <img
                src={earningsImg}
                alt="Mobile payment received on Dixab platform"
                loading="lazy"
                width={640}
                height={640}
                className="h-56 w-full object-cover sm:h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-cream">
                <p className="text-xs font-bold uppercase tracking-widest text-gold">Verified payouts</p>
                <p className="mt-1 font-serif text-xl">Confirmed by Mobile Money</p>
              </div>
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
            { n: "01", t: "Buy and Recommend Dixab product", d: `Activate your account with ${UGX(ENTRY_FEE)} and receive your premium Dixab product.` },
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
              img: dicksonImg,
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
              img: muteesasiraImg,
              name: "Muteesasira Abbey",
              role: "Director · Executive Director, Bamuteesasiraa General Trading Co. Ltd",
              bio: [
                "Professional Interior Designer, skilled Barista, and Coffee Quality Consultant.",
                "Executive Director of Bamuteesasiraa General Trading Co. Ltd, providing strategic leadership and driving sustainable business growth.",
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

      {/* WHY MEMBERS JOIN */}
      <section className="space-y-12">
        <div className="text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>Why members join</p>
          <h2 className="font-serif text-4xl text-emerald-deep sm:text-5xl">Built on trust, not promises.</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Shield, title: "A real product first", text: "Your entry buys a genuine premium flash disk — membership comes with something you can hold, not just a position." },
            { icon: Check, title: "Transparent earnings", text: `Every recommendation credits ${UGX(EARNING_PER_REFERRAL)} to your dashboard, visible in real time across all 5 levels.` },
            { icon: Lock, title: "Verified payouts", text: "Payments are confirmed by Mobile Money and approved by the directors before earnings are released." },
          ].map((t) => (
            <article key={t.title} className="flex flex-col bg-card p-8 shadow-card ring-1 ring-border/60">
              <div className="grid h-12 w-12 place-items-center bg-emerald-deep text-cream">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-serif text-2xl text-emerald-deep">{t.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{t.text}</p>
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
              <Button asChild size="lg" className="h-auto rounded-none bg-cream px-8 py-5 text-sm font-semibold uppercase tracking-widest text-emerald-deep hover:bg-white">
                <Link to="/register" search={{ ref: "" }}>Register now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-auto rounded-none border-2 border-cream/40 bg-transparent px-8 py-5 text-sm font-semibold uppercase tracking-widest text-cream hover:bg-white/10">
                <Link to="/login">Member login</Link>
              </Button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-auto items-center gap-2 rounded-none border-2 border-[#25D366] px-8 py-5 text-sm font-semibold uppercase tracking-widest text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
              </a>
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
                <img src={logo} alt="Dixab General Tradings Co. Ltd logo" className="h-full w-full object-contain" width={40} height={40} loading="lazy" />
              </span>
              <span className="font-serif text-2xl text-emerald-deep">Dixab General Tradings Co. Ltd</span>
            </div>
            <p className="mt-3 text-xs text-foreground/65">Premium physical products and a trusted 5-level recommendation community based in Uganda.</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">Quick links</h4>
            <ul className="mt-3 space-y-1.5 text-xs text-foreground/70">
              <li><Link to="/products" className="hover:text-emerald-deep">Profiled products</Link></li>
              <li><Link to="/register" search={{ ref: "" }} className="hover:text-emerald-deep">Register</Link></li>
              <li><Link to="/login" className="hover:text-emerald-deep">Member login</Link></li>
              <li><Link to="/" className="hover:text-emerald-deep">Home</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gold">Contact</h4>
            <p className="mt-3 text-xs text-foreground/70"><a href="mailto:support@dixab.com" className="hover:text-emerald-deep">support@dixab.com</a></p>
            <p className="text-xs text-foreground/70">Hotel Equatorial Basement, Kampala, Uganda</p>
            <p className="mt-2 text-xs"><a href="/directors" className="text-foreground/70 underline hover:text-emerald-deep">Directors' portal</a></p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:text-[#128C7E]"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp: 0731 981 504
            </a>
          </div>
        </div>
        <p className="mt-10 text-center text-[11px] text-foreground/55">© {new Date().getFullYear()} Dixab General Tradings Co. Ltd. All rights reserved.</p>
      </footer>

      {/* FLOATING WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 sm:bottom-8 sm:right-8">
        <span className="rounded-full bg-emerald-deep px-3 py-1 text-[10px] font-semibold text-cream shadow-lg">Chat with us</span>
        <WhatsAppButton size="lg" />
      </div>

    </div>
  );
}
