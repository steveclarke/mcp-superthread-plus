/**
 * @fileoverview Project (Roadmap) management tools implementation.
 * Provides tools for managing roadmap projects (epics).
 * Note: These are different from Spaces (which are called "projects" in the API).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

/**
 * Registers project (roadmap) management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerProjectTools(server: McpServer) {
  // create_project - Create roadmap project
  server.registerTool(
    "create_project",
    {
      title: "Create Project",
      description: "Create a new project on the roadmap (epic)",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        title: z.string().describe("Project title"),
        description: z.string().optional().describe("Project description"),
        start_date: z.number().optional().describe("Start date (Unix timestamp)"),
        end_date: z.number().optional().describe("End date (Unix timestamp)"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.create(workspace_id, data)
      throw new Error("create_project not implemented yet")
    }
  )

  // update_project - Update project
  server.registerTool(
    "update_project",
    {
      title: "Update Project",
      description: "Update an existing roadmap project",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID to update"),
        title: z.string().optional().describe("New title"),
        description: z.string().optional().describe("New description"),
        start_date: z.number().optional().describe("New start date"),
        end_date: z.number().optional().describe("New end date"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.update(workspace_id, project_id, data)
      throw new Error("update_project not implemented yet")
    }
  )

  // get_project - Get project details
  server.registerTool(
    "get_project",
    {
      title: "Get Project",
      description: "Get detailed information about a roadmap project",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID to retrieve"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.get(workspace_id, project_id)
      throw new Error("get_project not implemented yet")
    }
  )

  // get_projects - List all projects
  server.registerTool(
    "get_projects",
    {
      title: "Get Projects",
      description: "List all roadmap projects in the workspace",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.list(workspace_id)
      throw new Error("get_projects not implemented yet")
    }
  )

  // add_related_card - Link card to project
  server.registerTool(
    "add_related_card",
    {
      title: "Add Related Card to Project",
      description: "Link a card to a roadmap project",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID"),
        card_id: z.string().describe("Card ID to link"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.addRelatedCard(workspace_id, project_id, card_id)
      throw new Error("add_related_card not implemented yet")
    }
  )

  // remove_related_card - Unlink card from project
  server.registerTool(
    "remove_related_card",
    {
      title: "Remove Related Card from Project",
      description: "Unlink a card from a roadmap project",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID"),
        card_id: z.string().describe("Card ID to unlink"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.removeRelatedCard(workspace_id, project_id, card_id)
      throw new Error("remove_related_card not implemented yet")
    }
  )

  // archive_project - Archive project
  server.registerTool(
    "archive_project",
    {
      title: "Archive Project",
      description: "Archive a roadmap project",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID to archive"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.archive(workspace_id, project_id)
      throw new Error("archive_project not implemented yet")
    }
  )

  // delete_project - Delete project
  server.registerTool(
    "delete_project",
    {
      title: "Delete Project",
      description: "Permanently delete a roadmap project",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().describe("Project ID to delete"),
      },
    },
    async () => {
      // TODO: Implement API call using createClient().projects.delete(workspace_id, project_id)
      throw new Error("delete_project not implemented yet")
    }
  )
}

