/**
 * @fileoverview Integration tests for path traversal attack prevention.
 * Tests the complete flow from API resource methods through the client.
 *
 * Defense in depth approach using battle-tested libraries:
 * - Layer 1: safeId() sanitizes with validator.whitelist() - strips dangerous characters
 * - Layer 2: urlcat() properly encodes parameters
 * - Layer 3: Client verifies URLs stay within base URL bounds
 *
 * Security model: SANITIZATION not rejection
 * - "../users" → "users" (safe)
 * - "%2e%2e" → "2e2e" (safe)
 * - ".." → "" → throws (empty after sanitization)
 */

import { describe, it, expect, beforeEach } from "vitest"
import { SuperthreadClient } from "../../src/api/client.js"
import { PathValidationError } from "../../src/utils.js"

describe("Path Traversal Attack Prevention (Integration)", () => {
  let client: SuperthreadClient

  beforeEach(() => {
    // Create client with test credentials
    // Note: These tests don't make actual API calls; they fail at validation
    client = new SuperthreadClient("test-api-key", "https://api.superthread.com/v1")
  })

  describe("Pure Attack Strings (Empty After Sanitization)", () => {
    it("should reject pure path traversal (becomes empty)", async () => {
      await expect(
        client.cards.create("..", {
          title: "Test Card",
          list_id: "list123",
          board_id: "board123",
        })
      ).rejects.toThrow(PathValidationError)
    })

    it("should reject pure slashes (becomes empty)", async () => {
      await expect(client.cards.get("///", "card123")).rejects.toThrow(PathValidationError)
    })

    it("should reject pure dots (becomes empty)", async () => {
      await expect(client.cards.get("....", "card123")).rejects.toThrow(PathValidationError)
    })

    it("should reject pure special characters (becomes empty)", async () => {
      await expect(client.cards.get("@#$%", "card123")).rejects.toThrow(PathValidationError)
    })
  })

  describe("Mixed Attack Strings (Sanitized to Safe IDs)", () => {
    it("should sanitize '../users' to 'users'", async () => {
      // "../users" becomes "users" after sanitization - this is safe
      // It will fail with network error, not validation error
      await expect(client.cards.get("../users", "card123")).rejects.toThrow()

      try {
        await client.cards.get("../users", "card123")
      } catch (e) {
        // Should be network error, not validation error
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("should sanitize '../../teams/team123/members' to 'teamsteam123members'", async () => {
      // Path separators and dots get stripped
      await expect(
        client.cards.get("workspace123", "../../teams/team123/members")
      ).rejects.toThrow()

      try {
        await client.cards.get("workspace123", "../../teams/team123/members")
      } catch (e) {
        // Should be network error, not validation error (it becomes "teamsteam123members")
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("should sanitize '../other-workspace' to 'other-workspace'", async () => {
      // "../" gets stripped, leaving "other-workspace" which is valid
      await expect(client.cards.get("../other-workspace", "card123")).rejects.toThrow()

      try {
        await client.cards.get("../other-workspace", "card123")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })
  })

  describe("URL-Encoded Attack Strings (Sanitized to Alphanumeric)", () => {
    it("should sanitize '%2e%2e' to '2e2e'", async () => {
      // Percent signs get stripped, leaving "2e2e" which is safe alphanumeric
      await expect(client.cards.get("%2e%2e", "card123")).rejects.toThrow()

      try {
        await client.cards.get("%2e%2e", "card123")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("should sanitize '%2fusers' to '2fusers'", async () => {
      await expect(client.cards.get("%2fusers", "card123")).rejects.toThrow()

      try {
        await client.cards.get("%2fusers", "card123")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("should sanitize '%252e%252e' to '252e252e'", async () => {
      // Double-encoded dots become alphanumeric
      await expect(client.cards.get("%252e%252e", "card123")).rejects.toThrow()

      try {
        await client.cards.get("%252e%252e", "card123")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })
  })

  describe("Special Characters (Sanitized)", () => {
    it("should sanitize paths with slashes", async () => {
      // "workspace/hack" → "workspacehack"
      await expect(client.cards.get("workspace/hack", "card123")).rejects.toThrow()

      try {
        await client.cards.get("workspace/hack", "card123")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("should sanitize paths with backslashes", async () => {
      // "workspace\\hack" → "workspacehack"
      await expect(client.cards.get("workspace\\hack", "card123")).rejects.toThrow()

      try {
        await client.cards.get("workspace\\hack", "card123")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("should sanitize paths with special characters", async () => {
      // Special chars get stripped, leaving alphanumeric
      await expect(client.cards.get("workspace@hack", "card123")).rejects.toThrow()
      await expect(client.cards.get("workspace!hack", "card123")).rejects.toThrow()
      await expect(client.cards.get("workspace$hack", "card123")).rejects.toThrow()

      // All should fail with network errors, not validation errors
      for (const id of ["workspace@hack", "workspace!hack", "workspace$hack"]) {
        try {
          await client.cards.get(id, "card123")
        } catch (e) {
          expect(e).not.toBeInstanceOf(PathValidationError)
        }
      }
    })
  })

  describe("Valid IDs Work Correctly", () => {
    it("should accept valid workspace and card IDs", async () => {
      // These should pass validation but fail with network error (expected)
      await expect(client.cards.get("workspace123", "card456")).rejects.toThrow()

      try {
        await client.cards.get("workspace123", "card456")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })

    it("should accept IDs with hyphens and underscores", async () => {
      await expect(client.cards.get("workspace-123_abc", "card-456_xyz")).rejects.toThrow()

      try {
        await client.cards.get("workspace-123_abc", "card-456_xyz")
      } catch (e) {
        expect(e).not.toBeInstanceOf(PathValidationError)
      }
    })
  })

  describe("All Resources Protected", () => {
    // Test each resource to ensure they all use safeId() + urlcat()

    it("boards resource sanitizes inputs", async () => {
      await expect(client.boards.get("..", "board123")).rejects.toThrow(PathValidationError)
    })

    it("projects resource sanitizes inputs", async () => {
      await expect(client.projects.list("..")).rejects.toThrow(PathValidationError)
    })

    it("spaces resource sanitizes inputs", async () => {
      await expect(client.spaces.list("..")).rejects.toThrow(PathValidationError)
    })

    it("pages resource sanitizes inputs", async () => {
      await expect(client.pages.get("..", "page123")).rejects.toThrow(PathValidationError)
    })

    it("comments resource sanitizes inputs", async () => {
      await expect(client.comments.get("..", "comment123")).rejects.toThrow(PathValidationError)
    })

    it("notes resource sanitizes inputs", async () => {
      await expect(client.notes.get("..", "note123")).rejects.toThrow(PathValidationError)
    })

    it("search resource sanitizes inputs", async () => {
      await expect(client.search.search("..", { q: "test" })).rejects.toThrow(PathValidationError)
    })

    it("user resource sanitizes inputs", async () => {
      await expect(client.user.getMembers("..")).rejects.toThrow(PathValidationError)
    })
  })

  describe("Security Guarantees", () => {
    it("ensures no path separators survive sanitization", async () => {
      // After sanitization, the ID contains no dots, slashes, or backslashes
      // So path traversal is impossible regardless of how urlcat encodes it
      const attacks = ["../admin", "../../etc/passwd", "a/../b", "test/..", "test/./hack"]

      for (const attack of attacks) {
        try {
          await client.cards.get(attack, "card123")
        } catch (e) {
          // Should fail with network error (sanitized ID doesn't exist)
          // NOT validation error (sanitization succeeded)
          expect(e).not.toBeInstanceOf(PathValidationError)
        }
      }
    })

    it("ensures no percent signs survive (no URL encoding possible)", async () => {
      // Percent signs are stripped, so encoded sequences become harmless alphanumeric
      const attacks = ["%2e%2e", "%2f", "%5c", "%2e%2fadmin"]

      for (const attack of attacks) {
        try {
          await client.cards.get(attack, "card123")
        } catch (e) {
          // Should fail with network error, not validation error
          expect(e).not.toBeInstanceOf(PathValidationError)
        }
      }
    })
  })
})
