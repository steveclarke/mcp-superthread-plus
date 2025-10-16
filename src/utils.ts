/**
 * @fileoverview Generic utility functions for the MCP Superthread Plus server.
 * Uses battle-tested npm packages (validator) for input sanitization.
 */

import validator from "validator"
import type { SuperthreadClient } from "./api/client.js"

/**
 * Parse a delimited string into an array of strings.
 * Automatically trims whitespace and filters out empty strings.
 *
 * @param value - String to parse (can be undefined)
 * @param delimiter - Delimiter to split on (string or regex)
 * @param transform - Optional transform function to apply to each item (e.g., toLowerCase)
 * @returns Array of parsed strings, or empty array if value is undefined
 *
 * @example
 * parseDelimitedString('foo:bar:baz', ':') // ['foo', 'bar', 'baz']
 * parseDelimitedString('Foo, Bar, Baz', ',', s => s.toLowerCase()) // ['foo', 'bar', 'baz']
 * parseDelimitedString('opt1 opt2  opt3', /\s+/) // ['opt1', 'opt2', 'opt3']
 */
export function parseDelimitedString(
  value: string | undefined,
  delimiter: string | RegExp,
  transform?: (item: string) => string
): string[] {
  if (!value) {
    return []
  }

  return value
    .split(delimiter)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => (transform ? transform(item) : item))
}

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
 * Escapes HTML special characters for safe use in HTML attributes.
 * Uses validator.escape() to prevent XSS attacks in constructed HTML.
 *
 * @param value - String value to escape
 * @returns HTML-escaped string safe for attribute values
 *
 * @example
 * escapeHtmlAttribute('John "Evil" Doe') // Returns: 'John &quot;Evil&quot; Doe'
 */
function escapeHtmlAttribute(value: string): string {
  return validator.escape(value)
}

/**
 * Sanitizes an ID to only allow alphanumeric, hyphen, and underscore.
 * Strips any other characters and validates the result is non-empty.
 *
 * Uses validator.whitelist() from the validator package.
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

  // Ensure at least one valid character remains after sanitization
  if (!validator.isLength(cleaned, { min: 1 })) {
    throw new PathValidationError(
      `${name} must contain only letters, numbers, hyphen, or underscore`
    )
  }

  return cleaned
}

/**
 * Converts {{@mentions}} in content to SuperThread's HTML user-mention tags.
 *
 * WHY WE NEED THIS:
 * Superthread allows user names with spaces, punctuation, and titles (e.g., "@John A. J. Smith the 3rd, Esq.").
 * This makes it nearly impossible to reliably parse mentions with traditional @mention syntax because:
 * - Where does the mention end? After the first word? The whole phrase?
 * - How do we handle commas, periods, and other punctuation that might be part of the name or sentence?
 *
 * Our solution: Invent a template syntax {{@Name}} with clear delimiters that:
 * 1. Allows LLMs to pass inline mentions unambiguously in natural text
 * 2. Makes parsing trivial with clear boundaries ({{ and }})
 * 3. Handles any valid Superthread name, regardless of complexity
 *
 * HOW IT WORKS:
 * 1. Fetch all workspace members to build a name-to-ID mapping
 * 2. Find all {{@Name}} patterns in the content (can be multiple mentions)
 * 3. Look up each name (case-insensitive) to find the matching user ID
 * 4. Replace {{@Name}} with Superthread's HTML <user-mention> tag format (includes user ID)
 * 5. HTML-escape attribute values to prevent XSS attacks (defense in depth)
 * 6. Non-matching names gracefully degrade to plain text (the template stays visible)
 * 7. To output literal {{@Name}} text, escape it with backslash: \{{@Name}}
 *
 * @param content - Comment content that may contain {{@Name}} patterns
 * @param workspaceId - Workspace ID to fetch members from
 * @param client - SuperthreadClient instance
 * @returns Content with {{@mentions}} converted to HTML tags
 *
 * @example
 * // Input: "Hey {{@Steve Clarke}}, can you review {{@John Smith}}'s work?"
 * // Output: "Hey <user-mention data-type=\"mention\" user-id=\"u123\" ...></user-mention>,
 * //          can you review <user-mention data-type=\"mention\" user-id=\"u456\" ...></user-mention>'s work?"
 *
 * @example
 * // Escaping: "Use \{{@Username}} syntax to mention users"
 * // Output: "Use {{@Username}} syntax to mention users"
 */
export async function formatMentions(
  content: string,
  workspaceId: string,
  client: SuperthreadClient
): Promise<string> {
  // If content is empty or doesn't contain {{@, return as-is
  if (!content || !content.includes("{{@")) {
    return content
  }

  // Fetch workspace members to build name-to-ID mapping for mention conversion
  // This allows us to look up user IDs from display names in {{@Name}} patterns
  let membersResponse
  try {
    membersResponse = await client.user.getMembers(workspaceId)
  } catch {
    // If we can't fetch members, return content as-is without processing mentions
    return content
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

  // First pass: Replace escaped sequences with placeholder to protect them
  // \{{@Name}} becomes ___ESCAPED_MENTION_{{@Name}}___
  let processedContent = content.replace(/\\(\{\{@[^}]+\}\})/g, "___ESCAPED_MENTION_$1___")

  // Pattern to match {{@Name}} - simple and unambiguous
  // Matches anything between {{@ and }} delimiters
  const mentionPattern = /\{\{@([^}]+)\}\}/g

  // Get current Unix timestamp for mention-time attribute
  const mentionTime = Math.floor(Date.now() / 1000)

  // Second pass: Replace {{@mentions}} with HTML tags
  processedContent = processedContent.replace(mentionPattern, (match: string, name: string) => {
    const trimmedName = name.trim()
    const memberInfo = memberMap.get(trimmedName.toLowerCase())

    if (memberInfo) {
      // Found a matching member - convert to HTML mention tag
      // Escape attribute values to prevent XSS (defense in depth)
      // Protects against malicious API data AND future code changes that might pass through user input
      const safeUserId = escapeHtmlAttribute(memberInfo.id)
      const safeUserValue = escapeHtmlAttribute(memberInfo.name)
      return `<user-mention data-type="mention" user-id="${safeUserId}" mention-time="${mentionTime}" user-value="${safeUserValue}" denotation-char="@"></user-mention>`
    }

    // No match found - leave the template syntax as plain text
    return match
  })

  // Third pass: Restore escaped sequences as literal text
  // ___ESCAPED_MENTION_{{@Name}}___ becomes {{@Name}}
  processedContent = processedContent.replace(/___ESCAPED_MENTION_(\{\{@[^}]+\}\})___/g, "$1")

  return processedContent
}
