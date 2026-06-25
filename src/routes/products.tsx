import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, PackageOpen, Wrench } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Browse Catalogue — Abbdix General Trading" },
      { name: "description", content: "Our profiled products catalogue is under development. New direct-sale products will be introduced here soon." },
    ],
  }),
});

function ProductsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8 py-20 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-deep/5 ring-1 ring-emerald-deep/20">
        <Wrench className="h-9 w-9 text-emerald-deep" />
      </div>
      <div className="space-y-4 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Browse Catalogue</p>
        <h1 className="font-serif text-4xl text-emerald-deep sm:text-5xl">Under development</h1>
        <p className="text-foreground/70">
          This catalogue is being curated. We will soon introduce new physical products available for{" "}
          <strong className="text-emerald-deep">direct sale</strong> through Abbdix General Trading. Please check back shortly.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-foreground/60">
        <PackageOpen className="h-4 w-4 text-gold" /> New products coming soon
      </div>
      <Button asChild className="h-auto rounded-none bg-emerald-deep px-6 py-4 text-xs font-semibold uppercase tracking-widest text-cream hover:bg-emerald-deep/90">
        <Link to="/">Back to home <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  );
}
