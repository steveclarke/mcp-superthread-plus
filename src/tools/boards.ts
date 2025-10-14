/**
 * @fileoverview Board management tools.
 * Provides tools for board and kanban operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type {
  CreateBoardParams,
  CreateListParams,
  UpdateBoardParams,
  UpdateListParams,
} from "../api/boards.js"

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
    async (args) => {
      try {
        const client = createClient()

        // Build params object
        const params: CreateBoardParams = {
          project_id: args.project_id,
          title: args.title,
        }

        if (args.content) params.content = args.content
        if (args.icon) params.icon = args.icon
        if (args.color) params.color = args.color
        if (args.layout) params.layout = args.layout

        const board = await client.boards.create(args.workspace_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(board, null, 2),
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
    async (args) => {
      try {
        const client = createClient()

        // Build params object
        const params: CreateListParams = {
          board_id: args.board_id,
          title: args.title,
        }

        if (args.content) params.content = args.content
        if (args.icon) params.icon = args.icon
        if (args.color) params.color = args.color
        if (args.behavior) params.behavior = args.behavior

        const list = await client.boards.createList(args.workspace_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(list, null, 2),
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
    async (args) => {
      try {
        const client = createClient()
        const options: { project_id: string; bookmarked?: boolean; archived?: boolean } = {
          project_id: args.space_id,
        }

        if (args.bookmarked !== undefined) options.bookmarked = args.bookmarked
        if (args.archived !== undefined) options.archived = args.archived

        const boards = await client.boards.list(args.workspace_id, options)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(boards, null, 2),
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
    async (args) => {
      try {
        const client = createClient()
        const board = await client.boards.get(args.workspace_id, args.board_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(board, null, 2),
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
    async (args) => {
      try {
        const client = createClient()

        const params: UpdateBoardParams = {}
        if (args.title !== undefined) params.title = args.title
        if (args.content !== undefined) params.content = args.content
        if (args.icon !== undefined) params.icon = args.icon
        if (args.color !== undefined) params.color = args.color
        if (args.archived !== undefined) params.archived = args.archived

        const board = await client.boards.update(args.workspace_id, args.board_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(board, null, 2),
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
    async (args) => {
      try {
        const client = createClient()

        const params: UpdateListParams = {}
        if (args.title !== undefined) params.title = args.title
        if (args.content !== undefined) params.content = args.content
        if (args.icon !== undefined) params.icon = args.icon
        if (args.color !== undefined) params.color = args.color
        if (args.behavior !== undefined) params.behavior = args.behavior

        const list = await client.boards.updateList(args.workspace_id, args.list_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(list, null, 2),
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
    async (args) => {
      try {
        const client = createClient()
        const params: { title?: string; project_id?: string } = {}
        if (args.title) params.title = args.title
        if (args.project_id) params.project_id = args.project_id

        const board = await client.boards.duplicate(
          args.workspace_id,
          args.board_id,
          Object.keys(params).length > 0 ? params : undefined
        )

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(board, null, 2),
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
    async (args) => {
      try {
        const client = createClient()
        const result = await client.boards.delete(args.workspace_id, args.board_id)

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
