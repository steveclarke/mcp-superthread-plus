/**
 * @fileoverview User and workspace member management tools.
 * Provides tools for user account and team member operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"

/**
 * Registers user and workspace member management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerUserTools(server: McpServer) {
  // user_get_my_account - Get current user information
  server.registerTool(
    "user_get_my_account",
    {
      title: "Get My Account",
      description:
        "Get the current user's account information including workspace/team memberships",
      inputSchema: {},
    },
    async () => {
      try {
        const client = createClient()
        const account = await client.user.getMyAccount()

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(account, null, 2),
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

  // user_get_members - List workspace members
  server.registerTool(
    "user_get_members",
    {
      title: "Get Members",
      description: "Get all members of a workspace",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to get members from"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const members = await client.user.getMembers(args.workspace_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(members, null, 2),
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
