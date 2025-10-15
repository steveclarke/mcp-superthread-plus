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
  // tag_create - Create a new tag
  server.registerTool(
    "tag_create",
    {
      title: "Create Tag",
      description:
        "Create a new tag in the workspace. Tags can be used to categorize and filter cards. Note: This endpoint is undocumented in the official Superthread API and was discovered via browser network inspection.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        name: z.string().describe("Tag name (required)"),
        color: z.string().describe("Tag color as hex string (e.g., '#ee46bc') (required)"),
        project_id: z
          .string()
          .optional()
          .describe("Project/Space ID to associate tag with (optional)"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<CreateTagParams>({
        name: args.name,
        color: args.color,
        project_id: args.project_id,
      })

      return client.tags.create(args.workspace_id, params as CreateTagParams)
    })
  )

  // tag_update - Update an existing tag
  server.registerTool(
    "tag_update",
    {
      title: "Update Tag",
      description:
        "Update an existing tag's properties (name and/or color). Only specified fields will be updated. Note: This endpoint is undocumented in the official Superthread API and was discovered via browser network inspection.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        tag_id: z.string().describe("Tag ID to update"),
        name: z.string().optional().describe("New tag name"),
        color: z.string().optional().describe("New tag color as hex string (e.g., '#12b76a')"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<UpdateTagParams>({
        name: args.name,
        color: args.color,
      })

      return client.tags.update(args.workspace_id, args.tag_id, params as UpdateTagParams)
    })
  )

  // tag_delete - Delete a tag
  server.registerTool(
    "tag_delete",
    {
      title: "Delete Tag",
      description:
        "Permanently delete a tag from the workspace. This action cannot be undone. The tag will be removed from all cards that use it. Note: This endpoint is undocumented in the official Superthread API and was discovered via browser network inspection.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        tag_id: z.string().describe("Tag ID to delete"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.tags.delete(args.workspace_id, args.tag_id)
    })
  )
}
