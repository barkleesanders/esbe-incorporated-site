import { defineConfig } from "vitest/config";

// Root is pinned to THIS directory: without a local config, vitest climbs
// parent directories looking for one and can pick up an unrelated config
// from the home directory (measured 2026-10-26 on the build machine — it
// loaded ~/vite.config.ts and silently ran zero tests).
export default defineConfig({
  test: {
    include: ["tests/*.test.ts"],
    environment: "node",
  },
});
