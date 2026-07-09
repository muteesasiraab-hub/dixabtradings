// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { imagetools } from "vite-imagetools";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      mcpPlugin(),
      imagetools({
        defaultDirectives: (url) => {
          const params = new URLSearchParams({ quality: "80" });
          const p = url.pathname;
          if (p.includes("abbdix-logo.png")) params.set("w", "200");
          else if (p.includes("hero-showroom.jpg")) params.set("w", "800");
          else if (p.includes("product-collection.jpg")) params.set("w", "1200");
          else if (p.includes("community-entrepreneurs.jpg")) params.set("w", "800");
          else if (p.includes("member-dashboard.jpg")) params.set("w", "800");
          else if (p.includes("earnings-mobile.jpg")) params.set("w", "800");
          else if (p.includes("product-flashdisk.jpg")) params.set("w", "600");
          else if (p.includes("product-earbuds.jpg")) params.set("w", "400");
          else if (p.includes("product-bag.jpg")) params.set("w", "400");
          else if (p.includes("product-mug.jpg")) params.set("w", "400");
          else params.set("w", "800");
          return params;
        },
      }),
    ],
  },
});
