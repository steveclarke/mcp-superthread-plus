/**
 * @fileoverview Unit tests for formatMentions escape functionality.
 */

import { describe, it, expect, vi } from "vitest"
import { formatMentions } from "../../src/utils.js"
import type { SuperthreadClient } from "../../src/api/client.js"

// Mock client with workspace members
const createMockClient = (members: { id: string; display_name: string }[]) => {
  return {
    user: {
      getMembers: vi.fn().mockResolvedValue({ members }),
    },
  } as unknown as SuperthreadClient
}

describe("formatMentions - Escape Functionality", () => {
  const mockMembers = [
    { id: "user-123", display_name: "Steve Clarke" },
    { id: "user-456", display_name: "John Smith" },
  ]

  it("converts unescaped mentions to HTML tags", async () => {
    const client = createMockClient(mockMembers)
    const result = await formatMentions("Hey {{@Steve Clarke}}, check this!", "workspace-1", client)

    expect(result).toContain('<user-mention data-type="mention" user-id="user-123"')
    expect(result).toContain('user-value="Steve Clarke"')
  })

  it("outputs escaped mentions as literal text", async () => {
    const client = createMockClient(mockMembers)
    const result = await formatMentions(
      "Use \\{{@Username}} to mention users",
      "workspace-1",
      client
    )

    expect(result).toBe("Use {{@Username}} to mention users")
    expect(result).not.toContain("<user-mention")
  })

  it("handles mixed escaped and real mentions", async () => {
    const client = createMockClient(mockMembers)
    const result = await formatMentions(
      "Hey {{@Steve Clarke}}, use \\{{@Name}} syntax to mention people",
      "workspace-1",
      client
    )

    // Real mention converted to HTML
    expect(result).toContain('<user-mention data-type="mention" user-id="user-123"')
    // Escaped mention stays as literal text
    expect(result).toContain("{{@Name}}")
  })

  it("handles multiple escaped mentions", async () => {
    const client = createMockClient(mockMembers)
    const result = await formatMentions(
      "Use \\{{@First}} and \\{{@Second}} for examples",
      "workspace-1",
      client
    )

    expect(result).toBe("Use {{@First}} and {{@Second}} for examples")
    expect(result).not.toContain("<user-mention")
  })

  it("leaves non-matching mentions as-is (graceful degradation)", async () => {
    const client = createMockClient(mockMembers)
    const result = await formatMentions("Hey {{@FakeUser}}, how are you?", "workspace-1", client)

    expect(result).toBe("Hey {{@FakeUser}}, how are you?")
    expect(result).not.toContain("<user-mention")
  })

  it("returns plain text as-is when no mentions present", async () => {
    const client = createMockClient(mockMembers)
    const result = await formatMentions("Just plain text", "workspace-1", client)

    expect(result).toBe("Just plain text")
  })

  it("handles empty content gracefully", async () => {
    const client = createMockClient(mockMembers)
    const result = await formatMentions("", "workspace-1", client)

    expect(result).toBe("")
  })

  it("escapes HTML special characters in names to prevent XSS", async () => {
    const membersWithSpecialChars = [
      { id: "user-789", display_name: 'John "Evil" <script>' },
      { id: "user-abc", display_name: "Jane & Bob's Team" },
    ]
    const client = createMockClient(membersWithSpecialChars)
    const result = await formatMentions('Hey {{@John "Evil" <script>}}!', "workspace-1", client)

    // Should escape quotes and HTML tags in attribute values
    expect(result).toContain('user-id="user-789"')
    expect(result).toContain('user-value="John &quot;Evil&quot; &lt;script&gt;"')
    // Should NOT contain unescaped script tag
    expect(result).not.toContain('"Evil"')
    expect(result).not.toContain("<script>")
  })
})
