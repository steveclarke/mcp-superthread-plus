/**
 * @fileoverview Page management tools.
 * Provides tools for page operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type { CreatePageParams, UpdatePageParams, DuplicatePageParams } from "../api/pages.js"

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
    async (args) => {
      try {
        const client = createClient()

        const params: CreatePageParams = {
          project_id: args.project_id,
        }

        if (args.title !== undefined) params.title = args.title
        if (args.content !== undefined) params.content = args.content
        if (args.schema !== undefined) params.schema = args.schema
        if (args.font !== undefined) params.font = args.font
        if (args.cover_image !== undefined) params.cover_image = args.cover_image
        if (args.icon !== undefined) params.icon = args.icon
        if (args.parent_page_id !== undefined) params.parent_page_id = args.parent_page_id
        if (args.position !== undefined) params.position = args.position
        if (args.is_public !== undefined) params.is_public = args.is_public

        const page = await client.pages.create(args.workspace_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(page, null, 2),
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
    async (args) => {
      try {
        const client = createClient()

        const params: UpdatePageParams = {}

        if (args.title !== undefined) params.title = args.title
        if (args.font !== undefined) params.font = args.font
        if (args.project_id !== undefined) params.project_id = args.project_id
        if (args.cover_image !== undefined) params.cover_image = args.cover_image
        if (args.icon !== undefined) params.icon = args.icon
        if (args.is_public !== undefined) params.is_public = args.is_public
        if (args.parent_page_id !== undefined) params.parent_page_id = args.parent_page_id
        if (args.position !== undefined) params.position = args.position
        if (args.public_settings !== undefined) params.public_settings = args.public_settings
        if (args.archived !== undefined) params.archived = args.archived
        if (args.hide_table_of_contents !== undefined)
          params.hide_table_of_contents = args.hide_table_of_contents
        if (args.hide_subpages !== undefined) params.hide_subpages = args.hide_subpages

        const page = await client.pages.update(args.workspace_id, args.page_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(page, null, 2),
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
    async (args) => {
      try {
        const client = createClient()
        const page = await client.pages.get(args.workspace_id, args.page_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(page, null, 2),
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
    async (args) => {
      try {
        const client = createClient()

        const params: {
          project_id?: string
          archived?: boolean
          updated_recently?: boolean
        } = {}

        if (args.project_id !== undefined) params.project_id = args.project_id
        if (args.archived !== undefined) params.archived = args.archived
        if (args.updated_recently !== undefined) params.updated_recently = args.updated_recently

        const pages = await client.pages.list(
          args.workspace_id,
          Object.keys(params).length > 0 ? params : undefined
        )

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(pages, null, 2),
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
    async (args) => {
      try {
        const client = createClient()

        const params: DuplicatePageParams = {
          project_id: args.project_id,
        }

        if (args.title !== undefined) params.title = args.title
        if (args.parent_page_id !== undefined) params.parent_page_id = args.parent_page_id
        if (args.position !== undefined) params.position = args.position

        const page = await client.pages.duplicate(args.workspace_id, args.page_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(page, null, 2),
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
    async (args) => {
      try {
        const client = createClient()
        const page = await client.pages.archive(args.workspace_id, args.page_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(page, null, 2),
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
    async (args) => {
      try {
        const client = createClient()
        const result = await client.pages.delete(args.workspace_id, args.page_id)

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
