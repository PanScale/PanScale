import pc from "picocolors";

import { loadSite } from "./site-config.mjs";

try {
  const site = await loadSite();
  const modules = site.sections.npm?.modules ?? [];
  console.log(pc.green("site.config valid for " + site.projectId + " (modules: " + modules.length + ")."));
} catch (err) {
  console.error(pc.red("site.config validation failed."));
  console.error(err);
  process.exitCode = 1;
}
