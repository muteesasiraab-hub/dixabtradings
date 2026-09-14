import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";
import { UGX, USD } from "@/lib/format";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Browse Catalogue — Dixab General Trading" },
      { name: "description", content: "Explore our premium product catalogue with direct-sale offerings and earn through recommendations." },
    ],
  }),
});

const products: Array<{
  img: string;
  name: string;
  category: string;
  price: number;
  description: string;
  featured: boolean;
}> = [];

function ProductsPage() {
  return (
    <div className="space-y-20 py-12">
      {/* HERO */}
      <section className="text-center">
        <div className="mb-6 inline-flex items-center gap-3">
          <span className="h-px w-12 bg-gold" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>
            Active Inventory
          </span>
          <span className="h-px w-12 bg-gold" />
        </div>
        <h1 className="font-serif text-5xl text-emerald-deep sm:text-6xl mb-4">
          Our Profiled Products
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Curated premium products available for direct sale. Buy any product to join the Dixab community and start earning 10% per recommendation across 5 levels.
        </p>
      </section>

      {/* PRODUCTS GRID */}
      <section className="space-y-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <div key={i} className="group flex flex-col">
                <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-white shadow-card ring-1 ring-border/60">
                  <img
                    src={p.img}
                    alt={p.name}
                    loading="lazy"
                    width={640}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute left-3 top-3 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-deep backdrop-blur">
                    Featured
                  </span>
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-emerald-deep/10" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{p.category}</p>
                  <h3 className="font-serif text-xl text-emerald-deep group-hover:text-gold transition-colors">{p.name}</h3>
                  <p className="text-sm text-foreground/70">{p.description}</p>
                  <div className="pt-2">
                    <p className="text-lg font-semibold text-emerald-deep">
                      {UGX(p.price)} <span className="text-sm text-foreground/55">≈ {USD(p.price)}</span>
                    </p>
                  </div>
                </div>
                <Button asChild className="mt-6 h-auto rounded-none bg-emerald-deep px-4 py-3 text-xs font-semibold uppercase tracking-widest text-cream hover:bg-emerald-deep/90">
                  <Link to="/register" search={{ ref: "" }}>
                    Buy & Join <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-none border border-dashed border-emerald-deep/30 bg-emerald-deep/5 p-12 text-center">
            <Store className="mx-auto mb-4 h-10 w-10 text-emerald-deep/60" />
            <h3 className="font-serif text-2xl text-emerald-deep">Catalogue under development</h3>
            <p className="mt-3 text-sm text-foreground/70">
              Our direct-sale product listings are being prepared. Check back soon or contact us on WhatsApp for early access.
            </p>
          </div>
        )}
      </section>

      {/* WHY BUY SECTION */}
      <section className="bg-emerald-deep/5 border border-emerald-deep/20 p-12 text-center">
        <div className="mb-8 inline-flex items-center gap-3">
          <span className="h-px w-12 bg-gold" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>
            Why Buy
          </span>
          <span className="h-px w-12 bg-gold" />
        </div>
        <h2 className="font-serif text-4xl text-emerald-deep mb-12 sm:text-5xl">More than just a product</h2>
        
        <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          {[
            { icon: "🎯", title: "Quality Assured", desc: "Premium products verified and tested for authenticity" },
            { icon: "💰", title: "Earn on Every Sale", desc: "10% commission across 5 levels of your network" },
            { icon: "📊", title: "Track Everything", desc: "Real-time dashboard showing all your earnings" },
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <div className="text-5xl">{item.icon}</div>
              <h3 className="font-serif text-xl text-emerald-deep">{item.title}</h3>
              <p className="text-sm text-foreground/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative overflow-hidden bg-emerald-deep p-10 text-cream shadow-elegant sm:p-16">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gold opacity-15 blur-3xl" />
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">Get started today</p>
            <h3 className="font-serif text-4xl leading-tight sm:text-5xl">
              Choose your product and <em className="italic text-gold">start earning</em>
            </h3>
            <p className="mt-5 leading-relaxed text-cream/75">
              Select any product above to register. Your unique referral code will be generated instantly. Share it and earn 10% for every person who joins using your code.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="h-auto rounded-none bg-gold px-8 py-5 text-sm font-semibold uppercase tracking-widest text-emerald-deep hover:bg-gold/90">
              <Link to="/register" search={{ ref: "" }}>Browse & Register <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-auto rounded-none border-2 border-cream/40 bg-transparent px-8 py-5 text-sm font-semibold uppercase tracking-widest text-cream hover:bg-cream/10">
              <Link to="/login">Already a member?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* BACK TO HOME */}
      <div className="flex justify-center">
        <Button asChild variant="outline" className="h-auto rounded-none px-6 py-3 text-xs font-semibold uppercase tracking-widest">
          <Link to="/"><ArrowRight className="mr-2 h-3.5 w-3.5 rotate-180" /> Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
