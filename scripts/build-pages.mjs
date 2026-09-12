import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { build } from "esbuild";

const projectRoot = resolve();
const buildEnv = { ...process.env, DIXAB_PAGES_BUILD: "1" };
const pagesConfig = JSON.parse(await readFile(resolve("wrangler.jsonc"), "utf8"));
// Cloudflare build variables override Vite's tracked .env. Derive the browser
// values from the same Pages config as the server so an old dashboard VITE_*
// value cannot silently point the browser at another Supabase project.
for (const name of ["SUPABASE_PROJECT_ID", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"]) {
  const value = pagesConfig.vars?.[name];
  if (typeof value !== "string" || !value) {
    throw new Error(`Missing ${name} in the Pages Wrangler config.`);
  }
  buildEnv[`VITE_${name}`] = value;
}
// Lovable's sandbox preset forces `dist` Worker output and a Wrangler deploy
// redirect. Pages Git builds need the normal Nitro output for our bundle.
for (const name of [
  "LOVABLE_SANDBOX",
  "DEV_SERVER__PROJECT_PATH",
  "LOVABLE_NITRO_PRESET",
  "NITRO_PRESET",
  "SERVER_PRESET",
]) {
  delete buildEnv[name];
}

const viteBin = resolve("node_modules/vite/bin/vite.js");
const buildCode = await new Promise((done, reject) => {
  const child = spawn(process.execPath, [viteBin, "build"], {
    cwd: projectRoot,
    env: buildEnv,
    stdio: "inherit",
  });
  child.on("error", reject);
  child.on("exit", (code) => done(code ?? 1));
});
if (buildCode !== 0) {
  process.exitCode = buildCode;
  throw new Error("The Vite build failed; Pages output was not generated.");
}

// A previous local Worker build may have left a redirect that Wrangler uses
// even when a subsequent Pages build emitted no deploy configuration.
await rm(resolve(".wrangler/deploy/config.json"), { force: true });

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
