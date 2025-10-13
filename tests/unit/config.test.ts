/**
 * @fileoverview Configuration tests
 * Tests configuration loading from environment variables
 */

import { describe, it, expect } from "vitest"
import { config } from "../../src/config.js"

describe("Configuration", () => {
  it("loads configuration from environment variables", () => {
    expect(config).toBeDefined()
    expect(config).toHaveProperty("apiKey")
    expect(config).toHaveProperty("workspaceId")
    expect(config).toHaveProperty("baseUrl")
  })

  it("has correct default base URL", () => {
    expect(config.baseUrl).toBe("https://api.superthread.com/v1")
  })

  // TODO: Add more config tests
  // - Test environment variable loading
  // - Test config validation
  // - Test default values
})
