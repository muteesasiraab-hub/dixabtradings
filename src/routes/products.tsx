import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";
import productEarbuds from "@/assets/product-earbuds.jpg";
import productBag from "@/assets/product-bag.jpg";
import productMug from "@/assets/product-mug.jpg";
import productFlash from "@/assets/product-flashdisk.jpg";
import { UGX } from "@/lib/format";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Profiled Products — Abbdix General Trading" },
      { name: "description", content: "Browse our profiled catalog of premium physical products available for purchase from Abbdix General Trading." },
    ],
  }),
});

const profiledProducts = [
  { img: productFlash, name: "Premium Flash Disk", category: "Electronics", price: 60000, tag: "Entry product" },
  { img: productEarbuds, name: "Wireless Earbuds", category: "Audio", price: 120000, tag: "Coming soon" },
  { img: productBag, name: "Leather Travel Bag", category: "Lifestyle", price: 240000, tag: "Coming soon" },
  { img: productMug, name: "Signature Coffee Mug", category: "Home", price: 85000, tag: "Coming soon" },
];

function ProductsPage() {
  return (
    <div className="space-y-12 pb-16">
      <header className="space-y-4 pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--color-emerald)" }}>
          Profiled products
        </p>
        <h1 className="font-serif text-4xl text-emerald-deep sm:text-5xl">Our curated catalog.</h1>
        <p className="max-w-2xl text-foreground/75">
          Explore the lineup of physical products we list for sale. To join the network and start earning,
          purchase the <strong className="text-emerald-deep">Abbdix entry product</strong> below.
        </p>
        <div>
          <Button asChild className="h-auto rounded-none bg-emerald-deep px-6 py-4 text-xs font-semibold uppercase tracking-widest text-cream hover:bg-emerald-deep/90">
            <Link to="/register">Buy entry product & join <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {profiledProducts.map((p) => (
          <article key={p.name} className="group">
            <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-white shadow-card ring-1 ring-border/60">
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                width={640}
                height={800}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-deep">
                {p.tag}
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{p.category}</p>
            <h3 className="mt-1 font-serif text-xl text-emerald-deep">{p.name}</h3>
            <p className="mt-1 text-sm font-semibold text-emerald-deep">{UGX(p.price)}</p>
          </article>
        ))}
      </section>

      <section className="flex items-center gap-4 border-t border-border pt-8 text-sm text-foreground/70">
        <Package className="h-5 w-5 text-gold" />
        More products are added regularly. Contact <a href="mailto:support@abbdix.com" className="text-emerald-deep underline">support@abbdix.com</a> for bulk inquiries.
      </section>
    </div>
  );
}
