/**
 * @fileoverview Search tools for querying workspace entities.
 * Provides search operations across boards, cards, pages, projects, epics, and notes.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type { SearchParams } from "../api/search.js"

/**
 * Registers search tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerSearchTools(server: McpServer) {
  // search_get - Execute search query
  server.registerTool(
    "search_get",
    {
      title: "Get Search Results",
      description:
        "Execute a search query across multiple workspace entities, including boards, cards, pages, and projects. Customize the search by specifying targeted fields like title or content, filtering by types of objects, or focusing on specific statuses. Additional options include filtering by project, controlling whether archived data is included, and choosing grouped or ungrouped results. This comprehensive search endpoint provides flexibility to locate relevant workspace data efficiently.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        q: z.string().describe("Search query string"),
        field: z
          .enum(["title", "content"])
          .optional()
          .describe("Target fields to search in (title or content)"),
        types: z
          .array(z.string())
          .optional()
          .describe("Filter by entity types (e.g., board, card, page, project, epic, note)"),
        statuses: z.array(z.string()).optional().describe("Filter by card statuses"),
        project_id: z.string().optional().describe("Filter by specific project/space ID"),
        archived: z.boolean().optional().describe("Include archived items (default: false)"),
        grouped: z
          .boolean()
          .optional()
          .describe("Return grouped results by entity type (default: false)"),
        cursor: z.string().optional().describe("Pagination cursor for retrieving more results"),
      },
    },
    async (args: {
      workspace_id: string
      q: string
      field?: "title" | "content"
      types?: string[]
      statuses?: string[]
      project_id?: string
      archived?: boolean
      grouped?: boolean
      cursor?: string
    }) => {
      try {
        const client = createClient()

        const params: SearchParams = {
          q: args.q,
        }

        if (args.field) params.field = args.field
        if (args.types) params.types = args.types
        if (args.statuses) params.statuses = args.statuses
        if (args.project_id) params.project_id = args.project_id
        if (args.archived !== undefined) params.archived = args.archived
        if (args.grouped !== undefined) params.grouped = args.grouped
        if (args.cursor) params.cursor = args.cursor

        const result = await client.search.search(args.workspace_id, params)

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
