/**
 * @fileoverview Tag management tools.
 * Provides tools for tag operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CreateTagParams, UpdateTagParams } from "../api/tags.js"
import { createToolHandler, buildParams } from "./helpers.js"

/**
 * Registers tag management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerTagTools(server: McpServer) {
  // ============================================================================
  // TOOL: tag_creates
  // Create one or more tags (batch operation)
  // ============================================================================
  server.registerTool(
    "tag_creates",
    {
      title: "Create Tags",
      description:
        "Create one or more tags in a single operation. Each tag is fully self-contained with all parameters. Always use an array, even for a single tag. Tags can be used to categorize and filter cards. Note: This endpoint is undocumented in the official Superthread API and was discovered via browser network inspection.",
      inputSchema: {
        tags: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              name: z.string().describe("Tag name (required)"),
              color: z.string().describe("Tag color as hex string (e.g., '#ee46bc') (required)"),
              project_id: z
                .string()
                .optional()
                .describe("Project/Space ID to associate tag with (optional)"),
            })
          )
          .describe("Array of tags to create (use single-element array for one tag)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          tags: Array<{
            workspace_id: string
            name: string
            color: string
            project_id?: string
          }>
        }
      ) => {
        // Process tags sequentially
        const results = []
        for (const tag of args.tags) {
          const params = buildParams<CreateTagParams>({
            name: tag.name,
            color: tag.color,
            project_id: tag.project_id,
          })

          const result = await client.tags.create(tag.workspace_id, params as CreateTagParams)
          results.push(result)
        }

        return { tags: results }
      }
    )
  )

  // ============================================================================
  // TOOL: tag_updates
  // Update one or more tags (batch operation)
  // ============================================================================
  server.registerTool(
    "tag_updates",
    {
      title: "Update Tags",
      description:
        "Update one or more tags' properties (name and/or color) in a single operation. Each tag is fully self-contained with all parameters. Always use an array, even for a single tag. Only specified fields will be updated. Note: This endpoint is undocumented in the official Superthread API and was discovered via browser network inspection.",
      inputSchema: {
        tags: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              tag_id: z.string().describe("Tag ID to update"),
              name: z.string().optional().describe("New tag name"),
              color: z
                .string()
                .optional()
                .describe("New tag color as hex string (e.g., '#12b76a')"),
            })
          )
          .describe("Array of tags to update (use single-element array for one tag)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          tags: Array<{
            workspace_id: string
            tag_id: string
            name?: string
            color?: string
          }>
        }
      ) => {
        // Process tags sequentially
        const results = []
        for (const tag of args.tags) {
          const params = buildParams<UpdateTagParams>({
            name: tag.name,
            color: tag.color,
          })

          const result = await client.tags.update(
            tag.workspace_id,
            tag.tag_id,
            params as UpdateTagParams
          )
          results.push(result)
        }

        return { tags: results }
      }
    )
  )

  // ============================================================================
  // TOOL: tag_deletes
  // Permanently delete one or more tags (batch operation)
  // ============================================================================
  server.registerTool(
    "tag_deletes",
    {
      title: "Delete Tags",
      description:
        "Permanently delete one or more tags from the workspace in a single operation. Each tag is fully self-contained with all parameters. Always use an array, even for a single tag. This action cannot be undone. Tags will be removed from all cards that use them. Note: This endpoint is undocumented in the official Superthread API and was discovered via browser network inspection.",
      inputSchema: {
        tags: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              tag_id: z.string().describe("Tag ID to delete"),
            })
          )
          .describe("Array of tags to delete (use single-element array for one tag)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          tags: Array<{
            workspace_id: string
            tag_id: string
          }>
        }
      ) => {
        // Process tags sequentially
        const results = []
        for (const tag of args.tags) {
          const result = await client.tags.delete(tag.workspace_id, tag.tag_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )
}
