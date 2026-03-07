import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import pc from "picocolors";

const packageDirs = [
  "packages/scaler-core",
  "packages/scaler-web",
  "packages/scaler-react",
  "packages/scaler-react-native"
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

async function listChangedFiles() {
  try {
    const { stdout } = await run("git", ["diff", "--name-only", "HEAD"], { cwd });
    return stdout
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    console.log(pc.yellow("changeset-required: git not available; skipping."));
    return [];
  }
}

function hasPackageChanges(changedFiles) {
  return changedFiles.some((file) => packageDirs.some((dir) => file.startsWith(dir + path.sep)));
}

async function hasChangeset() {
  const dir = path.join(cwd, ".changeset");
  try {
    const entries = await fs.readdir(dir);
    return entries.some((e) => e.endsWith(".md"));
  } catch {
    return false;
  }
}

const changedFiles = await listChangedFiles();
if (changedFiles.length === 0) {
  console.log(pc.green("changeset-required: no changes detected."));
  process.exit(0);
}

if (!hasPackageChanges(changedFiles)) {
  console.log(pc.green("changeset-required: no publishable package changes detected."));
  process.exit(0);
}

if (await hasChangeset()) {
  console.log(pc.green("changeset-required: changeset detected."));
  process.exit(0);
}

console.error(pc.red("changeset-required: publishable package changes detected but no changeset found."));
process.exit(1);
