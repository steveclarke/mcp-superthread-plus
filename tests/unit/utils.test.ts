/**
 * @fileoverview Unit tests for utility functions using validator library.
 */

import { describe, it, expect } from "vitest"
import { safeId, PathValidationError } from "../../src/utils.js"

describe("Path Validation Security", () => {
  describe("safeId", () => {
    it("should accept valid alphanumeric IDs", () => {
      expect(safeId("workspaceId", "abc123")).toBe("abc123")
      expect(safeId("cardId", "workspace-123")).toBe("workspace-123")
      expect(safeId("userId", "user_id_456")).toBe("user_id_456")
      expect(safeId("testId", "ABC-123_xyz")).toBe("ABC-123_xyz")
    })

    it("should trim whitespace", () => {
      expect(safeId("id", "  abc123  ")).toBe("abc123")
      expect(safeId("id", "\tabc\n")).toBe("abc")
    })

    it("should reject empty strings", () => {
      expect(() => safeId("workspaceId", "")).toThrow(PathValidationError)
      expect(() => safeId("workspaceId", "")).toThrow("must be a non-empty string")
    })

    it("should reject non-string values", () => {
      expect(() => safeId("id", null as unknown as string)).toThrow(PathValidationError)
      expect(() => safeId("id", undefined as unknown as string)).toThrow(PathValidationError)
      expect(() => safeId("id", 123 as unknown as string)).toThrow(PathValidationError)
    })

    it("should sanitize path traversal sequences", () => {
      // validator.whitelist strips dots and slashes, leaving valid characters
      expect(safeId("workspaceId", "../evil")).toBe("evil") // dots/slashes stripped
      expect(safeId("workspaceId", "../../admin")).toBe("admin") // dots/slashes stripped
      // Pure traversal with no valid chars throws
      expect(() => safeId("workspaceId", "..")).toThrow(PathValidationError)
      expect(() => safeId("workspaceId", "../..")).toThrow(PathValidationError)
    })

    it("should sanitize path separators", () => {
      // Slashes get stripped
      expect(safeId("cardId", "a/b")).toBe("ab")
      expect(safeId("cardId", "a\\b")).toBe("ab")
      expect(safeId("cardId", "etc/passwd")).toBe("etcpasswd")
      // Pure slashes throw
      expect(() => safeId("cardId", "///")).toThrow(PathValidationError)
    })

    it("should sanitize URL-encoded sequences", () => {
      // %2e, %2f, etc. get stripped, leaving the hex digits
      expect(safeId("workspaceId", "%2e%2e")).toBe("2e2e")
      expect(safeId("cardId", "%2fusers")).toBe("2fusers")
      expect(safeId("cardId", "%5cwindows")).toBe("5cwindows")
      // These become safe alphanumeric strings, not traversal attacks
    })

    it("should sanitize special characters", () => {
      expect(safeId("id", "test@example.com")).toBe("testexamplecom")
      expect(safeId("id", "test$money")).toBe("testmoney")
      expect(safeId("id", "test&param=value")).toBe("testparamvalue")
    })

    it("should sanitize null bytes", () => {
      expect(safeId("id", "test\0null")).toBe("testnull")
    })

    it("should allow hyphens and underscores", () => {
      expect(safeId("id", "test-with-hyphens")).toBe("test-with-hyphens")
      expect(safeId("id", "test_with_underscores")).toBe("test_with_underscores")
      expect(safeId("id", "mixed-style_id")).toBe("mixed-style_id")
    })

    it("should provide descriptive error messages", () => {
      expect(() => safeId("workspaceId", "")).toThrow("workspaceId must be a non-empty string")
      expect(() => safeId("cardId", "@#$")).toThrow("cardId must contain only letters")
    })

    it("should sanitize mixed valid and invalid characters", () => {
      // validator.whitelist strips invalid chars
      expect(safeId("id", "abc@123")).toBe("abc123")
      expect(safeId("id", "test-user#1")).toBe("test-user1")
    })

    it("should reject IDs that become empty after sanitization", () => {
      expect(() => safeId("id", "@#$%")).toThrow("only letters, numbers")
      expect(() => safeId("id", "!!!")).toThrow("only letters, numbers")
      expect(() => safeId("id", "   @@@   ")).toThrow("only letters, numbers")
    })
  })

  describe("Real-World Attack Scenarios", () => {
    it("should sanitize common path traversal attacks into harmless strings", () => {
      // The key insight: after sanitization, these become harmless alphanumeric strings
      expect(safeId("workspaceId", "../../../etc/passwd")).toBe("etcpasswd")
      expect(safeId("workspaceId", "..%2F..%2F..%2Fetc%2Fpasswd")).toBe("2F2F2Fetc2Fpasswd")
      expect(safeId("workspaceId", "%2e%2e%2f%2e%2e%2f")).toBe("2e2e2f2e2e2f")
      expect(safeId("workspaceId", "....//....//etc/passwd")).toBe("etcpasswd")
      expect(safeId("workspaceId", "..\\..\\..\\windows\\system32")).toBe("windowssystem32")

      // The sanitized strings are valid IDs but can't traverse paths
      // urlcat will then properly encode them in the URL
    })

    it("should sanitize attempts to access other endpoints", () => {
      expect(safeId("id", "%2fusers")).toBe("2fusers")
      expect(safeId("id", "%2fadmin")).toBe("2fadmin")
      expect(safeId("id", "/api/admin")).toBe("apiadmin")
      expect(safeId("id", "..%2fusers%2fme")).toBe("2fusers2fme")

      // Again, these become harmless alphanumeric IDs
    })

    it("should sanitize unicode and special encodings", () => {
      // Unicode gets stripped if not in whitelist
      expect(safeId("id", "\u2024\u2024abc")).toBe("abc")
      expect(safeId("id", "\uFF0Ftest")).toBe("test")
    })

    it("should throw for pure attack strings with no valid characters", () => {
      expect(() => safeId("id", "../..")).toThrow(PathValidationError)
      expect(() => safeId("id", "///")).toThrow(PathValidationError)
      // Note: "%2e%2e" becomes "2e2e" which is valid alphanumeric - this is fine!
      // The important thing is that dots and slashes are stripped
    })
  })

  describe("Security Guarantee", () => {
    it("ensures no path separators or dots can survive", () => {
      const dangerous = ["../", "./", "/..", "/.", "\\", "..\\"]
      dangerous.forEach((d) => {
        const result = safeId("id", "test" + d + "file")
        expect(result).not.toContain(".")
        expect(result).not.toContain("/")
        expect(result).not.toContain("\\")
      })
    })

    it("ensures percent signs are stripped (no URL encoding possible)", () => {
      const result = safeId("id", "test%2e%2ffile")
      expect(result).not.toContain("%")
      // Result is "test2e2ffile" - harmless
    })
  })
})
