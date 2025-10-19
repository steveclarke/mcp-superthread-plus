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
  // ============================================================================
  // TOOL: project_get_all
  // List all roadmap projects (epics) in a workspace
  // ============================================================================
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

  // ============================================================================
  // TOOL: project_get
  // Get detailed information about one or more projects in a single operation
  // ============================================================================
  server.registerTool(
    "project_get",
    {
      title: "Get Projects",
      description:
        "Get detailed information about one or more roadmap projects (epics) in a single operation. Each project is fully self-contained with all parameters. Always use an array, even for a single project. Returns lists, cards, and progress for each project.",
      inputSchema: {
        projects: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              project_id: z.string().describe("Project ID (epic) to retrieve"),
            })
          )
          .describe("Array of projects to retrieve (use single-element array for one project)"),
      },
    },
    createToolHandler(
      async (client, args: { projects: Array<{ workspace_id: string; project_id: string }> }) => {
        // Process projects sequentially
        const results = []
        for (const project of args.projects) {
          const result = await client.projects.get(project.workspace_id, project.project_id)
          results.push(result)
        }

        return { projects: results }
      }
    )
  )

  // ============================================================================
  // TOOL: project_create
  // Create one or more roadmap projects (epics) in a single operation
  // ============================================================================
  server.registerTool(
    "project_create",
    {
      title: "Create Projects",
      description:
        "Create one or more roadmap projects (epics) in a single operation. Each project is fully self-contained with all parameters. Always use an array, even for a single project. Specify essential properties such as title, list ID (status), and optional fields like content, icon, dates, priority, and members.",
      inputSchema: {
        projects: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              title: z.string().describe("Project title (required)"),
              list_id: z.string().describe("Status list ID (required)"),
              content: z.string().optional().describe("Project description/content"),
              schema: z.number().optional().describe("Schema version"),
              start_date: z.number().optional().describe("Start date (Unix timestamp)"),
              due_date: z.number().optional().describe("Due date (Unix timestamp)"),
              owner_id: z.string().optional().describe("Owner user ID"),
              priority: z.number().optional().describe("Priority level"),
            })
          )
          .describe("Array of projects to create (use single-element array for one project)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          projects: Array<{
            workspace_id: string
            title: string
            list_id: string
            content?: string
            schema?: number
            start_date?: number
            due_date?: number
            owner_id?: string
            priority?: number
          }>
        }
      ) => {
        // Process projects sequentially
        const results = []
        for (const project of args.projects) {
          const params = buildParams<CreateProjectParams>({
            title: project.title,
            list_id: project.list_id,
            content: project.content,
            schema: project.schema,
            start_date: project.start_date,
            due_date: project.due_date,
            owner_id: project.owner_id,
            priority: project.priority,
          })

          const result = await client.projects.create(
            project.workspace_id,
            params as CreateProjectParams
          )
          results.push(result)
        }

        return { projects: results }
      }
    )
  )

  // ============================================================================
  // TOOL: project_update
  // Update one or more existing projects' properties in a single operation
  // ============================================================================
  server.registerTool(
    "project_update",
    {
      title: "Update Projects",
      description:
        "Update one or more roadmap projects (epics) in a single operation. Each project is fully self-contained with all parameters. Always use an array, even for a single project. Can modify fields such as title, content, due date, priority, and status. Supports archiving via the archived parameter.",
      inputSchema: {
        projects: z
          .array(
            z.object({
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
            })
          )
          .describe("Array of projects to update (use single-element array for one project)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          projects: Array<{
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
          }>
        }
      ) => {
        // Process projects sequentially
        const results = []
        for (const project of args.projects) {
          const params = buildParams<UpdateProjectParams>({
            title: project.title,
            list_id: project.list_id,
            owner_id: project.owner_id,
            start_date: project.start_date,
            due_date: project.due_date,
            position: project.position,
            priority: project.priority,
            archived: project.archived,
          })

          const result = await client.projects.update(
            project.workspace_id,
            project.project_id,
            params as UpdateProjectParams
          )
          results.push(result)
        }

        return { projects: results }
      }
    )
  )

  // ============================================================================
  // TOOL: project_delete
  // Permanently delete one or more projects in a single operation
  // ============================================================================
  server.registerTool(
    "project_delete",
    {
      title: "Delete Projects",
      description:
        "Permanently delete one or more roadmap projects (epics) in a single operation. Each project is fully self-contained with all parameters. Always use an array, even for a single project. This action cannot be undone. Consider archiving instead for soft deletion.",
      inputSchema: {
        projects: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              project_id: z.string().describe("Project ID (epic) to delete"),
            })
          )
          .describe("Array of projects to delete (use single-element array for one project)"),
      },
    },
    createToolHandler(
      async (client, args: { projects: Array<{ workspace_id: string; project_id: string }> }) => {
        // Process projects sequentially
        const results = []
        for (const project of args.projects) {
          const result = await client.projects.delete(project.workspace_id, project.project_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )

  // ============================================================================
  // TOOL: project_add_related
  // Link one or more cards to roadmap projects (epics) in a single operation
  // ============================================================================
  server.registerTool(
    "project_add_related",
    {
      title: "Add Related Cards to Projects",
      description:
        "Link one or more cards to roadmap projects (epics) in a single operation. Each operation is fully self-contained with all parameters. Always use an array, even for a single link. Use this to associate cards with high-level initiatives.\n\nWHEN TO USE:\n- Link top-level cards to Roadmap Projects (epics)\n- This establishes the top-level epic relationship\n- All child cards will inherit this epic automatically\n\nDO NOT USE FOR:\n- Parent-child relationships (use parent_card_id in card_creates instead)\n- Hierarchy relationships (use parent_card_id in card_creates instead)\n- Child cards (they inherit epic from their parent automatically)",
      inputSchema: {
        operations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              project_id: z.string().describe("Project ID (epic) to link card to"),
              card_id: z.string().describe("Card ID to link to the project"),
            })
          )
          .describe(
            "Array of card-project links to create (use single-element array for one link)"
          ),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          operations: Array<{
            workspace_id: string
            project_id: string
            card_id: string
          }>
        }
      ) => {
        // Process operations sequentially
        const results = []
        for (const operation of args.operations) {
          const result = await client.projects.addRelatedCard(
            operation.workspace_id,
            operation.project_id,
            operation.card_id
          )
          results.push(result)
        }

        return { linked: results }
      }
    )
  )

  // ============================================================================
  // TOOL: project_remove_related
  // Remove one or more card links from projects in a single operation
  // ============================================================================
  server.registerTool(
    "project_remove_related",
    {
      title: "Remove Related Cards from Projects",
      description:
        "Remove one or more card links from roadmap projects (epics) in a single operation. Each operation is fully self-contained with all parameters. Always use an array, even for a single unlink. This removes the relationships but does not delete the cards.",
      inputSchema: {
        operations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              project_id: z.string().describe("Project ID (epic) to unlink card from"),
              card_id: z.string().describe("Card ID to unlink from the project"),
            })
          )
          .describe(
            "Array of card-project links to remove (use single-element array for one unlink)"
          ),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          operations: Array<{
            workspace_id: string
            project_id: string
            card_id: string
          }>
        }
      ) => {
        // Process operations sequentially
        const results = []
        for (const operation of args.operations) {
          const result = await client.projects.removeRelatedCard(
            operation.workspace_id,
            operation.project_id,
            operation.card_id
          )
          results.push(result)
        }

        return { unlinked: results }
      }
    )
  )
}
