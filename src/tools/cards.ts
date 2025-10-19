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
import { formatMentions, shouldPositionAtTop, getListTitle } from "../utils.js"
import { config } from "../config.js"

/**
 * Registers card management tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerCardTools(server: McpServer) {
  // ============================================================================
  // TOOL: card_create
  // Create one or more cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_create",
    {
      title: "Create Cards",
      description:
        "Create one or more cards in a single operation. Each card is fully self-contained with all parameters. Always use an array, even for a single card.\n\nIMPORTANT LINKING RULES:\n- Use 'parent_card_id' to create parent-child relationships in your card hierarchy\n- Use 'epic_id' ONLY to link top-level cards to Roadmap Projects (epics)\n- Epic inheritance flows automatically from parent to child\n\nHIERARCHY CREATION:\n- Create top-level cards: Set parent_card_id=null (or omit), epic_id=Roadmap Project ID\n- Create child cards: Set parent_card_id=Parent Card ID, epic_id=null (or omit, will inherit from parent)\n- Epic inheritance flows automatically from parent to child\n\nCARDS ARE PROCESSED SEQUENTIALLY: This is critical for parent-child relationships. Parent cards must be created before their children can reference them.",
      inputSchema: {
        cards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              title: z.string().describe("Card title"),
              list_id: z.string().describe("List ID where the card will be placed"),
              board_id: z
                .string()
                .optional()
                .describe("Board ID (required if sprint_id not provided)"),
              sprint_id: z
                .string()
                .optional()
                .describe("Sprint ID (required if board_id not provided)"),
              content: z
                .string()
                .optional()
                .describe("Card content (HTML supported, max 102400 chars)"),
              project_id: z.string().optional().describe("Project/Space ID"),
              start_date: z.number().optional().describe("Start date as Unix timestamp in seconds"),
              due_date: z.number().optional().describe("Due date as Unix timestamp in seconds"),
              position: z.number().optional().describe("Card position in list (0 = top)"),
              priority: z.number().optional().describe("Priority level"),
              estimate: z.number().optional().describe("Time estimate"),
              parent_card_id: z
                .string()
                .optional()
                .describe(
                  "Parent card ID for creating parent-child relationships in the hierarchy. Top-level cards: omit or set to null. Child cards: set to parent card ID. Epic inheritance flows from parent to child."
                ),
              epic_id: z
                .string()
                .optional()
                .describe(
                  "Epic/Roadmap Project ID. ONLY use for linking top-level cards to Roadmap Projects. Most cards inherit epic from their parent automatically. Only set this when creating top-level cards. Leave null (or omit) for child cards - they inherit from parent."
                ),
              owner_id: z.string().optional().describe("Card owner user ID"),
            })
          )
          .describe("Array of cards to create (use single-element array for one card)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          cards: Array<{
            workspace_id: string
            title: string
            list_id: string
            board_id?: string
            sprint_id?: string
            content?: string
            project_id?: string
            start_date?: number
            due_date?: number
            position?: number
            priority?: number
            estimate?: number
            parent_card_id?: string
            epic_id?: string
            owner_id?: string
          }>
        }
      ) => {
        // Process cards sequentially (critical for parent-child relationships)
        const results = []
        for (const cardData of args.cards) {
          // SMART POSITIONING IMPLEMENTATION:
          // SuperThread API does NOT support 'position' during card creation, only during update.
          // Therefore we: 1) Create card (goes to bottom), 2) Immediately update with position.
          // This creates a small race condition window (unavoidable due to API limitation).
          // Performance: Skips list title fetch when feature is not configured.

          let listTitle: string | undefined
          if (config.listsAddToTop.length > 0) {
            listTitle = await getListTitle(client, cardData.workspace_id, cardData.list_id, {
              board_id: cardData.board_id,
              sprint_id: cardData.sprint_id,
              project_id: cardData.project_id,
            })
          }

          const position = shouldPositionAtTop(listTitle, cardData.position)

          const params = buildParams<CreateCardParams>({
            title: cardData.title,
            list_id: cardData.list_id,
            board_id: cardData.board_id,
            sprint_id: cardData.sprint_id,
            content: cardData.content,
            project_id: cardData.project_id,
            start_date: cardData.start_date,
            due_date: cardData.due_date,
            priority: cardData.priority,
            estimate: cardData.estimate,
            parent_card_id: cardData.parent_card_id,
            epic_id: cardData.epic_id,
            owner_id: cardData.owner_id,
          })

          const result = (await client.cards.create(
            cardData.workspace_id,
            params as CreateCardParams
          )) as {
            card: { id: string }
          }

          if (position !== undefined) {
            await client.cards.update(cardData.workspace_id, result.card.id, { position })
          }

          results.push(result)
        }

        return { cards: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_update
  // Update multiple cards' attributes (batch operation)
  // ============================================================================
  server.registerTool(
    "card_update",
    {
      title: "Update Cards",
      description:
        "Update one or more cards' attributes in a single operation. Each card is fully self-contained with all parameters. Always use an array, even for a single card. Only specified fields will be updated, others remain unchanged. Note: If archived=true/false, only archiving is processed and other changes are ignored. Content cannot be updated via this endpoint.\n\nLINKING GUIDANCE:\n- 'parent_card_id': Changes the card's parent in the hierarchy (not available in update, must use card creation)\n- 'epic_id': Links to a Roadmap Project (epic). Most cards inherit epic from parent automatically - only use this for top-level cards or to explicitly change the epic relationship.",
      inputSchema: {
        cards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to update"),
              title: z.string().optional().describe("New card title"),
              board_id: z.string().optional().describe("Move card to different board"),
              list_id: z.string().optional().describe("Move card to different list"),
              project_id: z.string().optional().describe("Change project/space association"),
              epic_id: z
                .string()
                .optional()
                .describe(
                  "Change epic/roadmap project association. Use with caution - most cards should inherit epic from their parent. Only use this to explicitly change the epic relationship for top-level cards."
                ),
              sprint_id: z.string().optional().describe("Change sprint association"),
              owner_id: z.string().optional().describe("Change card owner"),
              start_date: z
                .number()
                .optional()
                .describe("Update start date (Unix timestamp in seconds)"),
              due_date: z
                .number()
                .optional()
                .describe("Update due date (Unix timestamp in seconds)"),
              position: z.number().optional().describe("Change card position in list"),
              priority: z.number().optional().describe("Update priority level"),
              estimate: z.number().optional().describe("Update time estimate"),
              archived: z
                .boolean()
                .optional()
                .describe("Archive (true) or unarchive (false) the card"),
            })
          )
          .describe("Array of cards to update (use single-element array for one card)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          cards: Array<{
            workspace_id: string
            card_id: string
            title?: string
            board_id?: string
            list_id?: string
            project_id?: string
            epic_id?: string
            sprint_id?: string
            owner_id?: string
            start_date?: number
            due_date?: number
            position?: number
            priority?: number
            estimate?: number
            archived?: boolean
          }>
        }
      ) => {
        // Process updates sequentially
        const results = []
        for (const cardData of args.cards) {
          // Skip fetch if smart positioning is not configured (performance optimization)
          let listTitle: string | undefined
          if (cardData.list_id && config.listsAddToTop.length > 0) {
            listTitle = await getListTitle(client, cardData.workspace_id, cardData.list_id, {
              board_id: cardData.board_id,
              sprint_id: cardData.sprint_id,
              project_id: cardData.project_id,
              card_id: cardData.card_id,
            })
          }

          const position = shouldPositionAtTop(listTitle, cardData.position)

          const params = buildParams<UpdateCardParams>({
            title: cardData.title,
            board_id: cardData.board_id,
            list_id: cardData.list_id,
            project_id: cardData.project_id,
            epic_id: cardData.epic_id,
            sprint_id: cardData.sprint_id,
            owner_id: cardData.owner_id,
            start_date: cardData.start_date,
            due_date: cardData.due_date,
            position,
            priority: cardData.priority,
            estimate: cardData.estimate,
            archived: cardData.archived,
          })

          const result = await client.cards.update(
            cardData.workspace_id,
            cardData.card_id,
            params as UpdateCardParams
          )
          results.push(result)
        }

        return { cards: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_get
  // Get detailed information about multiple cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_get",
    {
      title: "Get Cards",
      description:
        "Get detailed information about one or more cards in a single operation. Each card is fully self-contained with workspace_id and card_id. Always use an array, even for a single card.",
      inputSchema: {
        cards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to retrieve"),
            })
          )
          .describe("Array of cards to retrieve (use single-element array for one card)"),
      },
    },
    createToolHandler(
      async (client, args: { cards: Array<{ workspace_id: string; card_id: string }> }) => {
        // Retrieve cards sequentially
        const results = []
        for (const cardData of args.cards) {
          const result = await client.cards.get(cardData.workspace_id, cardData.card_id)
          results.push(result)
        }

        return { cards: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_get_assigned
  // Retrieve cards assigned to a specific user with filtering
  // ============================================================================
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

  // ============================================================================
  // TOOL: card_add_related
  // Create multiple card relationships (batch operation)
  // ============================================================================
  server.registerTool(
    "card_add_related",
    {
      title: "Add Related Cards",
      description:
        'Create one or more card relationships in a single operation. Types: "blocks", "blocked_by", "related", "duplicates". Always use an array, even for a single relation.',
      inputSchema: {
        relations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Source card ID"),
              related_card_id: z.string().describe("Related card ID to link"),
              relation_type: z
                .enum(["blocks", "blocked_by", "related", "duplicates"])
                .describe("Type of relationship between cards"),
            })
          )
          .describe(
            "Array of card relationships to create (use single-element array for one relation)"
          ),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          relations: Array<{
            workspace_id: string
            card_id: string
            related_card_id: string
            relation_type: "blocks" | "blocked_by" | "related" | "duplicates"
          }>
        }
      ) => {
        // Create relationships sequentially
        const results = []
        for (const rel of args.relations) {
          const params: AddRelatedCardParams = {
            card_id: rel.related_card_id,
            linked_card_type: rel.relation_type,
          }
          const result = await client.cards.addRelated(rel.workspace_id, rel.card_id, params)
          results.push(result)
        }

        return { relations: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_remove_related
  // Remove multiple card relationships (batch operation)
  // ============================================================================
  server.registerTool(
    "card_remove_related",
    {
      title: "Remove Related Cards",
      description:
        "Remove one or more card relationships in a single operation. This removes the links but does not delete any cards. Always use an array, even for a single relation.",
      inputSchema: {
        relations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Source card ID"),
              linked_card_id: z.string().describe("Linked card ID to remove"),
            })
          )
          .describe(
            "Array of card relationships to remove (use single-element array for one relation)"
          ),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          relations: Array<{
            workspace_id: string
            card_id: string
            linked_card_id: string
          }>
        }
      ) => {
        // Remove relationships sequentially
        const results = []
        for (const rel of args.relations) {
          const result = await client.cards.removeRelated(
            rel.workspace_id,
            rel.card_id,
            rel.linked_card_id
          )
          results.push(result)
        }

        return { removed: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_duplicate
  // Clone multiple existing cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_duplicate",
    {
      title: "Duplicate Cards",
      description:
        "Clone one or more existing cards with all their properties, checklists, and metadata in a single operation. New cards will be created in the same lists as the originals. Always use an array, even for a single card.",
      inputSchema: {
        cards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to duplicate"),
            })
          )
          .describe("Array of cards to duplicate (use single-element array for one card)"),
      },
    },
    createToolHandler(
      async (client, args: { cards: Array<{ workspace_id: string; card_id: string }> }) => {
        // Duplicate cards sequentially
        const results = []
        for (const cardData of args.cards) {
          const result = await client.cards.duplicate(cardData.workspace_id, cardData.card_id)
          results.push(result)
        }

        return { cards: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_delete
  // Permanently delete multiple cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_delete",
    {
      title: "Delete Cards",
      description:
        "Permanently delete one or more cards in a single operation. This action cannot be undone. Consider archiving instead for soft deletion. Always use an array, even for a single card.",
      inputSchema: {
        cards: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to delete"),
            })
          )
          .describe("Array of cards to delete (use single-element array for one card)"),
      },
    },
    createToolHandler(
      async (client, args: { cards: Array<{ workspace_id: string; card_id: string }> }) => {
        // Delete cards sequentially
        const results = []
        for (const cardData of args.cards) {
          const result = await client.cards.delete(cardData.workspace_id, cardData.card_id)
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_get_tags
  // Get all tags available in workspace or project
  // ============================================================================
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

  // ============================================================================
  // TOOL: card_add_tags
  // Add one or more existing tags to a card
  // ============================================================================
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

  // ============================================================================
  // TOOL: card_remove_tag
  // Remove tags from cards in a single operation
  // ============================================================================
  server.registerTool(
    "card_remove_tag",
    {
      title: "Remove Tags from Cards",
      description:
        "Remove one or more tags from cards in a single operation. Each operation is fully self-contained with all parameters. Always use an array, even for a single removal. Useful for bulk tag removal or removing multiple tags from one card.",
      inputSchema: {
        operations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to remove tag from"),
              tag_id: z.string().describe("Tag ID to remove"),
            })
          )
          .describe("Array of tag removals (use single-element array for one removal)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          operations: Array<{
            workspace_id: string
            card_id: string
            tag_id: string
          }>
        }
      ) => {
        // Process operations sequentially
        const results = []
        for (const operation of args.operations) {
          const result = await client.cards.removeTag(
            operation.workspace_id,
            operation.card_id,
            operation.tag_id
          )
          results.push(result)
        }

        return { removed: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_add_member
  // Assign members to cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_add_member",
    {
      title: "Add Members to Cards",
      description:
        "Add one or more members to cards in a single operation. Each operation is fully self-contained. Always use an array, even for a single member addition.",
      inputSchema: {
        operations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to add member to"),
              user_id: z.string().describe("User ID to add as member"),
              role: z.string().optional().describe("Member role (defaults to 'member')"),
            })
          )
          .describe("Array of member additions (use single-element array for one operation)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          operations: Array<{
            workspace_id: string
            card_id: string
            user_id: string
            role?: string
          }>
        }
      ) => {
        // Add members sequentially
        const results = []
        for (const op of args.operations) {
          const result = await client.cards.addMember(
            op.workspace_id,
            op.card_id,
            op.user_id,
            op.role || "member"
          )
          results.push(result)
        }

        return { added: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_remove_member
  // Remove member assignments from cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_remove_member",
    {
      title: "Remove Members from Cards",
      description:
        "Remove one or more members from cards in a single operation. Each operation is fully self-contained. Always use an array, even for a single member removal.",
      inputSchema: {
        operations: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to remove member from"),
              user_id: z.string().describe("User ID to remove"),
            })
          )
          .describe("Array of member removals (use single-element array for one operation)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          operations: Array<{
            workspace_id: string
            card_id: string
            user_id: string
          }>
        }
      ) => {
        // Remove members sequentially
        const results = []
        for (const op of args.operations) {
          const result = await client.cards.removeMember(op.workspace_id, op.card_id, op.user_id)
          results.push(result)
        }

        return { removed: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_create_checklist
  // Create checklists on cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_create_checklist",
    {
      title: "Create Checklists on Cards",
      description:
        "Create one or more checklists on cards in a single operation. Each checklist is fully self-contained. Always use an array, even for a single checklist.",
      inputSchema: {
        checklists: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID to add checklist to"),
              title: z.string().describe("Checklist title"),
            })
          )
          .describe("Array of checklists to create (use single-element array for one checklist)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          checklists: Array<{
            workspace_id: string
            card_id: string
            title: string
          }>
        }
      ) => {
        // Create checklists sequentially
        const results = []
        for (const checklist of args.checklists) {
          const result = await client.cards.createChecklist(
            checklist.workspace_id,
            checklist.card_id,
            checklist.title
          )
          results.push(result)
        }

        return { checklists: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_add_checklist_item
  // Add items to an existing checklist (batch operation)
  // ============================================================================
  server.registerTool(
    "card_add_checklist_item",
    {
      title: "Add Items to Checklist",
      description:
        "Add one or more items to a card's checklist. Item titles can include HTML formatting and support @mentions using {{@Username}} syntax. Always use an array, even for a single item.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID to add items to"),
        items: z
          .array(
            z.object({
              title: z
                .string()
                .describe(
                  "Item title (can include HTML like '<p>text</p>' and @mentions using {{@Username}} syntax)"
                ),
              checked: z.boolean().optional().describe("Create item as checked (default: false)"),
            })
          )
          .describe("Array of checklist items to add (use single-element array for one item)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          card_id: string
          checklist_id: string
          items: Array<{ title: string; checked?: boolean }>
        }
      ) => {
        // Process items sequentially
        const results = []
        for (const item of args.items) {
          // Process @mentions for this item
          const processedTitle = await formatMentions(item.title, args.workspace_id, client)

          // Call API for this item
          const result = await client.cards.addChecklistItem(
            args.workspace_id,
            args.card_id,
            args.checklist_id,
            processedTitle,
            item.checked
          )
          results.push(result)
        }

        return { items: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_update_checklist_item
  // Update multiple checklist items (batch operation)
  // ============================================================================
  server.registerTool(
    "card_update_checklist_item",
    {
      title: "Update Checklist Items",
      description:
        "Update one or more checklist items' checked status or titles in a single operation. Each item is fully self-contained with all parameters. Always use an array, even for a single item. Title supports HTML formatting and @mentions using {{@Username}} syntax.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID containing the items"),
        items: z
          .array(
            z.object({
              item_id: z.string().describe("Item ID to update"),
              checked: z.boolean().optional().describe("Check/uncheck the item"),
              title: z
                .string()
                .optional()
                .describe(
                  "Update item title (can include HTML and @mentions using {{@Username}} syntax)"
                ),
            })
          )
          .describe("Array of checklist items to update (use single-element array for one item)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          card_id: string
          checklist_id: string
          items: Array<{ item_id: string; checked?: boolean; title?: string }>
        }
      ) => {
        // Process items sequentially
        const results = []
        for (const item of args.items) {
          // Process @mentions in title if provided
          const processedTitle = item.title
            ? await formatMentions(item.title, args.workspace_id, client)
            : undefined

          const updates = buildParams<{ checked?: boolean; title?: string }>({
            checked: item.checked,
            title: processedTitle,
          })

          // Call API for this item
          const result = await client.cards.updateChecklistItem(
            args.workspace_id,
            args.card_id,
            args.checklist_id,
            item.item_id,
            updates
          )
          results.push(result)
        }

        return { items: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_delete_checklist_item
  // Delete checklist items permanently (batch operation)
  // ============================================================================
  server.registerTool(
    "card_delete_checklist_item",
    {
      title: "Delete Checklist Items",
      description:
        "Permanently delete one or more checklist items. Always use an array, even for a single item.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        card_id: z.string().describe("Card ID containing the checklist"),
        checklist_id: z.string().describe("Checklist ID containing the items"),
        item_ids: z.array(z.string()).describe("Array of item IDs to delete"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          workspace_id: string
          card_id: string
          checklist_id: string
          item_ids: string[]
        }
      ) => {
        // Process deletions sequentially
        const results = []
        for (const itemId of args.item_ids) {
          const result = await client.cards.deleteChecklistItem(
            args.workspace_id,
            args.card_id,
            args.checklist_id,
            itemId
          )
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_update_checklist
  // Update checklist titles (batch operation)
  // ============================================================================
  server.registerTool(
    "card_update_checklist",
    {
      title: "Update Checklists",
      description:
        "Update one or more checklist titles in a single operation. Each checklist is fully self-contained. Always use an array, even for a single checklist.",
      inputSchema: {
        checklists: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID containing the checklist"),
              checklist_id: z.string().describe("Checklist ID to update"),
              title: z.string().describe("New checklist title"),
            })
          )
          .describe("Array of checklists to update (use single-element array for one checklist)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          checklists: Array<{
            workspace_id: string
            card_id: string
            checklist_id: string
            title: string
          }>
        }
      ) => {
        // Update checklists sequentially
        const results = []
        for (const checklist of args.checklists) {
          const result = await client.cards.updateChecklist(
            checklist.workspace_id,
            checklist.card_id,
            checklist.checklist_id,
            checklist.title
          )
          results.push(result)
        }

        return { checklists: results }
      }
    )
  )

  // ============================================================================
  // TOOL: card_delete_checklist
  // Delete checklists from cards (batch operation)
  // ============================================================================
  server.registerTool(
    "card_delete_checklist",
    {
      title: "Delete Checklists",
      description:
        "Permanently delete one or more checklists from cards in a single operation. Always use an array, even for a single checklist.",
      inputSchema: {
        checklists: z
          .array(
            z.object({
              workspace_id: z.string().describe("Workspace ID"),
              card_id: z.string().describe("Card ID containing the checklist"),
              checklist_id: z.string().describe("Checklist ID to delete"),
            })
          )
          .describe("Array of checklists to delete (use single-element array for one checklist)"),
      },
    },
    createToolHandler(
      async (
        client,
        args: {
          checklists: Array<{
            workspace_id: string
            card_id: string
            checklist_id: string
          }>
        }
      ) => {
        // Delete checklists sequentially
        const results = []
        for (const checklist of args.checklists) {
          const result = await client.cards.deleteChecklist(
            checklist.workspace_id,
            checklist.card_id,
            checklist.checklist_id
          )
          results.push(result)
        }

        return { deleted: results }
      }
    )
  )
}
