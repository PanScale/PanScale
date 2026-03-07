import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: "esm",
  target: "node20",
  sourcemap: true,
  clean: true,
  outDir: "dist"
});
