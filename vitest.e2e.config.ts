import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/** End-to-end pipeline test against Postgres + PostgREST. Run by CI; see tests/e2e/pipeline.e2e.ts. */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/e2e/server-only.ts", import.meta.url)),
    },
  },
  test: { include: ["tests/e2e/**/*.e2e.ts"], testTimeout: 60_000, hookTimeout: 60_000, fileParallelism: false },
});
