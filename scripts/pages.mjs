import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import { spawn } from "node:child_process";

const action = process.argv[2];
if (action !== "dev" && action !== "deploy") {
  throw new Error("Usage: node scripts/pages.mjs <dev|deploy>");
}

const outputDir = resolve(".output/public");
const workerFile = join(outputDir, "_worker.js");
if (!existsSync(workerFile)) {
  throw new Error("Build the Pages Worker with npm run build:pages first.");
}

// Pages requires a standard wrangler.jsonc at the CLI working directory. Run
// from a small temporary directory so the Workers deploy redirect in this repo
// cannot be mistaken for Pages configuration.
const tempRoot = resolve(tmpdir());
const stageDir = await mkdtemp(join(tempRoot, "dixab-pages-"));
const config = JSON.parse(await readFile(resolve("cloudflare/pages/wrangler.jsonc"), "utf8"));
config.pages_build_output_dir = outputDir;
delete config.$schema;
await writeFile(join(stageDir, "wrangler.jsonc"), JSON.stringify(config, null, 2));

const wranglerBin = resolve("node_modules/wrangler/bin/wrangler.js");
const args = [wranglerBin, "pages", action, outputDir];
if (action === "deploy") args.push("--project-name", "dixabtradings");
if (action === "dev" && existsSync(resolve(".dev.vars"))) {
  args.push("--env-file", resolve(".dev.vars"));
}

try {
  const exitCode = await new Promise((done, reject) => {
    const child = spawn(process.execPath, args, { cwd: stageDir, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => done(code ?? 1));
  });
  process.exitCode = exitCode;
} finally {
  const resolvedStage = resolve(stageDir);
  if (
    !resolvedStage.startsWith(tempRoot + sep) ||
    !basename(resolvedStage).startsWith("dixab-pages-")
  ) {
    throw new Error("Refusing to remove an unexpected Pages staging path.");
  }
  await rm(resolvedStage, { recursive: true, force: true });
}
