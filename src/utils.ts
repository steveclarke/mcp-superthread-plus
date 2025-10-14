/**
 * @fileoverview Generic utility functions for the MCP Superthread Plus server.
 * Uses battle-tested npm packages (validator) for input sanitization.
 */

import validator from "validator"

/**
 * Error thrown when an ID fails validation.
 */
export class PathValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PathValidationError"
  }
}

/**
 * Sanitizes an ID to only allow alphanumeric, hyphen, and underscore.
 * Strips any other characters and validates the result is non-empty.
 *
 * Uses validator.whitelist() from the validator package - a proven,
 * battle-tested function with millions of weekly downloads.
 *
 * This prevents path traversal attacks by:
 * 1. Stripping encoded sequences like %2e%2e, %2f, etc.
 * 2. Removing path separators /, \
 * 3. Removing traversal patterns ..
 * 4. Ensuring only safe characters remain
 *
 * @param name - Descriptive name for error messages (e.g., "workspaceId")
 * @param value - The ID value to sanitize
 * @returns The sanitized ID
 * @throws {PathValidationError} If the value is empty or becomes empty after sanitization
 *
 * @example
 * safeId("workspaceId", "workspace123") // Returns: "workspace123"
 * safeId("cardId", "card-456_test") // Returns: "card-456_test"
 * safeId("workspaceId", "../evil") // Throws: only letters, numbers, hyphen, underscore
 * safeId("cardId", "%2e%2e") // Throws: only letters, numbers, hyphen, underscore
 */
export function safeId(name: string, value: string): string {
  if (!value || typeof value !== "string") {
    throw new PathValidationError(`${name} must be a non-empty string`)
  }

  const trimmed = validator.trim(value)
  const cleaned = validator.whitelist(trimmed, "a-zA-Z0-9_-")

  if (!validator.isLength(cleaned, { min: 1 })) {
    throw new PathValidationError(
      `${name} must contain only letters, numbers, hyphen, or underscore`
    )
  }

  return cleaned
}
