/**
 * @fileoverview Sprint management tools.
 * Provides tools for sprint operations including list ID discovery.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createToolHandler } from "./helpers.js"

/**
 * Registers sprint management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerSprintTools(server: McpServer) {
  // ============================================================================
  // TOOL: sprint_get_all
  // List all sprints for a space
  // ============================================================================
  server.registerTool(
    "sprint_get_all",
    {
      title: "Get All Sprints",
      description:
        "Get all sprints for a space. Returns sprint IDs, dates, and basic info. Use sprint_get if you need to see available list names before creating cards.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        space_id: z.string().describe("Space ID (project_id) to get sprints from"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.sprints.list(args.workspace_id, args.space_id)
    })
  )

  // ============================================================================
  // TOOL: sprint_gets
  // Get detailed information about one or more sprints in a single operation
  // ============================================================================
  server.registerTool(
    "sprint_gets",
    {
      title: "Get Sprints",
      description:
        "Get detailed sprint information for one or more sprints in a single operation. Each sprint is fully self-contained with all parameters. Always use an array, even for a single sprint. Returns available lists for each sprint. Use this to discover list names and IDs before creating cards.",
      inputSchema: {
        sprints: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              sprint_id: z.string().describe("Sprint ID to retrieve"),
              space_id: z.string().describe("Space ID (project_id) - required for sprint lookup"),
            })
          )
          .describe("Array of sprints to retrieve (use single-element array for one sprint)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          sprints: Array<{
            workspace_id: string
            sprint_id: string
            space_id: string
          }>
        }
      ) => {
        // Process sprints sequentially
        const results = []
        for (const sprint of args.sprints) {
          const result = await client.sprints.get(
            sprint.workspace_id,
            sprint.sprint_id,
            sprint.space_id
          )
          results.push(result)
        }

        return { sprints: results }
      }
    )
  )
}
