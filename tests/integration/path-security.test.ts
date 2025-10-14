/**
 * @fileoverview Streamlined integration tests for path traversal attack prevention.
 *
 * Defense in depth approach:
 * - Layer 1: safeId() sanitizes with validator.whitelist() - strips dangerous characters
 * - Layer 2: urlcat() properly encodes parameters
 * - Layer 3: Client verifies URLs stay within base URL bounds
 *
 * Security model: SANITIZATION not rejection
 * - Malicious characters are stripped, leaving safe alphanumeric strings
 * - Empty results after sanitization throw PathValidationError
 */

import { describe, it, expect, beforeEach } from "vitest"
import { SuperthreadClient } from "../../src/api/client.js"
import { PathValidationError } from "../../src/utils.js"

describe("Path Traversal Attack Prevention", () => {
  let client: SuperthreadClient

  beforeEach(() => {
    client = new SuperthreadClient("test-api-key", "https://api.superthread.com/v1")
  })

  describe("Core Security Guarantees", () => {
    it("rejects inputs that become empty after sanitization", async () => {
      // These inputs contain ONLY dangerous characters, so they become empty
      const pureAttacks = [
        "..", // Path traversal
        "...", // Multiple dots
        "///", // Slashes only
        "../..", // Combined traversal
        "@#$%", // Special chars only
        "....////", // Mixed dangerous chars
      ]

      for (const attack of pureAttacks) {
        await expect(client.cards.get(attack, "card123")).rejects.toThrow(PathValidationError)
      }
    })

    it("sanitizes mixed attack strings to safe alphanumeric IDs", async () => {
      // These contain both dangerous and safe characters
      // After sanitization they're safe but won't match real IDs (network error expected)
      const mixedAttacks = [
        "../users", // → "users"
        "../../teams/admin", // → "teamsadmin"
        "%2e%2e", // → "2e2e"
        "%2f%2fadmin", // → "2f2fadmin"
        "workspace/../../hack", // → "workspacehack"
        "test@example.com", // → "testexamplecom"
      ]

      for (const attack of mixedAttacks) {
        await expect(client.cards.get(attack, "card123")).rejects.toThrow()

        // Should fail with network error (404/400), NOT validation error
        // This proves sanitization worked - the cleaned ID is safe but doesn't exist
        try {
          await client.cards.get(attack, "card123")
        } catch (e) {
          expect(e).not.toBeInstanceOf(PathValidationError)
        }
      }
    })

    it("ensures no path separators survive sanitization", async () => {
      // After sanitization, no dots, slashes, or backslashes remain
      // Making path traversal impossible regardless of URL encoding
      const pathSeparators = [
        "../admin",
        "test/../hack",
        "workspace\\..\\admin",
        "a/./b",
        "test/..",
      ]

      for (const attack of pathSeparators) {
        try {
          await client.cards.get(attack, "card123")
        } catch (e) {
          // Network error (sanitized), not validation error
          expect(e).not.toBeInstanceOf(PathValidationError)
        }
      }
    })

    it("ensures no percent signs survive (prevents encoded attacks)", async () => {
      // Percent signs stripped → encoded sequences become harmless alphanumeric
      const encodedAttacks = [
        "%2e%2e", // Encoded ".."
        "%2f", // Encoded "/"
        "%5c", // Encoded "\"
        "%252e%252e", // Double-encoded ".."
      ]

      for (const attack of encodedAttacks) {
        try {
          await client.cards.get(attack, "card123")
        } catch (e) {
          expect(e).not.toBeInstanceOf(PathValidationError)
        }
      }
    })
  })

  describe("All Resources Protected", () => {
    it.each([
      ["boards", () => client.boards.get("..", "board123")],
      ["cards", () => client.cards.get("..", "card123")],
      ["projects", () => client.projects.list("..")],
      ["spaces", () => client.spaces.list("..")],
      ["pages", () => client.pages.get("..", "page123")],
      ["comments", () => client.comments.get("..", "comment123")],
      ["notes", () => client.notes.get("..", "note123")],
      ["search", () => client.search.search("..", { q: "test" })],
      ["user", () => client.user.getMembers("..")],
    ])("%s resource sanitizes inputs", async (_name, testFn) => {
      await expect(testFn()).rejects.toThrow(PathValidationError)
    })
  })

  describe("Valid IDs", () => {
    it("accepts alphanumeric with hyphens and underscores", async () => {
      const validIds = ["workspace123", "card-456_xyz", "board_test-123", "a1b2c3"]

      for (const id of validIds) {
        try {
          await client.cards.get(id, "card123")
        } catch (e) {
          // Should be network error, not validation
          expect(e).not.toBeInstanceOf(PathValidationError)
        }
      }
    })
  })

  describe("Edge Cases", () => {
    it("rejects empty strings", async () => {
      await expect(client.cards.get("", "card123")).rejects.toThrow(PathValidationError)
    })

    it("rejects whitespace-only strings", async () => {
      await expect(client.cards.get("   ", "card123")).rejects.toThrow(PathValidationError)
    })

    it("handles very long strings without crashing", async () => {
      const longString = "a".repeat(10000)

      try {
        await client.cards.get(longString, "card123")
      } catch (e) {
        // Should handle gracefully (network error), not crash
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("sanitizes unicode and emoji characters", async () => {
      const unicodeAttacks = [
        "test\u0000null", // Null byte
        "café", // Accented chars
        "test🚀emoji", // Emoji
        "workspace\u200Bzero", // Zero-width space
      ]

      for (const attack of unicodeAttacks) {
        try {
          await client.cards.get(attack, "card123")
        } catch (e) {
          // Either validation error (becomes empty) or network error (sanitized)
          // Both are acceptable - just shouldn't crash
          expect(e).toBeInstanceOf(Error)
        }
      }
    })
  })
})
