import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

import pc from "picocolors";

const packageDirs = [
  "packages/panscale-core",
  "packages/panscale-web",
  "packages/panscale-react",
  "packages/panscale-react-native"
];
const cwd = process.cwd();

// Packages whose import graph reaches `react-native`, which ships Flow-typed
// source that plain Node cannot parse (`import typeof …`). Executing them under
// Node tests React Native, not this package, so for these the smoke check is that
// the installed tarball's exports map RESOLVES — `import.meta.resolve` — without
// running the module.
const resolveOnly = new Set(["packages/panscale-react-native"]);

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "pipe", ...options });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += String(d)));
    child.stderr?.on("data", (d) => (stderr += String(d)));
    child.on("close", (code) => {
      if (code === 0) return resolve({ stdout, stderr });
      reject(new Error(cmd + " " + args.join(" ") + " failed with code " + code + "\n" + stderr));
    });
  });
}

// Pack every package first. A package's peer dependencies on its siblings are
// published as exact versions (`workspace:*`), so on a version bump the sibling
// at that version is not on npm yet; the consumer must take it from the tarball.
const packed = [];
for (const relDir of packageDirs) {
  const pkgDir = path.isAbsolute(relDir) ? relDir : path.join(cwd, relDir);
  console.log(pc.cyan("pack-smoke: packing " + pkgDir));

  await run("pnpm", ["install"], { cwd: pkgDir });
  await run("pnpm", ["build"], { cwd: pkgDir });

  const packResult = await run("pnpm", ["pack", "--pack-destination", pkgDir], { cwd: pkgDir });
  const tarball = packResult.stdout.trim().split("\n").pop();
  if (!tarball) {
    throw new Error("Could not determine tarball name from pnpm pack output for " + pkgDir);
  }
  const pkgJson = JSON.parse(await fs.readFile(path.join(pkgDir, "package.json"), "utf8"));
  packed.push({ relDir, name: pkgJson.name, tarballPath: path.join(pkgDir, tarball) });
}

for (const { relDir, name, tarballPath } of packed) {
  console.log(pc.cyan("pack-smoke: checking " + name));
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "scaler-pack-smoke-"));
  await fs.writeFile(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "pack-smoke-consumer", private: true, type: "module" }, null, 2)
  );

  // Add the sibling packages this one lists as peers from their tarballs too, so
  // the install does not look them up on npm.
  const pkg = JSON.parse(await fs.readFile(path.join(cwd, relDir, "package.json"), "utf8"));
  const siblingTarballs = packed
    .filter((p) => p.name !== name && p.name in (pkg.peerDependencies ?? {}))
    .map((p) => p.tarballPath);
  await run("pnpm", ["add", ...siblingTarballs, tarballPath], { cwd: tmpDir });

  const testFile = path.join(tmpDir, "index.mjs");
  const consumerSource = resolveOnly.has(relDir)
    ? "console.log(import.meta.resolve(" + JSON.stringify(name) + "));\n"
    : 'import * as mod from "' + name + '";\n' +
      "console.log(Object.keys(mod).slice(0, 5));\n";
  await fs.writeFile(testFile, consumerSource, "utf8");

  await run("node", [testFile], { cwd: tmpDir });
  console.log(pc.green("pack-smoke: success for " + name));
}
