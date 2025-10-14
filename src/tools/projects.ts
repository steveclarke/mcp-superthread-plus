/**
 * @fileoverview Project (Roadmap) management tools.
 * Provides tools for roadmap project/epic operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { CreateProjectParams, UpdateProjectParams } from "../api/projects.js"
import { createToolHandler, buildParams } from "./helpers.js"

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
    createToolHandler(async (client, args) => {
      return client.projects.list(args.workspace_id)
    })
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
    createToolHandler(async (client, args) => {
      return client.projects.get(args.workspace_id, args.project_id)
    })
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
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          title: string
          list_id: string
          content?: string
          schema?: number
          start_date?: number
          due_date?: number
          owner_id?: string
          priority?: number
        }
      ) => {
        const params = buildParams<CreateProjectParams>({
          title: args.title,
          list_id: args.list_id,
          content: args.content,
          schema: args.schema,
          start_date: args.start_date,
          due_date: args.due_date,
          owner_id: args.owner_id,
          priority: args.priority,
        })

        return client.projects.create(args.workspace_id, params as CreateProjectParams)
      }
    )
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
    createToolHandler(
      async (
        client,
        args: {
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
        }
      ) => {
        const params = buildParams<UpdateProjectParams>({
          title: args.title,
          list_id: args.list_id,
          owner_id: args.owner_id,
          start_date: args.start_date,
          due_date: args.due_date,
          position: args.position,
          priority: args.priority,
          archived: args.archived,
        })

        return client.projects.update(
          args.workspace_id,
          args.project_id,
          params as UpdateProjectParams
        )
      }
    )
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
    createToolHandler(async (client, args: { workspace_id: string; project_id: string }) => {
      return client.projects.delete(args.workspace_id, args.project_id)
    })
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
    createToolHandler(
      async (client, args: { workspace_id: string; project_id: string; card_id: string }) => {
        return client.projects.addRelatedCard(args.workspace_id, args.project_id, args.card_id)
      }
    )
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
    createToolHandler(
      async (client, args: { workspace_id: string; project_id: string; card_id: string }) => {
        return client.projects.removeRelatedCard(args.workspace_id, args.project_id, args.card_id)
      }
    )
  )
}
