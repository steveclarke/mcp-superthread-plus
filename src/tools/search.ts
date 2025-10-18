/**
 * @fileoverview Search tools for querying workspace entities.
 * Provides search operations across boards, cards, pages, projects, epics, and notes.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { SearchParams } from "../api/search.js"
import { createToolHandler, buildParams } from "./helpers.js"

/**
 * Registers search tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerSearchTools(server: McpServer) {
  // ============================================================================
  // TOOL: search_get
  // Execute a search query across workspace entities
  // ============================================================================
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
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          q: string
          field?: "title" | "content"
          types?: string[]
          statuses?: string[]
          project_id?: string
          archived?: boolean
          grouped?: boolean
          cursor?: string
        }
      ) => {
        const params = buildParams<SearchParams>({
          q: args.q,
          field: args.field,
          types: args.types,
          statuses: args.statuses,
          project_id: args.project_id,
          archived: args.archived,
          grouped: args.grouped,
          cursor: args.cursor,
        })

        return client.search.search(args.workspace_id, params as SearchParams)
      }
    )
  )
}
