import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import appCss from "../styles.css?url";
import logo from "@/assets/dixab-logo.png?format=webp";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL = "https://wa.me/256731981504";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}


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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
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
      { title: "Dixab General Tradings Co. Ltd — Word of Mouth Rewarded" },
      { name: "description", content: "Dixab General Tradings Co. Ltd: a platform where opportunities meet innovation. Physical products from 100,000 UGX and a 5-level recommendation earning model." },
      { name: "theme-color", content: "#059669" },
      { property: "og:title", content: "Dixab General Tradings Co. Ltd" },
      { property: "og:description", content: "Word of mouth rewarded — premium physical products and 5 levels of recommendation earnings." },

      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap" },
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
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-card p-1 ring-1 ring-border">
            <img src={logo} alt="Dixab General Tradings Co. Ltd logo" className="h-full w-full object-contain" width={44} height={44} />
          </span>
          <span className="min-w-0 font-sans text-base font-semibold leading-snug tracking-normal text-primary sm:text-sm">
            <span className="block sm:inline">Dixab General Tradings</span>{" "}
            <span className="block text-sm font-medium text-foreground sm:inline">Co. Ltd</span>
          </span>
        </Link>

          <nav aria-label="Account and contact" className="grid grid-cols-3 items-center gap-2 border-t border-border/60 pt-3 sm:flex sm:shrink-0 sm:border-0 sm:pt-0">
            {authed ? (
              <>
                <Button asChild size="sm" variant="outline" className="h-10"><Link to="/dashboard">Dashboard</Link></Button>
                <Button size="sm" variant="ghost" className="h-10" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Sign out</Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="outline" className="h-10"><Link to="/login">Login</Link></Button>
                <Button asChild size="sm" className="h-10"><Link to="/register" search={{ ref: "" }}>Join</Link></Button>
              </>
            )}
            <Button asChild size="sm" variant="secondary" className="h-10 gap-1.5">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Add me as a contact on WhatsApp"
              title="Add me as a contact on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            </Button>
          </nav>

      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event === "SIGNED_OUT") queryClient.clear();
      else queryClient.invalidateQueries();
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
