// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { imagetools } from "vite-imagetools";

// Point TanStack Start's Nitro server build at our SSR error wrapper.
export default defineConfig({
  // Pages Git builds must not emit Nitro's Worker deploy redirect. Cloudflare
  // otherwise follows it and rejects Worker-only `main` and `routes` fields.
  ...(process.env.DIXAB_PAGES_BUILD === "1"
    ? { nitro: { preset: "cloudflare-module", cloudflare: { deployConfig: false } } }
    : {}),
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      // The MCP plugin compares Vite's slash-normalized root with native Windows
      // paths and throws during config resolution. Its routes are committed, so
      // skip regeneration on Windows; Linux/Cloudflare builds still run it.
      ...(process.platform === "win32" ? [] : [mcpPlugin()]),
      imagetools({
        defaultDirectives: (url) => {
          const params = new URLSearchParams({ quality: "80" });
          const p = url.pathname;
          if (p.includes("dixab-logo.png")) params.set("w", "200");
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
