/**
 * @fileoverview Generic utility functions for the MCP Superthread Plus server.
 * Uses battle-tested npm packages (validator) for input sanitization.
 */

import validator from "validator"
import type { SuperthreadClient } from "./api/client.js"

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

/**
 * Converts {{@mentions}} in content to SuperThread's HTML user-mention tags.
 * Uses template syntax {{@Name}} to unambiguously identify mention boundaries.
 * Non-matching names are left as plain text (graceful degradation).
 *
 * @param content - Comment content that may contain {{@Name}} patterns
 * @param workspaceId - Workspace ID to fetch members from
 * @param client - SuperthreadClient instance
 * @returns Content with {{@mentions}} converted to HTML tags
 *
 * @example
 * // Input: "Hey {{@Steve Clarke}}, check this out!"
 * // Output: "<p>Hey <user-mention data-type=\"mention\" user-id=\"u123\" ...></user-mention>, check this out!</p>"
 */
export async function formatMentions(
  content: string,
  workspaceId: string,
  client: SuperthreadClient
): Promise<string> {
  // If content is empty or doesn't contain {{@, return as-is wrapped in <p> tags
  if (!content || !content.includes("{{@")) {
    return content.startsWith("<") ? content : `<p>${content}</p>`
  }

  // Fetch workspace members
  let membersResponse
  try {
    membersResponse = await client.user.getMembers(workspaceId)
  } catch {
    // If we can't fetch members, return content as-is
    return content.startsWith("<") ? content : `<p>${content}</p>`
  }

  // Extract members array from response (API returns { members: [...] })
  type MemberItem = { id: string; display_name: string }
  type MembersResponse = { members?: MemberItem[] }
  const members = (membersResponse as MembersResponse)?.members || []

  // Create a map of lowercase names to member info for case-insensitive matching
  const memberMap = new Map<string, { id: string; name: string }>()
  for (const member of members) {
    memberMap.set(member.display_name.toLowerCase(), {
      id: member.id,
      name: member.display_name,
    })
  }

  // Pattern to match {{@Name}} - simple and unambiguous
  // Matches anything between {{@ and }} delimiters
  const mentionPattern = /\{\{@([^}]+)\}\}/g

  // Get current Unix timestamp for mention-time attribute
  const mentionTime = Math.floor(Date.now() / 1000)

  // Replace {{@mentions}} with HTML tags
  let processedContent = content.replace(mentionPattern, (match: string, name: string) => {
    const trimmedName = name.trim()
    const memberInfo = memberMap.get(trimmedName.toLowerCase())

    if (memberInfo) {
      // Found a matching member - convert to HTML mention tag
      return `<user-mention data-type="mention" user-id="${memberInfo.id}" mention-time="${mentionTime}" user-value="${memberInfo.name}" denotation-char="@"></user-mention>`
    }

    // No match found - leave the template syntax as plain text
    return match
  })

  // Wrap in <p> tags if not already HTML
  if (!processedContent.startsWith("<")) {
    processedContent = `<p>${processedContent}</p>`
  }

  return processedContent
}
