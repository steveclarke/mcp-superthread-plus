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
  // sprint_get_all - List all sprints for a space
  server.registerTool(
    "sprint_get_all",
    {
      title: "Get All Sprints",
      description:
        "Get all sprints for a space. Returns sprint IDs, dates, and basic info. Use sprint_get to fetch list IDs for card creation.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        space_id: z.string().describe("Space ID (project_id) to get sprints from"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.sprints.list(args.workspace_id, args.space_id)
    })
  )

  // sprint_get - Get single sprint with list details
  server.registerTool(
    "sprint_get",
    {
      title: "Get Sprint",
      description:
        "Get detailed sprint information including list IDs needed for creating cards. Each sprint has UUID-based lists (Not started, In progress, Done, Cancelled) that must be used when creating cards in the sprint.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        sprint_id: z.string().describe("Sprint ID to retrieve"),
        space_id: z.string().describe("Space ID (project_id) - required for sprint lookup"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.sprints.get(args.workspace_id, args.sprint_id, args.space_id)
    })
  )
}
