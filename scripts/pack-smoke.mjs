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

for (const relDir of packageDirs) {
  const pkgDir = path.isAbsolute(relDir) ? relDir : path.join(cwd, relDir);
  console.log(pc.cyan("pack-smoke: checking " + pkgDir));

  await run("pnpm", ["install"], { cwd: pkgDir });
  await run("pnpm", ["build"], { cwd: pkgDir });

  const packResult = await run("pnpm", ["pack", "--pack-destination", pkgDir], { cwd: pkgDir });
  const tarball = packResult.stdout.trim().split("\n").pop();
  if (!tarball) {
    throw new Error("Could not determine tarball name from pnpm pack output for " + pkgDir);
  }

  const tarballPath = path.join(pkgDir, tarball);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "scaler-pack-smoke-"));
  await fs.writeFile(
    path.join(tmpDir, "package.json"),
    JSON.stringify({ name: "pack-smoke-consumer", private: true, type: "module" }, null, 2)
  );

  await run("pnpm", ["add", tarballPath], { cwd: tmpDir });

  const pkgJson = JSON.parse(await fs.readFile(path.join(pkgDir, "package.json"), "utf8"));
  const importTarget = pkgJson.name;
  const testFile = path.join(tmpDir, "index.mjs");
  const consumerSource =
    'import * as mod from "' + importTarget + '";\n' +
    "console.log(Object.keys(mod).slice(0, 5));\n";
  await fs.writeFile(testFile, consumerSource, "utf8");

  await run("node", [testFile], { cwd: tmpDir });
  console.log(pc.green("pack-smoke: success for " + importTarget));
}
