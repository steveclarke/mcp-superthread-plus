/**
 * @fileoverview Board management tools.
 * Provides tools for board and kanban operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type {
  CreateBoardParams,
  CreateListParams,
  UpdateBoardParams,
  UpdateListParams,
} from "../api/boards.js"
import { createToolHandler, buildParams } from "./helpers.js"

/**
 * Registers board management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerBoardTools(server: McpServer) {
  // board_create - Create a new board
  server.registerTool(
    "board_create",
    {
      title: "Create Board",
      description:
        "Create a new board in a workspace. The board must be associated with a space (project_id). Optionally create lists and add members during creation.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to create board in"),
        project_id: z.string().describe("Space/project ID to associate the board with"),
        title: z.string().describe("Board title"),
        content: z.string().optional().describe("Board description/content"),
        icon: z.string().optional().describe("Icon name for the board"),
        color: z.string().optional().describe("Color for the board"),
        layout: z.string().optional().describe("Board layout (defaults to 'board')"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<CreateBoardParams>({
        project_id: args.project_id,
        title: args.title,
        content: args.content,
        icon: args.icon,
        color: args.color,
        layout: args.layout,
      })

      return client.boards.create(args.workspace_id, params as CreateBoardParams)
    })
  )

  // board_create_list - Create a new list on a board
  server.registerTool(
    "board_create_list",
    {
      title: "Create List",
      description:
        "Create a new list (column/status) within a board. Lists are used to organize cards by status or workflow stage.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        board_id: z.string().describe("Board ID to create the list in"),
        title: z.string().describe("List title (e.g., 'Backlog', 'To Do', 'Done')"),
        content: z.string().optional().describe("List description/content"),
        icon: z.string().optional().describe("Icon name for the list"),
        color: z.string().optional().describe("Color for the list"),
        behavior: z
          .string()
          .optional()
          .describe("List behavior (e.g., 'backlog', 'started', 'completed', 'cancelled')"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<CreateListParams>({
        board_id: args.board_id,
        title: args.title,
        content: args.content,
        icon: args.icon,
        color: args.color,
        behavior: args.behavior,
      })

      return client.boards.createList(args.workspace_id, params as CreateListParams)
    })
  )

  // board_get_all - List all boards in workspace
  server.registerTool(
    "board_get_all",
    {
      title: "Get All Boards",
      description:
        "Get all boards in a workspace. Boards contain kanban-style lists with cards for task management. By default returns non-archived boards.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID to get boards from"),
        space_id: z.string().describe("Space/project ID to get boards from"),
        bookmarked: z.boolean().optional().describe("Optional: Also filter for bookmarked boards"),
        archived: z
          .boolean()
          .optional()
          .describe("Optional: Include archived boards (default: false)"),
      },
    },
    createToolHandler(async (client, args) => {
      const options = buildParams<{ project_id: string; bookmarked?: boolean; archived?: boolean }>(
        {
          project_id: args.space_id,
          bookmarked: args.bookmarked,
          archived: args.archived,
        }
      )

      return client.boards.list(
        args.workspace_id,
        options as { project_id: string; bookmarked?: boolean; archived?: boolean }
      )
    })
  )

  // board_get - Get single board details
  server.registerTool(
    "board_get",
    {
      title: "Get Board",
      description:
        "Get detailed information about a specific board including all lists, cards, and their current status.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        board_id: z.string().describe("Board ID to retrieve"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.boards.get(args.workspace_id, args.board_id)
    })
  )

  // board_update - Update board properties
  server.registerTool(
    "board_update",
    {
      title: "Update Board",
      description:
        "Update properties of an existing board. Can modify title, description, icon, color, or archive status.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        board_id: z.string().describe("Board ID to update"),
        title: z.string().optional().describe("New board title"),
        content: z.string().optional().describe("New board description/content"),
        icon: z.string().optional().describe("New icon name"),
        color: z.string().optional().describe("New color"),
        archived: z.boolean().optional().describe("Archive or unarchive the board"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<UpdateBoardParams>({
        title: args.title,
        content: args.content,
        icon: args.icon,
        color: args.color,
        archived: args.archived,
      })

      return client.boards.update(args.workspace_id, args.board_id, params as UpdateBoardParams)
    })
  )

  // board_update_list - Update list properties
  server.registerTool(
    "board_update_list",
    {
      title: "Update List",
      description:
        "Update properties of an existing list (column/status). Can modify title, description, icon, color, or behavior.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        list_id: z.string().describe("List ID to update"),
        title: z.string().optional().describe("New list title"),
        content: z.string().optional().describe("New list description/content"),
        icon: z.string().optional().describe("New icon name"),
        color: z.string().optional().describe("New color"),
        behavior: z
          .string()
          .optional()
          .describe("New behavior (e.g., 'backlog', 'started', 'completed', 'cancelled')"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<UpdateListParams>({
        title: args.title,
        content: args.content,
        icon: args.icon,
        color: args.color,
        behavior: args.behavior,
      })

      return client.boards.updateList(args.workspace_id, args.list_id, params as UpdateListParams)
    })
  )

  // board_duplicate - Duplicate board
  server.registerTool(
    "board_duplicate",
    {
      title: "Duplicate Board",
      description:
        "Clone an existing board with all its lists and structure. Cards are not duplicated.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        board_id: z.string().describe("Board ID to duplicate"),
        title: z.string().optional().describe("Title for the duplicated board"),
        project_id: z.string().optional().describe("Project/Space ID for the duplicated board"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<{ title?: string; project_id?: string }>({
        title: args.title,
        project_id: args.project_id,
      })

      return client.boards.duplicate(
        args.workspace_id,
        args.board_id,
        Object.keys(params).length > 0 ? params : undefined
      )
    })
  )

  // board_delete - Delete board permanently
  server.registerTool(
    "board_delete",
    {
      title: "Delete Board",
      description:
        "Permanently delete a board. This action cannot be undone. All lists and cards within the board will be deleted.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        board_id: z.string().describe("Board ID to delete"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.boards.delete(args.workspace_id, args.board_id)
    })
  )

  // board_delete_list - Delete list permanently
  server.registerTool(
    "board_delete_list",
    {
      title: "Delete List",
      description:
        "Permanently delete a list from a board. This action cannot be undone. All cards within the list will be moved or deleted depending on board configuration.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        list_id: z.string().describe("List ID to delete"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.boards.deleteList(args.workspace_id, args.list_id)
    })
  )
}
