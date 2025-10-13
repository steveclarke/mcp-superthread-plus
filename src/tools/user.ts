/**
 * @fileoverview User and team management tools implementation.
 * Provides tools for user account and team member operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

/**
 * Registers user and team management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerUserTools(server: McpServer) {
  // get_my_account - Get current user information
  server.registerTool(
    "get_my_account",
    {
      title: "Get My Account",
      description:
        "Get the current user's account information including workspace/team memberships",
      inputSchema: {},
    },
    async () => {
      try {
        const { createClient } = await import("../api/client.js")
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

  // update_my_account - Update current user profile
  server.registerTool(
    "update_my_account",
    {
      title: "Update My Account",
      description: "Update the current user's account information",
      inputSchema: {
        name: z.string().optional().describe("User's display name"),
        email: z.string().optional().describe("User's email address"),
        avatar: z.string().optional().describe("Avatar URL"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().user.updateMyAccount(data)
      throw new Error("update_my_account not implemented yet")
    }
  )

  // get_team_members - List team members
  server.registerTool(
    "get_team_members",
    {
      title: "Get Team Members",
      description: "Get all members of a workspace/team",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to get members from"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().user.getTeamMembers(workspace_id)
      throw new Error("get_team_members not implemented yet")
    }
  )

  // update_team_member - Update a team member
  server.registerTool(
    "update_team_member",
    {
      title: "Update Team Member",
      description: "Update a team member's role or settings",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        member_id: z.string().describe("Member ID to update"),
        role: z.string().optional().describe("New role for the member"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().user.updateTeamMember(workspace_id, member_id, data)
      throw new Error("update_team_member not implemented yet")
    }
  )

  // delete_team_member - Remove a team member
  server.registerTool(
    "delete_team_member",
    {
      title: "Delete Team Member",
      description: "Remove a member from a workspace/team",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        member_id: z.string().describe("Member ID to remove"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().user.deleteTeamMember(workspace_id, member_id)
      throw new Error("delete_team_member not implemented yet")
    }
  )
}

