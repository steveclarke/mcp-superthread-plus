/**
 * @fileoverview Space (organizational container) management tools.
 * Provides tools for space operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createToolHandler } from "./helpers.js"

/**
 * Registers space (organizational container) management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerSpaceTools(server: McpServer) {
  // ============================================================================
  // TOOL: space_get_all
  // List all spaces (organizational containers) in workspace
  // ============================================================================
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
    createToolHandler(async (client, args) => {
      return client.spaces.list(args.workspace_id)
    })
  )

  // ============================================================================
  // TOOL: space_get
  // Get detailed information about a specific space
  // ============================================================================
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
    createToolHandler(async (client, args) => {
      return client.spaces.get(args.workspace_id, args.space_id)
    })
  )

  // ============================================================================
  // TOOL: space_creates
  // Create one or more spaces (batch operation)
  // ============================================================================
  server.registerTool(
    "space_creates",
    {
      title: "Create Spaces",
      description:
        "Create one or more spaces (organizational containers) in a single operation. Each space is fully self-contained with all parameters. Always use an array, even for a single space. Spaces are used to organize boards, pages, and other content.",
      inputSchema: {
        spaces: z
          .array(
            z.object({
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
            })
          )
          .describe("Array of spaces to create (use single-element array for one space)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          spaces: Array<{
            workspace_id: string
            title: string
            description?: string
            icon?: {
              type: string
              src?: string
              emoji?: string
              color?: string
            }
          }>
        }
      ) => {
        // Process spaces sequentially
        const results = []
        for (const space of args.spaces) {
          const result = await client.spaces.create(space.workspace_id, {
            title: space.title,
            description: space.description,
            icon: space.icon,
          })
          results.push(result)
        }

        return { spaces: results }
      }
    )
  )

  // ============================================================================
  // TOOL: space_updates
  // Update one or more spaces (batch operation)
  // ============================================================================
  server.registerTool(
    "space_updates",
    {
      title: "Update Spaces",
      description:
        "Update properties of one or more existing spaces in a single operation. Each space is fully self-contained with all parameters. Always use an array, even for a single space. Can modify title, description, icon, or archive status.",
      inputSchema: {
        spaces: z
          .array(
            z.object({
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
            })
          )
          .describe("Array of spaces to update (use single-element array for one space)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          spaces: Array<{
            workspace_id: string
            space_id: string
            title?: string
            description?: string
            icon?: {
              type?: string
              src?: string
              emoji?: string
              color?: string
            }
            archived?: boolean
          }>
        }
      ) => {
        // Process spaces sequentially
        const results = []
        for (const space of args.spaces) {
          const result = await client.spaces.update(space.workspace_id, space.space_id, {
            title: space.title,
            description: space.description,
            icon: space.icon,
            archived: space.archived,
          })
          results.push(result)
        }

        return { spaces: results }
      }
    )
  )

  // ============================================================================
  // TOOL: space_add_members
  // Add members to spaces (batch operation)
  // ============================================================================
  server.registerTool(
    "space_add_members",
    {
      title: "Add Members to Spaces",
      description:
        "Add one or more members to spaces in a single operation. Each operation is fully self-contained with all parameters. Always use an array, even for a single member addition. Members can access and collaborate on space content.",
      inputSchema: {
        operations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              space_id: z.string().describe("Space ID to add member to"),
              user_id: z.string().describe("User ID to add as member"),
              role: z.string().optional().describe("Member role (e.g., 'member', 'admin')"),
            })
          )
          .describe("Array of member additions (use single-element array for one operation)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          operations: Array<{
            workspace_id: string
            space_id: string
            user_id: string
            role?: string
          }>
        }
      ) => {
        // Process operations sequentially
        const results = []
        for (const op of args.operations) {
          const result = await client.spaces.addMember(op.workspace_id, op.space_id, {
            user_id: op.user_id,
            role: op.role,
          })
          results.push(result)
        }

        return { members: results }
      }
    )
  )

  // ============================================================================
  // TOOL: space_remove_members
  // Remove members from spaces (batch operation)
  // ============================================================================
  server.registerTool(
    "space_remove_members",
    {
      title: "Remove Members from Spaces",
      description:
        "Remove one or more members from spaces in a single operation. Each operation is fully self-contained with all parameters. Always use an array, even for a single member removal. This revokes their access to the space content.",
      inputSchema: {
        operations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              space_id: z.string().describe("Space ID to remove member from"),
              member_id: z.string().describe("Member ID to remove"),
            })
          )
          .describe("Array of member removals (use single-element array for one operation)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          operations: Array<{
            workspace_id: string
            space_id: string
            member_id: string
          }>
        }
      ) => {
        // Process operations sequentially
        const results = []
        for (const op of args.operations) {
          const result = await client.spaces.removeMember(
            op.workspace_id,
            op.space_id,
            op.member_id
          )
          results.push(result)
        }

        return { removed: results }
      }
    )
  )

  // ============================================================================
  // TOOL: space_deletes
  // Permanently delete one or more spaces (batch operation)
  // ============================================================================
  server.registerTool(
    "space_deletes",
    {
      title: "Delete Spaces",
      description:
        "Permanently delete one or more spaces in a single operation. Each space is fully self-contained with all parameters. Always use an array, even for a single space. This action cannot be undone. All content within the spaces will be deleted.",
      inputSchema: {
        spaces: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              space_id: z.string().describe("Space ID to delete"),
            })
          )
          .describe("Array of spaces to delete (use single-element array for one space)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          spaces: Array<{
            workspace_id: string
            space_id: string
          }>
        }
      ) => {
        // Process spaces sequentially
        const results = []
        for (const space of args.spaces) {
          const result = await client.spaces.delete(space.workspace_id, space.space_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )
}
