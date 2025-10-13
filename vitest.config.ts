import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // Test environment
    environment: "node",

    // Global test setup
    globals: true,

    // Default timeout for unit tests (5 seconds)
    // Integration tests override this via CLI flag in package.json scripts
    testTimeout: 5000,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/index.ts", // Entry point - just calls startServer
      ],
    },

    // Include and exclude patterns
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
  },
})

