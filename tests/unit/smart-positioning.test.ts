/**
 * @fileoverview Unit tests for smart card positioning utilities.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { parseDelimitedString, matchesPattern, shouldPositionAtTop } from "../../src/utils.js"
import { config } from "../../src/config.js"

describe("parseDelimitedString", () => {
  it("splits and escapes commas", () => {
    expect(parseDelimitedString("Done,Tasks\\, Urgent", ",")).toEqual(["Done", "Tasks, Urgent"])
    expect(parseDelimitedString("Done , Tasks", ",")).toEqual(["Done", "Tasks"])
    expect(parseDelimitedString("", ",")).toEqual([])
  })
})

describe("matchesPattern", () => {
  it("matches exact and wildcard patterns case-insensitively", () => {
    expect(matchesPattern("Done", "Done")).toBe(true)
    expect(matchesPattern("done", "DONE")).toBe(true)
    expect(matchesPattern("Completed", "Complet*")).toBe(true) // end wildcard
    expect(matchesPattern("Unfinished", "*finish*")).toBe(true) // middle wildcard
    expect(matchesPattern("Redone", "*done")).toBe(true) // beginning wildcard
    expect(matchesPattern("Todo", "Done")).toBe(false)
    expect(matchesPattern("Task.1", "Task.1")).toBe(true) // regex escaping
  })
})

describe("shouldPositionAtTop", () => {
  const originalConfig = [...config.listsAddToTop]

  beforeEach(() => {
    config.listsAddToTop.length = 0
    config.listsAddToTop.push("Done")
  })

  afterEach(() => {
    config.listsAddToTop.length = 0
    config.listsAddToTop.push(...originalConfig)
  })

  it("returns 0 on match, undefined on no match, explicit position always wins", () => {
    expect(shouldPositionAtTop("Done", undefined)).toBe(0)
    expect(shouldPositionAtTop("done", undefined)).toBe(0) // case insensitive
    expect(shouldPositionAtTop("Todo", undefined)).toBeUndefined()
    expect(shouldPositionAtTop("Done", 5)).toBe(5) // explicit wins
  })
})
