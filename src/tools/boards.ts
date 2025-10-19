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
  // ============================================================================
  // TOOL: board_create
  // Create one or more boards (batch operation)
  // ============================================================================
  server.registerTool(
    "board_create",
    {
      title: "Create Boards",
      description:
        "Create one or more boards in a single operation. Each board is fully self-contained with all parameters. Always use an array, even for a single board. Boards must be associated with a space (project_id).",
      inputSchema: {
        boards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID to create board in"),
              project_id: z.string().describe("Space/project ID to associate the board with"),
              title: z.string().describe("Board title"),
              content: z.string().optional().describe("Board description/content"),
              icon: z.string().optional().describe("Icon name for the board"),
              color: z.string().optional().describe("Color for the board"),
              layout: z.string().optional().describe("Board layout (defaults to 'board')"),
            })
          )
          .describe("Array of boards to create (use single-element array for one board)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          boards: Array<{
            workspace_id: string
            project_id: string
            title: string
            content?: string
            icon?: string
            color?: string
            layout?: string
          }>
        }
      ) => {
        // Process boards sequentially
        const results = []
        for (const board of args.boards) {
          const params = buildParams<CreateBoardParams>({
            project_id: board.project_id,
            title: board.title,
            content: board.content,
            icon: board.icon,
            color: board.color,
            layout: board.layout,
          })

          const result = await client.boards.create(board.workspace_id, params as CreateBoardParams)
          results.push(result)
        }

        return { boards: results }
      }
    )
  )

  // ============================================================================
  // TOOL: board_create_list
  // Create one or more lists (batch operation)
  // ============================================================================
  server.registerTool(
    "board_create_list",
    {
      title: "Create Lists",
      description:
        "Create one or more lists (columns/statuses) in a single operation. Each list is fully self-contained with all parameters. Always use an array, even for a single list. Lists are used to organize cards by status or workflow stage.",
      inputSchema: {
        lists: z
          .array(
            z.object({
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
            })
          )
          .describe("Array of lists to create (use single-element array for one list)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          lists: Array<{
            workspace_id: string
            board_id: string
            title: string
            content?: string
            icon?: string
            color?: string
            behavior?: string
          }>
        }
      ) => {
        // Process lists sequentially
        const results = []
        for (const list of args.lists) {
          const params = buildParams<CreateListParams>({
            board_id: list.board_id,
            title: list.title,
            content: list.content,
            icon: list.icon,
            color: list.color,
            behavior: list.behavior,
          })

          const result = await client.boards.createList(
            list.workspace_id,
            params as CreateListParams
          )
          results.push(result)
        }

        return { lists: results }
      }
    )
  )

  // ============================================================================
  // TOOL: board_get_all
  // List all boards in a workspace/space
  // ============================================================================
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

  // ============================================================================
  // TOOL: board_get
  // Get detailed information about one or more boards in a single operation
  // ============================================================================
  server.registerTool(
    "board_get",
    {
      title: "Get Boards",
      description:
        "Get detailed information about one or more boards in a single operation. Each board is fully self-contained with all parameters. Always use an array, even for a single board. Returns all lists, cards, and their current status for each board.",
      inputSchema: {
        boards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              board_id: z.string().describe("Board ID to retrieve"),
            })
          )
          .describe("Array of boards to retrieve (use single-element array for one board)"),
      },
    },
    createToolHandler(
      async (client, args: { boards: Array<{ workspace_id: string; board_id: string }> }) => {
        // Process boards sequentially
        const results = []
        for (const board of args.boards) {
          const result = await client.boards.get(board.workspace_id, board.board_id)
          results.push(result)
        }

        return { boards: results }
      }
    )
  )

  // ============================================================================
  // TOOL: board_update
  // Update one or more boards (batch operation)
  // ============================================================================
  server.registerTool(
    "board_update",
    {
      title: "Update Boards",
      description:
        "Update properties of one or more existing boards in a single operation. Each board is fully self-contained with all parameters. Always use an array, even for a single board. Can modify title, description, icon, color, or archive status.",
      inputSchema: {
        boards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              board_id: z.string().describe("Board ID to update"),
              title: z.string().optional().describe("New board title"),
              content: z.string().optional().describe("New board description/content"),
              icon: z.string().optional().describe("New icon name"),
              color: z.string().optional().describe("New color"),
              archived: z.boolean().optional().describe("Archive or unarchive the board"),
            })
          )
          .describe("Array of boards to update (use single-element array for one board)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          boards: Array<{
            workspace_id: string
            board_id: string
            title?: string
            content?: string
            icon?: string
            color?: string
            archived?: boolean
          }>
        }
      ) => {
        // Process boards sequentially
        const results = []
        for (const board of args.boards) {
          const params = buildParams<UpdateBoardParams>({
            title: board.title,
            content: board.content,
            icon: board.icon,
            color: board.color,
            archived: board.archived,
          })

          const result = await client.boards.update(
            board.workspace_id,
            board.board_id,
            params as UpdateBoardParams
          )
          results.push(result)
        }

        return { boards: results }
      }
    )
  )

  // ============================================================================
  // TOOL: board_update_list
  // Update one or more lists (batch operation)
  // ============================================================================
  server.registerTool(
    "board_update_list",
    {
      title: "Update Lists",
      description:
        "Update properties of one or more existing lists (columns/statuses) in a single operation. Each list is fully self-contained with all parameters. Always use an array, even for a single list. Can modify title, description, icon, color, or behavior.",
      inputSchema: {
        lists: z
          .array(
            z.object({
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
            })
          )
          .describe("Array of lists to update (use single-element array for one list)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          lists: Array<{
            workspace_id: string
            list_id: string
            title?: string
            content?: string
            icon?: string
            color?: string
            behavior?: string
          }>
        }
      ) => {
        // Process lists sequentially
        const results = []
        for (const list of args.lists) {
          const params = buildParams<UpdateListParams>({
            title: list.title,
            content: list.content,
            icon: list.icon,
            color: list.color,
            behavior: list.behavior,
          })

          const result = await client.boards.updateList(
            list.workspace_id,
            list.list_id,
            params as UpdateListParams
          )
          results.push(result)
        }

        return { lists: results }
      }
    )
  )

  // ============================================================================
  // TOOL: board_duplicate
  // Clone an existing board with all its lists
  // ============================================================================
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

  // ============================================================================
  // TOOL: board_delete
  // Permanently delete one or more boards (batch operation)
  // ============================================================================
  server.registerTool(
    "board_delete",
    {
      title: "Delete Boards",
      description:
        "Permanently delete one or more boards in a single operation. Each board is fully self-contained with all parameters. Always use an array, even for a single board. This action cannot be undone. All lists and cards within the boards will be deleted.",
      inputSchema: {
        boards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              board_id: z.string().describe("Board ID to delete"),
            })
          )
          .describe("Array of boards to delete (use single-element array for one board)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          boards: Array<{
            workspace_id: string
            board_id: string
          }>
        }
      ) => {
        // Process boards sequentially
        const results = []
        for (const board of args.boards) {
          const result = await client.boards.delete(board.workspace_id, board.board_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )

  // ============================================================================
  // TOOL: board_delete_list
  // Permanently delete one or more lists (batch operation)
  // ============================================================================
  server.registerTool(
    "board_delete_list",
    {
      title: "Delete Lists",
      description:
        "Permanently delete one or more lists from boards in a single operation. Each list is fully self-contained with all parameters. Always use an array, even for a single list. This action cannot be undone. All cards within the lists will be moved or deleted depending on board configuration.",
      inputSchema: {
        lists: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              list_id: z.string().describe("List ID to delete"),
            })
          )
          .describe("Array of lists to delete (use single-element array for one list)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          lists: Array<{
            workspace_id: string
            list_id: string
          }>
        }
      ) => {
        // Process lists sequentially
        const results = []
        for (const list of args.lists) {
          const result = await client.boards.deleteList(list.workspace_id, list.list_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )
}
