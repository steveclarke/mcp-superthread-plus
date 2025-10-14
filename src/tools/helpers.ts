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
 * Filters undefined values from an object to build clean parameter objects.
 * This is useful for conditionally including parameters without explicit if statements.
 *
 * @param args - Object with potentially undefined values
 * @returns Object with undefined values removed
 *
 * @example
 * ```typescript
 * const params = buildParams<CreateCardParams>({
 *   title: args.title,           // always included
 *   board_id: args.board_id,     // only if defined
 *   sprint_id: args.sprint_id,   // only if defined
 * })
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
