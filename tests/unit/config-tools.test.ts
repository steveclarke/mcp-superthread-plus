/**
 * @fileoverview Tests for selective tool enabling configuration.
 */

import { describe, it, expect } from "vitest"
import { parseDelimitedString } from "../../src/utils.js"

describe("Selective Tool Enabling Configuration", () => {
  describe("parseDelimitedString utility", () => {
    it("should parse comma-separated tool domains correctly", () => {
      const result = parseDelimitedString("cards,boards,projects", ",", (s) => s.toLowerCase())

      expect(result).toEqual(["cards", "boards", "projects"])
      expect(result.length).toBe(3)
    })

    it("should handle whitespace in comma-separated list", () => {
      const result = parseDelimitedString(" cards , boards , projects ", ",", (s) =>
        s.toLowerCase()
      )

      expect(result).toEqual(["cards", "boards", "projects"])
    })

    it("should convert domain names to lowercase when transform is provided", () => {
      const result = parseDelimitedString("Cards,BOARDS,Projects", ",", (s) => s.toLowerCase())

      expect(result).toEqual(["cards", "boards", "projects"])
    })

    it("should handle empty string as no tools enabled", () => {
      const result = parseDelimitedString("", ",")

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })

    it("should handle undefined as no tools enabled", () => {
      const result = parseDelimitedString(undefined, ",")

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })

    it("should filter out empty items from comma-separated list", () => {
      const result = parseDelimitedString("cards,,boards,,,projects", ",", (s) => s.toLowerCase())

      expect(result).toEqual(["cards", "boards", "projects"])
    })

    it("should handle single item", () => {
      const result = parseDelimitedString("cards", ",", (s) => s.toLowerCase())

      expect(result).toEqual(["cards"])
    })

    it("should work without transform function", () => {
      const result = parseDelimitedString("Cards,Boards,Projects", ",")

      expect(result).toEqual(["Cards", "Boards", "Projects"])
    })
  })
})
