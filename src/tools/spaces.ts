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

  // space_create - Create new space
  server.registerTool(
    "space_create",
    {
      title: "Create Space",
      description:
        "Create a new space (organizational container) in a workspace. Spaces are used to organize boards, pages, and other content.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to create space in"),
        title: z.string().describe("Space title"),
        description: z.string().optional().describe("Space description"),
        icon: z
          .object({
            type: z.string().describe("Icon type (e.g., 'icon', 'emoji')"),
            src: z.string().optional().describe("Icon source for icon type"),
            emoji: z.string().optional().describe("Emoji for emoji type"),
            color: z.string().optional().describe("Icon color"),
          })
          .optional()
          .describe("Space icon"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const space = await client.spaces.create(args.workspace_id, {
          title: args.title,
          description: args.description,
          icon: args.icon,
        })

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

  // space_update - Update space properties
  server.registerTool(
    "space_update",
    {
      title: "Update Space",
      description:
        "Update properties of an existing space. Can modify title, description, icon, or archive status.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        space_id: z.string().describe("Space ID to update"),
        title: z.string().optional().describe("New space title"),
        description: z.string().optional().describe("New space description"),
        icon: z
          .object({
            type: z.string().optional().describe("Icon type"),
            src: z.string().optional().describe("Icon source"),
            emoji: z.string().optional().describe("Emoji"),
            color: z.string().optional().describe("Icon color"),
          })
          .optional()
          .describe("New space icon"),
        archived: z.boolean().optional().describe("Archive or unarchive the space"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const space = await client.spaces.update(args.workspace_id, args.space_id, {
          title: args.title,
          description: args.description,
          icon: args.icon,
          archived: args.archived,
        })

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

  // space_add_member - Add member to space
  server.registerTool(
    "space_add_member",
    {
      title: "Add Member to Space",
      description: "Add a member to a space. Members can access and collaborate on space content.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        space_id: z.string().describe("Space ID to add member to"),
        user_id: z.string().describe("User ID to add as member"),
        role: z.string().optional().describe("Member role (e.g., 'member', 'admin')"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const result = await client.spaces.addMember(args.workspace_id, args.space_id, {
          user_id: args.user_id,
          role: args.role,
        })

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

  // space_remove_member - Remove member from space
  server.registerTool(
    "space_remove_member",
    {
      title: "Remove Member from Space",
      description: "Remove a member from a space. This revokes their access to the space content.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        space_id: z.string().describe("Space ID to remove member from"),
        member_id: z.string().describe("Member ID to remove"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const result = await client.spaces.removeMember(
          args.workspace_id,
          args.space_id,
          args.member_id
        )

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

  // space_delete - Delete space permanently
  server.registerTool(
    "space_delete",
    {
      title: "Delete Space",
      description:
        "Permanently delete a space. This action cannot be undone. All content within the space will be deleted.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        space_id: z.string().describe("Space ID to delete"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const result = await client.spaces.delete(args.workspace_id, args.space_id)

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
