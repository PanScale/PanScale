import fs from "node:fs/promises";
import path from "node:path";

import pc from "picocolors";
import { loadSite, siteDir } from "./site-config.mjs";

const site = await loadSite();
const docsRoot = path.join(siteDir, "content", "docs");

const allowlist = new Set([...(site.sections.npm?.modules ?? []).map((m) => m.id), "index.mdx"]);

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
// The DOT's `docs.orphanMode` was "warn"; site.config has no such field, so orphans warn.
console.log(pc.yellow("docs-orphans warning: " + message));
