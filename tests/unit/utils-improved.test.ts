/**
 * @fileoverview Unit tests for utility functions using validator library.
 */

import { describe, it, expect } from "vitest"
import { safeId, PathValidationError } from "../../src/utils.js"

describe("safeId Sanitization", () => {
  describe("Valid Inputs", () => {
    it("accepts alphanumeric with hyphens and underscores", () => {
      expect(safeId("id", "abc123")).toBe("abc123")
      expect(safeId("id", "workspace-123")).toBe("workspace-123")
      expect(safeId("id", "user_id_456")).toBe("user_id_456")
      expect(safeId("id", "ABC-123_xyz")).toBe("ABC-123_xyz")
    })

    it("trims leading and trailing whitespace", () => {
      expect(safeId("id", "  abc123  ")).toBe("abc123")
      expect(safeId("id", "\tabc\n")).toBe("abc")
    })
  })

  describe("Invalid Inputs (Throws)", () => {
    it("rejects empty or whitespace-only strings", () => {
      expect(() => safeId("id", "")).toThrow(PathValidationError)
      expect(() => safeId("id", "   ")).toThrow(PathValidationError)
    })

    it("rejects non-string values", () => {
      expect(() => safeId("id", null as unknown as string)).toThrow(PathValidationError)
      expect(() => safeId("id", undefined as unknown as string)).toThrow(PathValidationError)
      expect(() => safeId("id", 123 as unknown as string)).toThrow(PathValidationError)
    })

    it("rejects strings that become empty after sanitization", () => {
      expect(() => safeId("id", "..")).toThrow(PathValidationError)
      expect(() => safeId("id", "///")).toThrow(PathValidationError)
      expect(() => safeId("id", "@#$%")).toThrow(PathValidationError)
    })

    it("provides descriptive error messages", () => {
      expect(() => safeId("workspaceId", "")).toThrow("workspaceId must be a non-empty string")
      expect(() => safeId("cardId", "@#$")).toThrow("cardId must contain only letters")
    })
  })

  describe("Sanitization (Strips Dangerous Characters)", () => {
    it("sanitizes path traversal sequences", () => {
      expect(safeId("id", "../evil")).toBe("evil")
      expect(safeId("id", "../../admin")).toBe("admin")
      expect(safeId("id", "....//etcpasswd")).toBe("etcpasswd")
    })

    it("sanitizes path separators", () => {
      expect(safeId("id", "a/b")).toBe("ab")
      expect(safeId("id", "a\\b")).toBe("ab")
      expect(safeId("id", "etc/passwd")).toBe("etcpasswd")
    })

    it("sanitizes URL-encoded sequences", () => {
      expect(safeId("id", "%2e%2e")).toBe("2e2e")
      expect(safeId("id", "%2fusers")).toBe("2fusers")
      expect(safeId("id", "%5cwindows")).toBe("5cwindows")
    })

    it("sanitizes special characters", () => {
      expect(safeId("id", "test@example.com")).toBe("testexamplecom")
      expect(safeId("id", "test$money")).toBe("testmoney")
      expect(safeId("id", "test\0null")).toBe("testnull")
      expect(safeId("id", "abc@123#def")).toBe("abc123def")
    })

    it("sanitizes unicode characters", () => {
      expect(safeId("id", "\u2024\u2024abc")).toBe("abc")
      expect(safeId("id", "\uFF0Ftest")).toBe("test")
    })
  })

  describe("Security Guarantees", () => {
    it("ensures no path separators can survive sanitization", () => {
      const attacks = [
        "../",
        "./",
        "/..",
        "/.",
        "\\",
        "..\\",
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32",
      ]

      attacks.forEach((attack) => {
        const result = safeId("id", "test" + attack + "file")
        expect(result).not.toContain(".")
        expect(result).not.toContain("/")
        expect(result).not.toContain("\\")
      })
    })

    it("ensures no percent signs survive (prevents encoded attacks)", () => {
      const attacks = ["%2e%2f", "%252e%252e", "test%2e%2ffile", "%2fusers%2fme"]

      attacks.forEach((attack) => {
        const result = safeId("id", attack)
        expect(result).not.toContain("%")
      })
    })

    it("ensures only safe characters remain: [a-zA-Z0-9_-]", () => {
      const attacks = ["test@evil.com", "../../../etc/passwd", "admin$command", "test\0null\nbyte"]

      attacks.forEach((attack) => {
        const result = safeId("id", attack)
        expect(result).toMatch(/^[a-zA-Z0-9_-]+$/)
      })
    })
  })
})
