/**
 * @fileoverview Project (Roadmap) management tools.
 * Provides tools for roadmap project/epic operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type { CreateProjectParams, UpdateProjectParams } from "../api/projects.js"

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

  // project_create - Create a new project
  server.registerTool(
    "project_create",
    {
      title: "Create Project",
      description:
        "Create a new roadmap project (epic) in a workspace. Specify essential properties such as title, list ID (status), and optional fields like content, icon, dates, priority, and members.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        title: z.string().describe("Project title (required)"),
        list_id: z.string().describe("Status list ID (required)"),
        content: z.string().optional().describe("Project description/content"),
        schema: z.number().optional().describe("Schema version"),
        start_date: z.number().optional().describe("Start date (Unix timestamp)"),
        due_date: z.number().optional().describe("Due date (Unix timestamp)"),
        owner_id: z.string().optional().describe("Owner user ID"),
        priority: z.number().optional().describe("Priority level"),
      },
    },
    async (args: {
      workspace_id: string
      title: string
      list_id: string
      content?: string
      schema?: number
      start_date?: number
      due_date?: number
      owner_id?: string
      priority?: number
    }) => {
      try {
        const client = createClient()

        const params: CreateProjectParams = {
          title: args.title,
          list_id: args.list_id,
        }

        if (args.content) params.content = args.content
        if (args.schema !== undefined) params.schema = args.schema
        if (args.start_date) params.start_date = args.start_date
        if (args.due_date) params.due_date = args.due_date
        if (args.owner_id) params.owner_id = args.owner_id
        if (args.priority !== undefined) params.priority = args.priority

        const result = await client.projects.create(args.workspace_id, params)

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

  // project_update - Update a project
  server.registerTool(
    "project_update",
    {
      title: "Update Project",
      description:
        "Modify a roadmap project (epic). Update fields such as title, content, due date, priority, and status. Supports archiving via the archived parameter.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID (epic) to update"),
        title: z.string().optional().describe("Project title"),
        list_id: z.string().optional().describe("Status list ID"),
        owner_id: z.string().optional().describe("Owner user ID"),
        start_date: z.number().optional().describe("Start date (Unix timestamp)"),
        due_date: z.number().optional().describe("Due date (Unix timestamp)"),
        position: z.number().optional().describe("Position in list"),
        priority: z.number().optional().describe("Priority level"),
        archived: z.boolean().optional().describe("Archive status"),
      },
    },
    async (args: {
      workspace_id: string
      project_id: string
      title?: string
      list_id?: string
      owner_id?: string
      start_date?: number
      due_date?: number
      position?: number
      priority?: number
      archived?: boolean
    }) => {
      try {
        const client = createClient()

        const params: UpdateProjectParams = {}

        if (args.title) params.title = args.title
        if (args.list_id) params.list_id = args.list_id
        if (args.owner_id) params.owner_id = args.owner_id
        if (args.start_date) params.start_date = args.start_date
        if (args.due_date) params.due_date = args.due_date
        if (args.position !== undefined) params.position = args.position
        if (args.priority !== undefined) params.priority = args.priority
        if (args.archived !== undefined) params.archived = args.archived

        const result = await client.projects.update(args.workspace_id, args.project_id, params)

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

  // project_delete - Delete a project
  server.registerTool(
    "project_delete",
    {
      title: "Delete Project",
      description:
        "Permanently delete a roadmap project (epic). This action cannot be undone. Consider archiving instead for soft deletion.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID (epic) to delete"),
      },
    },
    async (args: { workspace_id: string; project_id: string }) => {
      try {
        const client = createClient()

        const result = await client.projects.delete(args.workspace_id, args.project_id)

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

  // project_add_related - Link a card to a project
  server.registerTool(
    "project_add_related",
    {
      title: "Add Related Card to Project",
      description:
        "Link a card to a roadmap project (epic). Use this to associate cards with high-level initiatives.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID (epic) to link card to"),
        card_id: z.string().describe("Card ID to link to the project"),
      },
    },
    async (args: { workspace_id: string; project_id: string; card_id: string }) => {
      try {
        const client = createClient()

        const result = await client.projects.addRelatedCard(
          args.workspace_id,
          args.project_id,
          args.card_id
        )

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

  // project_remove_related - Remove a linked card from a project
  server.registerTool(
    "project_remove_related",
    {
      title: "Remove Related Card from Project",
      description:
        "Remove a card link from a roadmap project (epic). This removes the relationship but does not delete the card.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID (epic) to unlink card from"),
        card_id: z.string().describe("Card ID to unlink from the project"),
      },
    },
    async (args: { workspace_id: string; project_id: string; card_id: string }) => {
      try {
        const client = createClient()

        const result = await client.projects.removeRelatedCard(
          args.workspace_id,
          args.project_id,
          args.card_id
        )

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
