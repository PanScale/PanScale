// The site's site.config.ts (the single source of the module list since the
// Site Factory migration), loaded through @byoklab/site-config, which is a
// dependency of the site, so it is resolved from the site's directory.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { tsImport } from "tsx/esm/api";

export const siteDir = fileURLToPath(new URL("../apps/panscale-site/", import.meta.url));

export async function loadSite() {
  const entry = createRequire(path.join(siteDir, "package.json")).resolve("@byoklab/site-config/node");
  const { loadSiteConfigFile } = await tsImport(pathToFileURL(entry).href, import.meta.url);
  const { config } = await loadSiteConfigFile(path.join(siteDir, "site.config.ts"));
  return config;
}
