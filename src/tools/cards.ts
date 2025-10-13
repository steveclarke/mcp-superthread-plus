/**
 * @fileoverview Card management tools.
 * Provides tools for card operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { createClient } from "../api/client.js"
import type { CreateCardParams, UpdateCardParams } from "../api/cards.js"

/**
 * Registers card management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCardTools(server: McpServer) {
  // card_create - Create a new card
  server.registerTool(
    "card_create",
    {
      title: "Create Card",
      description:
        "Create a new card in a list on a board or sprint. Required fields: title, list_id, and either board_id or sprint_id.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        title: z.string().describe("Card title"),
        list_id: z.string().describe("List ID where the card will be placed"),
        board_id: z.string().optional().describe("Board ID (required if sprint_id not provided)"),
        sprint_id: z.string().optional().describe("Sprint ID (required if board_id not provided)"),
        content: z.string().optional().describe("Card content (HTML supported, max 102400 chars)"),
        project_id: z.string().optional().describe("Project/Space ID"),
        start_date: z.number().optional().describe("Start date as Unix timestamp in seconds"),
        due_date: z.number().optional().describe("Due date as Unix timestamp in seconds"),
        priority: z.number().optional().describe("Priority level"),
        estimate: z.number().optional().describe("Time estimate"),
        parent_card_id: z.string().optional().describe("Parent card ID for creating subtasks"),
        epic_id: z.string().optional().describe("Epic/Project ID"),
        owner_id: z.string().optional().describe("Card owner user ID"),
      },
    },
    async (args) => {
      try {
        const client = createClient()

        // Build params object
        const params: CreateCardParams = {
          title: args.title,
          list_id: args.list_id,
        }

        if (args.board_id) params.board_id = args.board_id
        if (args.sprint_id) params.sprint_id = args.sprint_id
        if (args.content) params.content = args.content
        if (args.project_id) params.project_id = args.project_id
        if (args.start_date) params.start_date = args.start_date
        if (args.due_date) params.due_date = args.due_date
        if (args.priority !== undefined) params.priority = args.priority
        if (args.estimate !== undefined) params.estimate = args.estimate
        if (args.parent_card_id) params.parent_card_id = args.parent_card_id
        if (args.epic_id) params.epic_id = args.epic_id
        if (args.owner_id) params.owner_id = args.owner_id

        const card = await client.cards.create(args.workspace_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(card, null, 2),
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

  // card_update - Update an existing card
  server.registerTool(
    "card_update",
    {
      title: "Update Card",
      description:
        "Update a card's attributes. Only specified fields will be updated, others remain unchanged. Note: If archived=true/false, only archiving is processed and other changes are ignored. Content cannot be updated via this endpoint.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to update"),
        title: z.string().optional().describe("New card title"),
        board_id: z.string().optional().describe("Move card to different board"),
        list_id: z.string().optional().describe("Move card to different list"),
        project_id: z.string().optional().describe("Change project/space association"),
        sprint_id: z.string().optional().describe("Change sprint association"),
        owner_id: z.string().optional().describe("Change card owner"),
        start_date: z.number().optional().describe("Update start date (Unix timestamp in seconds)"),
        due_date: z.number().optional().describe("Update due date (Unix timestamp in seconds)"),
        position: z.number().optional().describe("Change card position in list"),
        priority: z.number().optional().describe("Update priority level"),
        estimate: z.number().optional().describe("Update time estimate"),
        archived: z.boolean().optional().describe("Archive (true) or unarchive (false) the card"),
      },
    },
    async (args) => {
      try {
        const client = createClient()

        // Build params object with only provided fields
        const params: UpdateCardParams = {}

        if (args.title !== undefined) params.title = args.title
        if (args.board_id !== undefined) params.board_id = args.board_id
        if (args.list_id !== undefined) params.list_id = args.list_id
        if (args.project_id !== undefined) params.project_id = args.project_id
        if (args.sprint_id !== undefined) params.sprint_id = args.sprint_id
        if (args.owner_id !== undefined) params.owner_id = args.owner_id
        if (args.start_date !== undefined) params.start_date = args.start_date
        if (args.due_date !== undefined) params.due_date = args.due_date
        if (args.position !== undefined) params.position = args.position
        if (args.priority !== undefined) params.priority = args.priority
        if (args.estimate !== undefined) params.estimate = args.estimate
        if (args.archived !== undefined) params.archived = args.archived

        const card = await client.cards.update(args.workspace_id, args.card_id, params)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(card, null, 2),
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

  // card_get - Get single card details
  server.registerTool(
    "card_get",
    {
      title: "Get Card",
      description:
        "Get detailed information about a specific card including its content, status, checklists, tags, linked cards, and all metadata.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to retrieve"),
      },
    },
    async (args) => {
      try {
        const client = createClient()
        const card = await client.cards.get(args.workspace_id, args.card_id)

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(card, null, 2),
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
