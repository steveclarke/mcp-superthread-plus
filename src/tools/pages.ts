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
  // ============================================================================
  // TOOL: page_creates
  // Create one or more documentation pages in a single operation
  // ============================================================================
  server.registerTool(
    "page_creates",
    {
      title: "Create Pages",
      description:
        "Create one or more pages in a single operation. Each page is fully self-contained with all parameters. Always use an array, even for a single page. Pages can include title, content, icon, and hierarchy settings.",
      inputSchema: {
        pages: z
          .array(
            z.object({
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
              parent_page_id: z
                .string()
                .optional()
                .describe("Parent page ID (empty string for root)"),
              position: z.number().optional().describe("Position relative to siblings"),
              is_public: z.boolean().optional().describe("Whether page is public"),
            })
          )
          .describe("Array of pages to create (use single-element array for one page)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          pages: Array<{
            workspace_id: string
            project_id: string
            title?: string
            content?: string
            schema?: number
            font?: string
            cover_image?: {
              type: string
              src?: string
              blurhash?: string
              color?: string
              emoji?: string
              positionY?: number
              object_fit?: string
            }
            icon?: {
              type: string
              src?: string
              blurhash?: string
              color?: string
              emoji?: string
            }
            parent_page_id?: string
            position?: number
            is_public?: boolean
          }>
        }
      ) => {
        // Process pages sequentially
        const results = []
        for (const page of args.pages) {
          const params = buildParams<CreatePageParams>({
            project_id: page.project_id,
            title: page.title,
            content: page.content,
            schema: page.schema,
            font: page.font,
            cover_image: page.cover_image,
            icon: page.icon,
            parent_page_id: page.parent_page_id,
            position: page.position,
            is_public: page.is_public,
          })

          const result = await client.pages.create(page.workspace_id, params as CreatePageParams)
          results.push(result)
        }

        return { pages: results }
      }
    )
  )

  // ============================================================================
  // TOOL: page_updates
  // Update one or more existing pages' properties in a single operation
  // ============================================================================
  server.registerTool(
    "page_updates",
    {
      title: "Update Pages",
      description:
        "Update properties of one or more existing pages in a single operation. Each page is fully self-contained with all parameters. Always use an array, even for a single page. Can modify title, font, position, archiving status, and other settings. Only provided fields will be updated.",
      inputSchema: {
        pages: z
          .array(
            z.object({
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
            })
          )
          .describe("Array of pages to update (use single-element array for one page)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          pages: Array<{
            workspace_id: string
            page_id: string
            title?: string
            font?: string
            project_id?: string
            cover_image?: {
              type: string
              src?: string
              blurhash?: string
              color?: string
              emoji?: string
              positionY?: number
              object_fit?: string
            }
            icon?: {
              type: string
              src?: string
              blurhash?: string
              color?: string
              emoji?: string
            }
            is_public?: boolean
            parent_page_id?: string
            position?: number
            public_settings?: {
              url: string
              robots: string[]
            }
            archived?: boolean
            hide_table_of_contents?: boolean
            hide_subpages?: boolean
          }>
        }
      ) => {
        // Process pages sequentially
        const results = []
        for (const page of args.pages) {
          const params = buildParams<UpdatePageParams>({
            title: page.title,
            font: page.font,
            project_id: page.project_id,
            cover_image: page.cover_image,
            icon: page.icon,
            is_public: page.is_public,
            parent_page_id: page.parent_page_id,
            position: page.position,
            public_settings: page.public_settings,
            archived: page.archived,
            hide_table_of_contents: page.hide_table_of_contents,
            hide_subpages: page.hide_subpages,
          })

          const result = await client.pages.update(
            page.workspace_id,
            page.page_id,
            params as UpdatePageParams
          )
          results.push(result)
        }

        return { pages: results }
      }
    )
  )

  // ============================================================================
  // TOOL: page_get
  // Get detailed information about a specific page
  // ============================================================================
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

  // ============================================================================
  // TOOL: page_get_all
  // List all pages in a workspace
  // ============================================================================
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

  // ============================================================================
  // TOOL: page_duplicate
  // Clone an existing page with its content
  // ============================================================================
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

  // ============================================================================
  // TOOL: page_archives
  // Archive one or more pages in a single operation (soft delete)
  // ============================================================================
  server.registerTool(
    "page_archives",
    {
      title: "Archive Pages",
      description:
        "Archive one or more pages in a single operation to remove them from active view while preserving their content. Each page is fully self-contained with all parameters. Always use an array, even for a single page. Archived pages can be restored later.",
      inputSchema: {
        pages: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              page_id: z.string().describe("Page ID to archive"),
            })
          )
          .describe("Array of pages to archive (use single-element array for one page)"),
      },
    },
    createToolHandler(
      async (client, args: { pages: Array<{ workspace_id: string; page_id: string }> }) => {
        // Process pages sequentially
        const results = []
        for (const page of args.pages) {
          const result = await client.pages.archive(page.workspace_id, page.page_id)
          results.push(result)
        }

        return { archived: results }
      }
    )
  )

  // ============================================================================
  // TOOL: page_deletes
  // Permanently delete one or more pages in a single operation
  // ============================================================================
  server.registerTool(
    "page_deletes",
    {
      title: "Delete Pages",
      description:
        "Permanently delete one or more pages in a single operation. Each page is fully self-contained with all parameters. Always use an array, even for a single page. This action cannot be undone. Consider archiving instead for soft deletion.",
      inputSchema: {
        pages: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              page_id: z.string().describe("Page ID to delete"),
            })
          )
          .describe("Array of pages to delete (use single-element array for one page)"),
      },
    },
    createToolHandler(
      async (client, args: { pages: Array<{ workspace_id: string; page_id: string }> }) => {
        // Process pages sequentially
        const results = []
        for (const page of args.pages) {
          const result = await client.pages.delete(page.workspace_id, page.page_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )
}
