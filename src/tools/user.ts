/**
 * @fileoverview User and workspace member management tools.
 * Provides tools for user account and team member operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createToolHandler } from "./helpers.js"

/**
 * Registers user and workspace member management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerUserTools(server: McpServer) {
  // ============================================================================
  // TOOL: user_get_my_account
  // Get current user account information
  // ============================================================================
  server.registerTool(
    "user_get_my_account",
    {
      title: "Get My Account",
      description:
        "Get the current user's account information including workspace/team memberships",
      inputSchema: {},
    },
    createToolHandler(async (client) => {
      return client.user.getMyAccount()
    })
  )

  // ============================================================================
  // TOOL: user_get_members
  // List all members of a workspace
  // ============================================================================
  server.registerTool(
    "user_get_members",
    {
      title: "Get Members",
      description: "Get all members of a workspace",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to get members from"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.user.getMembers(args.workspace_id)
    })
  )
}
