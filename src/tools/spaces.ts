/**
 * @fileoverview Space (organizational container) management tools.
 * Provides tools for space operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"

/**
 * Registers space (organizational container) management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerSpaceTools(server: McpServer) {
  // space_get_all - List all spaces in workspace
  server.registerTool(
    "space_get_all",
    {
      title: "Get All Spaces",
      description:
        "Get all spaces (organizational containers) in a workspace. Spaces contain boards, pages, and other content.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to get spaces from"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const spaces = await client.spaces.list(args.workspace_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(spaces, null, 2),
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

  // space_get - Get single space details
  server.registerTool(
    "space_get",
    {
      title: "Get Space",
      description:
        "Get detailed information about a specific space including boards, pages, members, and settings.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        space_id: z.string().describe("Space ID to retrieve"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const space = await client.spaces.get(args.workspace_id, args.space_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(space, null, 2),
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
