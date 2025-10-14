/**
 * @fileoverview Card management tools.
 * Provides tools for card operations.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type {
  CreateCardParams,
  UpdateCardParams,
  GetAssignedCardsParams,
  AddRelatedCardParams,
  AddTagsToCardParams,
} from "../api/cards.js"
import { createToolHandler, buildParams } from "./helpers.js"

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
    createToolHandler(async (client, args) => {
      const params = buildParams<CreateCardParams>({
        title: args.title,
        list_id: args.list_id,
        board_id: args.board_id,
        sprint_id: args.sprint_id,
        content: args.content,
        project_id: args.project_id,
        start_date: args.start_date,
        due_date: args.due_date,
        priority: args.priority,
        estimate: args.estimate,
        parent_card_id: args.parent_card_id,
        epic_id: args.epic_id,
        owner_id: args.owner_id,
      })

      return client.cards.create(args.workspace_id, params as CreateCardParams)
    })
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
        epic_id: z.string().optional().describe("Change epic/roadmap project association"),
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
    createToolHandler(async (client, args) => {
      const params = buildParams<UpdateCardParams>({
        title: args.title,
        board_id: args.board_id,
        list_id: args.list_id,
        project_id: args.project_id,
        epic_id: args.epic_id,
        sprint_id: args.sprint_id,
        owner_id: args.owner_id,
        start_date: args.start_date,
        due_date: args.due_date,
        position: args.position,
        priority: args.priority,
        estimate: args.estimate,
        archived: args.archived,
      })

      return client.cards.update(args.workspace_id, args.card_id, params as UpdateCardParams)
    })
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
    createToolHandler(async (client, args) => {
      return client.cards.get(args.workspace_id, args.card_id)
    })
  )

  // card_get_assigned - Get cards assigned to a user
  server.registerTool(
    "card_get_assigned",
    {
      title: "Get Cards Assigned to User",
      description:
        "Retrieve cards assigned to a specific user. Supports extensive filtering by project, board, list, sprint, dates, priority, statuses, and tags.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        user_id: z.string().describe("User ID to get assigned cards for"),
        project_id: z.string().optional().describe("Filter by project/space ID"),
        board_id: z.string().optional().describe("Filter by board ID"),
        list_id: z.string().optional().describe("Filter by list ID"),
        sprint_id: z.string().optional().describe("Filter by sprint ID"),
        parent_card_id: z.string().optional().describe("Filter by parent card ID"),
        archived: z.boolean().optional().describe("Filter by archived status"),
        bookmarked: z.boolean().optional().describe("Filter by bookmarked status"),
        start_date_min: z.number().optional().describe("Minimum start date (Unix timestamp)"),
        start_date_max: z.number().optional().describe("Maximum start date (Unix timestamp)"),
        due_date_min: z.number().optional().describe("Minimum due date (Unix timestamp)"),
        due_date_max: z.number().optional().describe("Maximum due date (Unix timestamp)"),
        completed_date_min: z
          .number()
          .optional()
          .describe("Minimum completed date (Unix timestamp)"),
        completed_date_max: z
          .number()
          .optional()
          .describe("Maximum completed date (Unix timestamp)"),
        priority: z.number().optional().describe("Filter by priority level"),
        statuses: z
          .array(z.string())
          .optional()
          .describe('Filter by statuses (e.g., ["started", "completed"])'),
        tags: z.array(z.string()).optional().describe("Filter by tag names"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<GetAssignedCardsParams>({
        user_id: args.user_id,
        project_id: args.project_id,
        board_id: args.board_id,
        list_id: args.list_id,
        sprint_id: args.sprint_id,
        parent_card_id: args.parent_card_id,
        archived: args.archived,
        bookmarked: args.bookmarked,
        start_date_min: args.start_date_min,
        start_date_max: args.start_date_max,
        due_date_min: args.due_date_min,
        due_date_max: args.due_date_max,
        completed_date_min: args.completed_date_min,
        completed_date_max: args.completed_date_max,
        priority: args.priority,
        statuses: args.statuses,
        tags: args.tags,
      })

      return client.cards.getAssigned(args.workspace_id, params as GetAssignedCardsParams)
    })
  )

  // card_add_related - Link two cards with a relationship
  server.registerTool(
    "card_add_related",
    {
      title: "Add Related Card",
      description:
        'Link two cards with a relationship. Types: "blocks", "blocked_by", "related", "duplicates".',
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Source card ID"),
        related_card_id: z.string().describe("Related card ID to link"),
        relation_type: z
          .enum(["blocks", "blocked_by", "related", "duplicates"])
          .describe("Type of relationship between cards"),
      },
    },
    createToolHandler(async (client, args) => {
      const params: AddRelatedCardParams = {
        card_id: args.related_card_id,
        linked_card_type: args.relation_type,
      }

      return client.cards.addRelated(args.workspace_id, args.card_id, params)
    })
  )

  // card_remove_related - Remove a relationship between linked cards
  server.registerTool(
    "card_remove_related",
    {
      title: "Remove Related Card",
      description:
        "Remove a relationship between two linked cards. This removes the link but does not delete either card.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Source card ID"),
        linked_card_id: z.string().describe("Linked card ID to remove"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.cards.removeRelated(args.workspace_id, args.card_id, args.linked_card_id)
    })
  )

  // card_duplicate - Duplicate an existing card
  server.registerTool(
    "card_duplicate",
    {
      title: "Duplicate Card",
      description:
        "Clone an existing card with all its properties, checklists, and metadata. The new card will be created in the same list as the original.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to duplicate"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.cards.duplicate(args.workspace_id, args.card_id)
    })
  )

  // card_delete - Permanently delete a card
  server.registerTool(
    "card_delete",
    {
      title: "Delete Card",
      description:
        "Permanently delete a card. This action cannot be undone. Consider archiving instead for soft deletion.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to delete"),
      },
    },
    createToolHandler(async (client, args) => {
      return client.cards.delete(args.workspace_id, args.card_id)
    })
  )

  // card_get_tags - Get tags for workspace or project
  server.registerTool(
    "card_get_tags",
    {
      title: "Get Tags",
      description:
        "Retrieve tags for a workspace or project (optionally). Returns a list of tags with their metadata including name, color, and card counts.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        project_id: z.string().optional().describe("Project/Space ID to filter tags by project"),
        all: z.boolean().optional().describe("Return all tags in workspace"),
      },
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<{ project_id?: string; all?: boolean }>({
        project_id: args.project_id,
        all: args.all,
      })

      return client.cards.getTags(
        args.workspace_id,
        Object.keys(params).length > 0 ? params : undefined
      )
    })
  )

  // card_add_tags - Add tags to a card
  server.registerTool(
    "card_add_tags",
    {
      title: "Add Tags to Card",
      description:
        "Add one or more tags to a card. Provide either a single tag ID (id) or multiple tag IDs (ids).",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to add tags to"),
        id: z.string().optional().describe("Single tag ID to add"),
        ids: z.array(z.string()).optional().describe("Array of tag IDs to add"),
      },
    },
    createToolHandler(
      async (
        client,
        args: { workspace_id: string; card_id: string; id?: string; ids?: string[] }
      ) => {
        const params = buildParams<AddTagsToCardParams>({
          id: args.id,
          ids: args.ids,
        })

        return client.cards.addTags(args.workspace_id, args.card_id, params as AddTagsToCardParams)
      }
    )
  )

  // card_remove_tag - Remove a tag from a card
  server.registerTool(
    "card_remove_tag",
    {
      title: "Remove Tag from Card",
      description: "Remove a specific tag from a card.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to remove tag from"),
        tag_id: z.string().describe("Tag ID to remove"),
      },
    },
    createToolHandler(
      async (client, args: { workspace_id: string; card_id: string; tag_id: string }) => {
        return client.cards.removeTag(args.workspace_id, args.card_id, args.tag_id)
      }
    )
  )

  // card_add_member - Add member to card
  server.registerTool(
    "card_add_member",
    {
      title: "Add Member to Card",
      description:
        "Add a member to a card. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to add member to"),
        user_id: z.string().describe("User ID to add as member"),
        role: z.string().optional().describe("Member role (defaults to 'member')"),
      },
    },
    createToolHandler(
      async (
        client,
        args: { workspace_id: string; card_id: string; user_id: string; role?: string }
      ) => {
        return client.cards.addMember(
          args.workspace_id,
          args.card_id,
          args.user_id,
          args.role || "member"
        )
      }
    )
  )

  // card_remove_member - Remove member from card
  server.registerTool(
    "card_remove_member",
    {
      title: "Remove Member from Card",
      description:
        "Remove a member from a card. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to remove member from"),
        user_id: z.string().describe("User ID to remove"),
      },
    },
    createToolHandler(
      async (client, args: { workspace_id: string; card_id: string; user_id: string }) => {
        return client.cards.removeMember(args.workspace_id, args.card_id, args.user_id)
      }
    )
  )

  // card_create_checklist - Create checklist on card
  server.registerTool(
    "card_create_checklist",
    {
      title: "Create Checklist on Card",
      description:
        "Create a new checklist on a card. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID to add checklist to"),
        title: z.string().describe("Checklist title"),
      },
    },
    createToolHandler(
      async (client, args: { workspace_id: string; card_id: string; title: string }) => {
        return client.cards.createChecklist(args.workspace_id, args.card_id, args.title)
      }
    )
  )

  // card_add_checklist_item - Add item to checklist
  server.registerTool(
    "card_add_checklist_item",
    {
      title: "Add Item to Checklist",
      description:
        "Add an item to a card's checklist. Item title can include HTML formatting. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID to add item to"),
        title: z.string().describe("Item title (can include HTML like '<p>text</p>')"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          card_id: string
          checklist_id: string
          title: string
        }
      ) => {
        return client.cards.addChecklistItem(
          args.workspace_id,
          args.card_id,
          args.checklist_id,
          args.title
        )
      }
    )
  )

  // card_update_checklist_item - Update checklist item
  server.registerTool(
    "card_update_checklist_item",
    {
      title: "Update Checklist Item",
      description:
        "Update a checklist item's checked status or title. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID containing the item"),
        item_id: z.string().describe("Item ID to update"),
        checked: z.boolean().optional().describe("Check/uncheck the item"),
        title: z.string().optional().describe("Update item title (can include HTML)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          card_id: string
          checklist_id: string
          item_id: string
          checked?: boolean
          title?: string
        }
      ) => {
        const updates = buildParams<{ checked?: boolean; title?: string }>({
          checked: args.checked,
          title: args.title,
        })

        return client.cards.updateChecklistItem(
          args.workspace_id,
          args.card_id,
          args.checklist_id,
          args.item_id,
          updates
        )
      }
    )
  )

  // card_delete_checklist_item - Delete checklist item
  server.registerTool(
    "card_delete_checklist_item",
    {
      title: "Delete Checklist Item",
      description:
        "Permanently delete a checklist item. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID containing the item"),
        item_id: z.string().describe("Item ID to delete"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          card_id: string
          checklist_id: string
          item_id: string
        }
      ) => {
        return client.cards.deleteChecklistItem(
          args.workspace_id,
          args.card_id,
          args.checklist_id,
          args.item_id
        )
      }
    )
  )

  // card_update_checklist - Update checklist title
  server.registerTool(
    "card_update_checklist",
    {
      title: "Update Checklist",
      description:
        "Update a checklist's title. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID to update"),
        title: z.string().describe("New checklist title"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          card_id: string
          checklist_id: string
          title: string
        }
      ) => {
        return client.cards.updateChecklist(
          args.workspace_id,
          args.card_id,
          args.checklist_id,
          args.title
        )
      }
    )
  )

  // card_delete_checklist - Delete checklist
  server.registerTool(
    "card_delete_checklist",
    {
      title: "Delete Checklist",
      description:
        "Permanently delete an entire checklist from a card. ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API and may change without notice.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID to delete"),
      },
    },
    createToolHandler(
      async (client, args: { workspace_id: string; card_id: string; checklist_id: string }) => {
        return client.cards.deleteChecklist(args.workspace_id, args.card_id, args.checklist_id)
      }
    )
  )
}
