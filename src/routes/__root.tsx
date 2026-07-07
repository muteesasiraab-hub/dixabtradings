import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import appCss from "../styles.css?url";
import logo from "@/assets/abbdix-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => { router.invalidate(); reset(); }}>Try again</Button>
          <Button variant="outline" asChild><a href="/">Go home</a></Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Abbdix General Trading — Premium Products & Recommendation Community" },
      { name: "description", content: "Abbdix General Trading: a platform where opportunities meet innovation. Physical products from 100,000 UGX and a 5-level recommendation earning model." },
      { name: "theme-color", content: "#059669" },
      { property: "og:title", content: "Abbdix General Trading" },
      { property: "og:description", content: "Premium physical products. Earn across 5 recommendation levels." },

      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Header() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur no-print">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-white p-1 shadow-sm ring-1 ring-gold/40">
            <img src={logo} alt="Abbdix General Trading logo" className="h-full w-full object-contain" width={44} height={44} />
          </span>
          <span className="font-serif text-emerald-deep">Abbdix General Trading</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {authed ? (
            <>
              <Link to="/dashboard" className="rounded-md px-3 py-1.5 hover:bg-muted">Dashboard</Link>
              <Button size="sm" variant="ghost" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-1.5 hover:bg-muted">Login</Link>
              <Link to="/register" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90">Join</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
