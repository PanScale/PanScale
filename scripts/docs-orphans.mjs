import fs from "node:fs/promises";
import path from "node:path";

import pc from "picocolors";
import { loadDot } from "../packages/scaler-config/dist/index.js";

const dot = loadDot();
const cwd = process.cwd();
const docsRoot = path.join(cwd, "apps", dot.project.id + "-site", "content", "docs");

const allowlist = new Set([...dot.modules.map((m) => m.id), "index.mdx"]);

let entries = [];
try {
  entries = await fs.readdir(docsRoot);
} catch {
  console.log(pc.yellow("docs-orphans: " + docsRoot + " does not exist yet."));
  process.exit(0);
}

const orphans = entries.filter((dir) => !allowlist.has(dir));
if (orphans.length === 0) {
  console.log(pc.green("docs-orphans: no orphan doc directories found."));
  process.exit(0);
}

const message = "Orphan doc directories detected: " + orphans.join(", ");
if (dot.docs.orphanMode === "ignore") {
  console.log(pc.yellow("docs-orphans ignored: " + message));
  process.exit(0);
}
if (dot.docs.orphanMode === "warn") {
  console.log(pc.yellow("docs-orphans warning: " + message));
  process.exit(0);
}

console.error(pc.red("docs-orphans failed: " + message));
process.exit(1);
