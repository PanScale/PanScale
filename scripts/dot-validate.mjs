import pc from "picocolors";

import { loadDot } from "../packages/scaler-config/dist/index.js";

try {
  const dot = loadDot();
  console.log(pc.green("DOT valid for " + dot.project.id + " (modules: " + dot.modules.length + ")."));
} catch (err) {
  console.error(pc.red("DOT validation failed."));
  console.error(err);
  process.exitCode = 1;
}
