/**
 * @fileoverview Comment management tools.
 * Provides tools for creating and managing comments on cards and pages.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type { CreateCommentParams } from "../api/comments.js"

/**
 * Registers comment management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCommentTools(server: McpServer) {
  // comment_create - Create a new comment
  server.registerTool(
    "comment_create",
    {
      title: "Create Comment",
      description:
        "Adds a new comment to a specified card or page. The content field is required, with optional fields for context, page_id, or card_id.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        content: z
          .string()
          .max(102400)
          .describe("Comment text (required, maximum 102400 characters)"),
        card_id: z.string().optional().describe("Card ID to attach comment to"),
        page_id: z.string().optional().describe("Page ID to attach comment to"),
        schema: z.number().optional().describe("Schema version (defaults to 1)"),
        context: z.string().optional().describe("Highlighted text context"),
      },
    },
    async (args: {
      workspace_id: string
      content: string
      card_id?: string
      page_id?: string
      schema?: number
      context?: string
    }) => {
      try {
        const client = createClient()

        const params: CreateCommentParams = {
          content: args.content,
        }

        if (args.card_id) params.card_id = args.card_id
        if (args.page_id) params.page_id = args.page_id
        if (args.schema !== undefined) params.schema = args.schema
        if (args.context) params.context = args.context

        const result = await client.comments.create(args.workspace_id, params)

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
  )
}
