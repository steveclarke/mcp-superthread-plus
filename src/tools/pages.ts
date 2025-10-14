/**
 * @fileoverview Page management tools.
 * Provides tools for page operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CreatePageParams, UpdatePageParams, DuplicatePageParams } from "../api/pages.js"
import { createToolHandler, buildParams } from "./helpers.js"

/**
 * Registers page management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerPageTools(server: McpServer): void {
  // page_create - Create new page
  server.registerTool(
    "page_create",
    {
      title: "Create Page",
      description:
        "Create a new page in a workspace under a specified space (project). Pages can include title, content, icon, and hierarchy settings.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project/Space ID (required)"),
        title: z.string().optional().describe("Page title"),
        content: z.string().optional().describe("Page content (max 102400 chars)"),
        schema: z.number().optional().describe("Schema version"),
        font: z.string().optional().describe("Font setting"),
        cover_image: z
          .object({
            type: z.string().describe("Image type"),
            src: z.string().optional().describe("Image source"),
            blurhash: z.string().optional().describe("Blurhash"),
            color: z.string().optional().describe("Color"),
            emoji: z.string().optional().describe("Emoji"),
            positionY: z.number().optional().describe("Y position"),
            object_fit: z.string().optional().describe("Object fit"),
          })
          .optional()
          .describe("Cover image configuration"),
        icon: z
          .object({
            type: z.string().describe("Icon type"),
            src: z.string().optional().describe("Icon source"),
            blurhash: z.string().optional().describe("Blurhash"),
            color: z.string().optional().describe("Color"),
            emoji: z.string().optional().describe("Emoji"),
          })
          .optional()
          .describe("Icon configuration"),
        parent_page_id: z.string().optional().describe("Parent page ID (empty string for root)"),
        position: z.number().optional().describe("Position relative to siblings"),
        is_public: z.boolean().optional().describe("Whether page is public"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<CreatePageParams>({
        project_id: args.project_id,
        title: args.title,
        content: args.content,
        schema: args.schema,
        font: args.font,
        cover_image: args.cover_image,
        icon: args.icon,
        parent_page_id: args.parent_page_id,
        position: args.position,
        is_public: args.is_public,
      })

      return client.pages.create(args.workspace_id, params as CreatePageParams)
    })
  )

  // page_update - Update page properties
  server.registerTool(
    "page_update",
    {
      title: "Update Page",
      description:
        "Update properties of an existing page. Can modify title, font, position, archiving status, and other settings. Only provided fields will be updated.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        page_id: z.string().describe("Page ID to update"),
        title: z.string().optional().describe("New page title"),
        font: z.string().optional().describe("New font setting"),
        project_id: z.string().optional().describe("Move page to different project/space"),
        cover_image: z
          .object({
            type: z.string().describe("Image type"),
            src: z.string().optional().describe("Image source"),
            blurhash: z.string().optional().describe("Blurhash"),
            color: z.string().optional().describe("Color"),
            emoji: z.string().optional().describe("Emoji"),
            positionY: z.number().optional().describe("Y position"),
            object_fit: z.string().optional().describe("Object fit"),
          })
          .optional()
          .describe("New cover image configuration"),
        icon: z
          .object({
            type: z.string().describe("Icon type"),
            src: z.string().optional().describe("Icon source"),
            blurhash: z.string().optional().describe("Blurhash"),
            color: z.string().optional().describe("Color"),
            emoji: z.string().optional().describe("Emoji"),
          })
          .optional()
          .describe("New icon configuration"),
        is_public: z.boolean().optional().describe("Whether page is public"),
        parent_page_id: z
          .string()
          .optional()
          .describe("New parent page ID (empty string for root)"),
        position: z.number().optional().describe("New position relative to siblings"),
        public_settings: z
          .object({
            url: z.string().describe("Public URL"),
            robots: z.array(z.string()).describe("Robot tags"),
          })
          .optional()
          .describe("Public settings configuration"),
        archived: z.boolean().optional().describe("Archive or unarchive the page"),
        hide_table_of_contents: z
          .boolean()
          .optional()
          .describe("Whether to show table of contents"),
        hide_subpages: z.boolean().optional().describe("Whether to show subpages section"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<UpdatePageParams>({
        title: args.title,
        font: args.font,
        project_id: args.project_id,
        cover_image: args.cover_image,
        icon: args.icon,
        is_public: args.is_public,
        parent_page_id: args.parent_page_id,
        position: args.position,
        public_settings: args.public_settings,
        archived: args.archived,
        hide_table_of_contents: args.hide_table_of_contents,
        hide_subpages: args.hide_subpages,
      })

      return client.pages.update(args.workspace_id, args.page_id, params as UpdatePageParams)
    })
  )

  // page_get - Get a specific page
  server.registerTool(
    "page_get",
    {
      title: "Get Page",
      description:
        "Fetches detailed information about a specified page identified by the page_id within a workspace.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        page_id: z.string().describe("Page ID to retrieve"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.pages.get(args.workspace_id, args.page_id)
    })
  )

  // page_get_all - Get all pages in a workspace
  server.registerTool(
    "page_get_all",
    {
      title: "Get All Pages",
      description:
        "Returns a list of all available pages for the workspace. Pages are organized by spaces (projects) and can be filtered by archived or updated_recently.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().optional().describe("Filter by specific project/space ID"),
        archived: z.boolean().optional().describe("Include archived pages (default: false)"),
        updated_recently: z
          .boolean()
          .optional()
          .describe("Filter by recently updated pages (default: false)"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<{
        project_id?: string
        archived?: boolean
        updated_recently?: boolean
      }>({
        project_id: args.project_id,
        archived: args.archived,
        updated_recently: args.updated_recently,
      })

      return client.pages.list(
        args.workspace_id,
        Object.keys(params).length > 0 ? params : undefined
      )
    })
  )

  // page_duplicate - Duplicate a page
  server.registerTool(
    "page_duplicate",
    {
      title: "Duplicate Page",
      description:
        "Clone an existing page with its content and structure. The new page can be placed under a parent page or at the root of a space (project).",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        page_id: z.string().describe("Page ID to duplicate"),
        project_id: z.string().describe("Project/Space ID for the duplicated page (required)"),
        title: z.string().optional().describe("Title for the duplicated page"),
        parent_page_id: z.string().optional().describe("Parent page ID (empty string for root)"),
        position: z.number().optional().describe("Position relative to siblings"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<DuplicatePageParams>({
        project_id: args.project_id,
        title: args.title,
        parent_page_id: args.parent_page_id,
        position: args.position,
      })

      return client.pages.duplicate(args.workspace_id, args.page_id, params as DuplicatePageParams)
    })
  )

  // page_archive - Archive a page
  server.registerTool(
    "page_archive",
    {
      title: "Archive Page",
      description:
        "Archive a page to remove it from active view while preserving its content. Archived pages can be restored later.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        page_id: z.string().describe("Page ID to archive"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.pages.archive(args.workspace_id, args.page_id)
    })
  )

  // page_delete - Delete a page
  server.registerTool(
    "page_delete",
    {
      title: "Delete Page",
      description:
        "Permanently delete a page. This action cannot be undone. Consider archiving instead for soft deletion.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        page_id: z.string().describe("Page ID to delete"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.pages.delete(args.workspace_id, args.page_id)
    })
  )
}
