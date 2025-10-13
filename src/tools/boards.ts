/**
 * @fileoverview Board management tools.
 * Provides tools for board and kanban operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"

/**
 * Registers board management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerBoardTools(server: McpServer) {
  // board_get_all - List all boards in workspace
  server.registerTool(
    "board_get_all",
    {
      title: "Get All Boards",
      description:
        "Get all boards in a workspace. Boards contain kanban-style lists with cards for task management. By default returns non-archived boards.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to get boards from"),
        space_id: z.string().describe("Space/project ID to get boards from"),
        bookmarked: z.boolean().optional().describe("Optional: Also filter for bookmarked boards"),
        archived: z
          .boolean()
          .optional()
          .describe("Optional: Include archived boards (default: false)"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const options: { project_id: string; bookmarked?: boolean; archived?: boolean } = {
          project_id: args.space_id,
        }

        if (args.bookmarked !== undefined) options.bookmarked = args.bookmarked
        if (args.archived !== undefined) options.archived = args.archived

        const boards = await client.boards.list(args.workspace_id, options)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(boards, null, 2),
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

  // board_get - Get single board details
  server.registerTool(
    "board_get",
    {
      title: "Get Board",
      description:
        "Get detailed information about a specific board including all lists, cards, and their current status.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        board_id: z.string().describe("Board ID to retrieve"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const board = await client.boards.get(args.workspace_id, args.board_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(board, null, 2),
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
