import { spawn } from "node:child_process";
import { resolve } from "node:path";

const target = process.argv[2] ?? (process.env.CF_PAGES === "1" ? "pages" : "default");
if (target === "pages") {
  await import("./build-pages.mjs");
} else if (target === "default" || target === "worker") {
  const buildEnv = { ...process.env };
  if (target === "worker") {
    // An explicit Worker release must use the regular Nitro output, including
    // when launched from a Lovable sandbox shell.
    for (const name of [
      "LOVABLE_SANDBOX",
      "DEV_SERVER__PROJECT_PATH",
      "LOVABLE_NITRO_PRESET",
      "NITRO_PRESET",
      "SERVER_PRESET",
    ]) {
      delete buildEnv[name];
    }
  }
  const viteBin = resolve("node_modules/vite/bin/vite.js");
  process.exitCode = await new Promise((done, reject) => {
    const child = spawn(process.execPath, [viteBin, "build"], {
      env: buildEnv,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => done(code ?? 1));
  });
} else {
  throw new Error("Usage: node scripts/build.mjs [worker]");
}
