/**
 * @fileoverview Utility function tests
 * Tests generic utility functions
 */

import { describe, it, expect } from "vitest"
import {
  formatDate,
  parseUnixTimestamp,
  toUnixTimestamp,
  getErrorMessage,
} from "../../src/utils.js"

describe("Utility Functions", () => {
  describe("formatDate", () => {
    it("formats date to ISO 8601 string", () => {
      const date = new Date("2025-01-01T00:00:00Z")
      const formatted = formatDate(date)
      expect(formatted).toBe("2025-01-01T00:00:00.000Z")
    })
  })

  describe("parseUnixTimestamp", () => {
    it("converts Unix timestamp to Date", () => {
      const timestamp = 1704067200 // 2024-01-01T00:00:00Z
      const date = parseUnixTimestamp(timestamp)
      expect(date.toISOString()).toBe("2024-01-01T00:00:00.000Z")
    })
  })

  describe("toUnixTimestamp", () => {
    it("converts Date to Unix timestamp", () => {
      const date = new Date("2024-01-01T00:00:00Z")
      const timestamp = toUnixTimestamp(date)
      expect(timestamp).toBe(1704067200)
    })
  })

  describe("getErrorMessage", () => {
    it("extracts message from Error object", () => {
      const error = new Error("Test error")
      expect(getErrorMessage(error)).toBe("Test error")
    })

    it("handles string errors", () => {
      expect(getErrorMessage("String error")).toBe("String error")
    })

    it("handles unknown error types", () => {
      expect(getErrorMessage({ foo: "bar" })).toBe("Unknown error occurred")
    })
  })

  // TODO: Add more utility tests as functions are added
})
