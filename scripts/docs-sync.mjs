import fs from "node:fs/promises";
import path from "node:path";

import pc from "picocolors";
import { loadSite } from "./site-config.mjs";

const site = await loadSite();
const cwd = process.cwd();

const requiredFiles = ["index.mdx", "getting-started.mdx", "api.mdx"];

let created = 0;
for (const mod of site.sections.npm?.modules ?? []) {
  const docsDir = path.join(cwd, mod.folder.docsDir);
  await fs.mkdir(docsDir, { recursive: true });

  for (const fileName of requiredFiles) {
    const filePath = path.join(docsDir, fileName);
    try {
      await fs.access(filePath);
    } catch {
      const title = fileName.replace(/.mdx$/, "");
      const scaffold = "---\ntitle: " + title + "\n---\n\n# " + title + "\n";
      await fs.writeFile(filePath, scaffold, "utf8");
      created += 1;
    }
  }
}

if (created > 0) {
  console.log(pc.yellow("docs-sync created " + created + " missing doc skeleton files."));
} else {
  console.log(pc.green("docs-sync: all required doc skeleton files exist."));
}
