/**
 * @fileoverview Card resource for Superthread API.
 * Provides card operations.
 */

import urlcat from "urlcat"
import { safeId } from "../utils.js"
import type { SuperthreadClient } from "./client.js"

/**
 * Parameters for creating a new card
 */
export interface CreateCardParams {
  title: string
  list_id: string
  board_id?: string
  sprint_id?: string
  content?: string
  project_id?: string
  start_date?: number
  due_date?: number
  priority?: number
  estimate?: number
  parent_card_id?: string
  epic_id?: string
  owner_id?: string
  members?: Array<{
    user_id: string
    role?: string
  }>
}

/**
 * Parameters for updating an existing card
 * All fields are optional - only specified fields will be updated
 *
 * Note: Content cannot be updated via PATCH endpoint. The official API docs
 * do not list 'content' as an updatable field, and testing confirms it doesn't work.
 * Content editing likely requires the WebSocket-based collaboration API.
 * (Some community implementations include 'content' but it has no effect)
 */
export interface UpdateCardParams {
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
  cover_image?: {
    type: string
    src?: string
    blurhash?: string
    color?: string
    emoji?: string
    positionY?: number
    object_fit?: string
  }
}

/**
 * Parameters for getting cards assigned to a user
 * Supports extensive filtering options
 */
export interface GetAssignedCardsParams {
  user_id: string
  project_id?: string
  board_id?: string
  list_id?: string
  sprint_id?: string
  parent_card_id?: string
  archived?: boolean
  bookmarked?: boolean
  start_date_min?: number
  start_date_max?: number
  due_date_min?: number
  due_date_max?: number
  completed_date_min?: number
  completed_date_max?: number
  priority?: number
  statuses?: string[]
  tags?: string[]
}

/**
 * Parameters for adding a related card (linking cards)
 */
export interface AddRelatedCardParams {
  card_id: string
  linked_card_type: "blocks" | "blocked_by" | "related" | "duplicates"
}

/**
 * Parameters for duplicating a card
 * If not provided, the card will be duplicated to its current location
 */
export interface DuplicateCardParams {
  project_id?: string
  board_id?: string
  list_id?: string
  sprint_id?: string
  title?: string
}

/**
 * Parameters for retrieving tags
 */
export interface GetTagsParams {
  project_id?: string
  all?: boolean
}

/**
 * Parameters for adding tags to a card
 * Either id or ids must be specified
 */
export interface AddTagsToCardParams {
  id?: string
  ids?: string[]
}

export class CardResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new card.
   * API: POST /:workspace/cards
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Card creation parameters
   * @returns API response (passed through to LLM)
   */
  async create(workspaceId: string, params: CreateCardParams): Promise<unknown> {
    // Validate required fields
    if (!params.board_id && !params.sprint_id) {
      throw new Error("Either board_id or sprint_id must be provided")
    }

    const path = urlcat("/:workspace/cards", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing card.
   * Note: If archived=true/false, only archiving is processed and other changes are ignored.
   * API: PATCH /:workspace/cards/:card
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to update
   * @param params - Card update parameters (only specified fields will be updated)
   * @returns API response (passed through to LLM)
   */
  async update(workspaceId: string, cardId: string, params: UpdateCardParams): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Gets a specific card with full details.
   * API: GET /:workspace/cards/:card
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, cardId: string): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Gets cards assigned to a user with optional filtering.
   * Uses the views/preview API endpoint with card filtering.
   * API: POST /:workspace/views/preview
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Filter parameters (user_id required, others optional)
   * @returns API response (passed through to LLM)
   */
  async getAssigned(workspaceId: string, params: GetAssignedCardsParams): Promise<unknown> {
    // Build the views/preview request body
    const requestBody: {
      type: string
      card_filters: {
        is_archived?: boolean
        include?: {
          members: string[]
          boards?: string[]
          lists?: string[]
          projects?: string[]
          statuses?: string[]
          tags?: string[]
          priority?: number[]
          owners?: string[]
        }
        start_date?: { before?: string; after?: string }
        due_date?: { before?: string; after?: string }
        completed_date?: { before?: string; after?: string }
      }
    } = {
      type: "card",
      card_filters: {
        include: {
          members: [params.user_id],
        },
      },
    }

    // Add optional filters
    if (params.archived !== undefined) {
      requestBody.card_filters.is_archived = params.archived
    }
    if (params.board_id) {
      requestBody.card_filters.include!.boards = [params.board_id]
    }
    if (params.list_id) {
      requestBody.card_filters.include!.lists = [params.list_id]
    }
    if (params.project_id) {
      requestBody.card_filters.include!.projects = [params.project_id]
    }
    if (params.statuses) {
      requestBody.card_filters.include!.statuses = params.statuses
    }
    if (params.tags) {
      requestBody.card_filters.include!.tags = params.tags
    }
    if (params.priority !== undefined) {
      requestBody.card_filters.include!.priority = [params.priority]
    }

    const path = urlcat("/:workspace/views/preview", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
  }

  /**
   * Links two cards with a relationship.
   * API: POST /:workspace/cards/:card/linked_cards
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Source card ID
   * @param params - Linked card parameters (card_id and linked_card_type)
   * @returns API response (passed through to LLM)
   */
  async addRelated(
    workspaceId: string,
    cardId: string,
    params: AddRelatedCardParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/linked_cards", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Removes a relationship between two linked cards.
   * API: DELETE /:workspace/cards/:card/linked_cards/:linkedcard
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Source card ID
   * @param linkedCardId - Linked card ID to remove
   * @returns API response (passed through to LLM)
   */
  async removeRelated(workspaceId: string, cardId: string, linkedCardId: string): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/linked_cards/:linkedcard", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      linkedcard: safeId("linkedCardId", linkedCardId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Duplicates an existing card.
   * If params are not provided, automatically duplicates to the same location.
   * API: POST /:workspace/cards/:card/copy
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to duplicate
   * @param params - Optional parameters for where to duplicate the card
   * @returns API response (passed through to LLM)
   */
  async duplicate(
    workspaceId: string,
    cardId: string,
    params?: DuplicateCardParams
  ): Promise<unknown> {
    let body = params || {}

    // If no params provided, get the card details to duplicate to same location
    if (!params || !params.project_id) {
      const cardResponse = await this.get(workspaceId, cardId)
      type CardData = {
        project_id?: string
        board_id?: string
        list_id?: string
        card?: { project_id?: string; board_id?: string; list_id?: string }
      }
      const cardData = cardResponse as CardData
      const card = cardData.card || cardData
      body = {
        project_id: card.project_id || params?.project_id,
        board_id: params?.board_id || card.board_id,
        list_id: params?.list_id || card.list_id,
        ...params,
      }
    }

    const path = urlcat("/:workspace/cards/:card/copy", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  /**
   * Permanently deletes a card.
   * API: DELETE /:workspace/cards/:card
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to delete
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, cardId: string): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Retrieves tags for a workspace, optionally filtered by project.
   * API: GET /:workspace/tags
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Optional filter parameters
   * @returns API response (passed through to LLM)
   */
  async getTags(workspaceId: string, params?: GetTagsParams): Promise<unknown> {
    // Build query string
    const queryParams = new URLSearchParams()
    if (params?.project_id) {
      queryParams.append("project_id", params.project_id)
    }
    if (params?.all !== undefined) {
      queryParams.append("all", String(params.all))
    }

    const queryString = queryParams.toString()
    const path =
      urlcat("/:workspace/tags", {
        workspace: safeId("workspaceId", workspaceId),
      }) + (queryString ? `?${queryString}` : "")

    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Adds one or more tags to a card.
   * API: POST /:workspace/cards/:card/tags
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to add tags to
   * @param params - Tag parameters (either id or ids must be specified)
   * @returns API response (passed through to LLM)
   */
  async addTags(
    workspaceId: string,
    cardId: string,
    params: AddTagsToCardParams
  ): Promise<unknown> {
    // Validate that at least one of id or ids is provided
    if (!params.id && !params.ids) {
      throw new Error("Either 'id' or 'ids' must be specified")
    }

    const path = urlcat("/:workspace/cards/:card/tags", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Removes a tag from a card.
   * API: DELETE /:workspace/cards/:card/tags/:tag
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to remove tag from
   * @param tagId - Tag ID to remove
   * @returns API response (passed through to LLM)
   */
  async removeTag(workspaceId: string, cardId: string, tagId: string): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/tags/:tag", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      tag: safeId("tagId", tagId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Adds a member to a card.
   * API: POST /:workspace/cards/:card/members
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to add member to
   * @param userId - User ID to add as member
   * @param role - Member role (defaults to "member")
   * @returns API response (passed through to LLM)
   */
  async addMember(
    workspaceId: string,
    cardId: string,
    userId: string,
    role: string = "member"
  ): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/members", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, role }),
    })
  }

  /**
   * Removes a member from a card.
   * API: DELETE /:workspace/cards/:card/members/:user
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to remove member from
   * @param userId - User ID to remove
   * @returns API response (passed through to LLM)
   */
  async removeMember(workspaceId: string, cardId: string, userId: string): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/members/:user", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      user: safeId("userId", userId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Creates a new checklist on a card.
   * API: POST /:workspace/cards/:card/checklists
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to add checklist to
   * @param title - Checklist title
   * @returns API response (passed through to LLM)
   */
  async createChecklist(workspaceId: string, cardId: string, title: string): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/checklists", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify({ title }),
    })
  }

  /**
   * Adds an item to a checklist.
   * API: POST /:workspace/cards/:card/checklists/:checklist/items
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID to add item to
   * @param title - Item title (can include HTML like "<p>text</p>")
   * @param checked - Optional: Create item as checked (default: false)
   * @returns API response (passed through to LLM)
   */
  async addChecklistItem(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    title: string,
    checked?: boolean
  ): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/checklists/:checklist/items", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      checklist: safeId("checklistId", checklistId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify({
        title,
        checklist_id: checklistId, // Required in body per API observation
        ...(checked !== undefined && { checked }),
      }),
    })
  }

  /**
   * Updates a checklist item (e.g., to check/uncheck it or update title).
   * API: PATCH /:workspace/cards/:card/checklists/:checklist/items/:item
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID containing the item
   * @param itemId - Item ID to update
   * @param updates - Fields to update (e.g., {checked: true} or {title: "..."})
   * @returns API response (passed through to LLM)
   */
  async updateChecklistItem(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    itemId: string,
    updates: { checked?: boolean; title?: string }
  ): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/checklists/:checklist/items/:item", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      checklist: safeId("checklistId", checklistId),
      item: safeId("itemId", itemId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  /**
   * Deletes a checklist item.
   * API: DELETE /:workspace/cards/:card/checklists/:checklist/items/:item
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID containing the item
   * @param itemId - Item ID to delete
   * @returns API response (passed through to LLM)
   */
  async deleteChecklistItem(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    itemId: string
  ): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/checklists/:checklist/items/:item", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      checklist: safeId("checklistId", checklistId),
      item: safeId("itemId", itemId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Updates a checklist (e.g., to change its title).
   * API: PATCH /:workspace/cards/:card/checklists/:checklist
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to containing the checklist
   * @param checklistId - Checklist ID to update
   * @param title - New checklist title
   * @returns API response (passed through to LLM)
   */
  async updateChecklist(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    title: string
  ): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/checklists/:checklist", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      checklist: safeId("checklistId", checklistId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify({
        card_id: cardId,
        title,
      }),
    })
  }

  /**
   * Deletes an entire checklist from a card.
   * API: DELETE /:workspace/cards/:card/checklists/:checklist
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID to delete
   * @returns API response (passed through to LLM)
   */
  async deleteChecklist(
    workspaceId: string,
    cardId: string,
    checklistId: string
  ): Promise<unknown> {
    const path = urlcat("/:workspace/cards/:card/checklists/:checklist", {
      workspace: safeId("workspaceId", workspaceId),
      card: safeId("cardId", cardId),
      checklist: safeId("checklistId", checklistId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
