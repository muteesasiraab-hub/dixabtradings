import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";

const serverEntry = resolve(".output/server/index.mjs");
const publicDir = resolve(".output/public");

if (!existsSync(serverEntry) || !existsSync(publicDir)) {
  throw new Error("Run the production Vite build before building for Pages.");
}

// Pages advanced mode needs one module Worker in its static output directory.
// The Nitro output contains split SSR modules, so bundle those modules while
// leaving Node built-ins to Cloudflare's nodejs_compat runtime.
await build({
  entryPoints: [serverEntry],
  outfile: resolve(publicDir, "_worker.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  conditions: ["worker", "browser"],
  target: "es2022",
  external: ["node:*"],
  minify: true,
  logLevel: "info",
});
