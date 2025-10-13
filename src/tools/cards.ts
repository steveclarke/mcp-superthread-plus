/**
 * @fileoverview Card management tools.
 * Provides tools for card operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"

/**
 * Registers card management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCardTools(server: McpServer) {
  // card_get - Get single card details
  server.registerTool(
    "card_get",
    {
      title: "Get Card",
      description:
        "Get detailed information about a specific card including its content, status, checklists, tags, linked cards, and all metadata.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to retrieve"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const card = await client.cards.get(args.workspace_id, args.card_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(card, null, 2),
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
