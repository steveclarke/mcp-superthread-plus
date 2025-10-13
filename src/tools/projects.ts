/**
 * @fileoverview Project (Roadmap) management tools.
 * Provides tools for roadmap project/epic operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"

/**
 * Registers project (roadmap) management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerProjectTools(server: McpServer) {
  console.error("Registering project tools...")
  // project_get_all - List all projects in workspace
  server.registerTool(
    "project_get_all",
    {
      title: "Get All Projects",
      description:
        "Get all roadmap projects (epics) in a workspace. Use this to see high-level initiatives and their status.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to get projects from"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const projects = await client.projects.list(args.workspace_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(projects, null, 2),
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

  // project_get - Get single project details
  server.registerTool(
    "project_get",
    {
      title: "Get Project",
      description:
        "Get detailed information about a specific roadmap project (epic) including lists, cards, and progress.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID (epic) to retrieve"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const project = await client.projects.get(args.workspace_id, args.project_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(project, null, 2),
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
