/**
 * @fileoverview Helper utilities for tool registration.
 * Provides utilities to reduce boilerplate in tool handlers.
 */

import { createClient, type SuperthreadClient } from "../api/client.js"

/**
 * Tool response type for MCP tool handlers
 */
export interface ToolResponse {
  [x: string]: unknown
  content: Array<{
    type: "text"
    text: string
  }>
  isError?: boolean
}

/**
 * Wraps a tool handler with standard error handling, client creation, and response formatting.
 *
 * This handler transparently returns the full JSON API response to the LLM without filtering
 * or transformation. This approach allows the LLM to see all available data and intelligently
 * decide which fields are relevant to the user's query, rather than us pre-filtering and
 * potentially losing useful context.
 *
 * @param handler - The handler function that receives the API client and arguments
 * @returns A wrapped handler with consistent error handling and response formatting
 *
 * @example
 * ```typescript
 * server.registerTool(
 *   "card_create",
 *   { title, description, inputSchema },
 *   createToolHandler(async (client, args) => {
 *     return client.cards.create(args.workspace_id, args)
 *   })
 * )
 * ```
 */
export function createToolHandler<TArgs, TResult>(
  handler: (client: SuperthreadClient, args: TArgs) => Promise<TResult>
): (args: TArgs) => Promise<ToolResponse> {
  return async (args: TArgs): Promise<ToolResponse> => {
    try {
      const client = createClient()
      const result = await handler(client, args)

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  }
}

/**
 * Removes undefined fields from an object before sending to the API.
 *
 * WHY THIS IS NEEDED:
 * - Superthread's API treats "field not present" differently than "field is null/undefined"
 * - Omitting a field = "don't change this" (for updates) or "use default" (for creates)
 * - Sending null/undefined = might clear the field or cause API errors
 * - This ensures we only send fields that were explicitly provided by the user
 *
 * Without this, optional parameters would be sent as null/undefined in the API request,
 * potentially causing unintended side effects or API rejections.
 *
 * @param args - Object with potentially undefined values
 * @returns Object with only the defined fields (undefined values removed)
 *
 * @example
 * ```typescript
 * // Input: { title: "My Card", board_id: undefined, sprint_id: undefined }
 * const params = buildParams<CreateCardParams>({
 *   title: args.title,           // "My Card" - included
 *   board_id: args.board_id,     // undefined - omitted
 *   sprint_id: args.sprint_id,   // undefined - omitted
 * })
 * // Output: { title: "My Card" } ✅ Clean API payload with only provided fields
 * ```
 */
export function buildParams<T>(args: Partial<T>): Partial<T> {
  const result: Partial<T> = {}
  for (const key in args) {
    if (args[key] !== undefined) {
      result[key] = args[key]
    }
  }
  return result
}
