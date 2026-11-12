import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@panscale/core": fileURLToPath(new URL("../panscale-core/src/index.ts", import.meta.url))
    }
  },
  test: { include: ["test/**/*.test.ts"] }
});
