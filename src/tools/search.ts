/**
 * @fileoverview Global search tools implementation.
 * Provides tools for searching across all SuperThread entities.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

/**
 * Registers search tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerSearchTools(server: McpServer) {
  // get_search_results - Global search
  server.registerTool(
    "get_search_results",
    {
      title: "Get Search Results",
      description:
        "Search across all SuperThread entities (cards, boards, spaces, pages, etc.)",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        query: z.string().describe("Search query string"),
        entity_types: z
          .array(z.enum(["cards", "boards", "spaces", "pages", "notes"]))
          .optional()
          .describe("Filter by entity types"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().search.search(workspace_id, query, filters)
      throw new Error("get_search_results not implemented yet")
    }
  )
}

