import path from "node:path";
import { spawn } from "node:child_process";

import pc from "picocolors";

const cwd = process.cwd();
const configPackageDir = "packages/panscale-config";
const moduleDirs = [
  "packages/panscale-core",
  "packages/panscale-web",
  "packages/panscale-react",
  "packages/panscale-react-native"
];

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", ...options });
    child.on("close", (code) => {
      if (code === 0) return resolve(undefined);
      reject(new Error(cmd + " " + args.join(" ") + " failed with code " + code));
    });
  });
}

async function runIn(dir, cmd, args) {
  const abs = path.join(cwd, dir);
  await run(cmd, args, { cwd: abs });
}

async function main() {
  console.log(pc.cyan("== Build config package =="));
  await runIn(configPackageDir, "pnpm", ["install"]);
  await runIn(configPackageDir, "pnpm", ["build"]);

  console.log(pc.cyan("== DOT validate =="));
  await run("node", ["./scripts/dot-validate.mjs"], { cwd });

  console.log(pc.cyan("== Docs sync =="));
  await run("node", ["./scripts/docs-sync.mjs"], { cwd });

  console.log(pc.cyan("== Docs orphans =="));
  await run("node", ["./scripts/docs-orphans.mjs"], { cwd });

  console.log(pc.cyan("== Build + publint + attw =="));
  for (const dir of moduleDirs) {
    await runIn(dir, "pnpm", ["install"]);
    await runIn(dir, "pnpm", ["build"]);
    await runIn(dir, "pnpm", ["exec", "publint"]);
    await runIn(dir, "pnpm", [
      "exec",
      "attw",
      "--pack",
      ".",
      "--ignore-rules",
      "cjs-resolves-to-esm"
    ]);
  }

  console.log(pc.cyan("== Pack smoke =="));
  await run("node", ["./scripts/pack-smoke.mjs"], { cwd });

  console.log(pc.cyan("== Changeset required =="));
  await run("node", ["./scripts/changeset-required.mjs"], { cwd });

  console.log(pc.green("All checks passed."));
}

main().catch((err) => {
  console.error(pc.red(String(err)));
  process.exit(1);
});
