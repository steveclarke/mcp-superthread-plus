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
    expect(config).toHaveProperty("baseUrl")
  })

  it("has correct default values", () => {
    // baseUrl should default to production API
    expect(config.baseUrl).toBe("https://api.superthread.com/v1")

    // apiKey defaults to empty string (validated at runtime in createClient)
    expect(typeof config.apiKey).toBe("string")
  })
})
