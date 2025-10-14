/**
 * @fileoverview Card resource for Superthread API.
 * Provides card operations.
 */

import type { SuperthreadClient } from "./client.js"

/**
 * Card information from Superthread API
 */
export interface Card {
  id: string
  type: string
  team_id: string
  title: string
  content?: string
  status?: string
  priority?: number
  board_id?: string
  board_title?: string
  list_id?: string
  list_color?: string
  list_title?: string
  project_id?: string
  user_id: string
  user_id_updated?: string
  start_date?: number
  due_date?: number
  completed_date?: number
  time_created: number
  time_updated: number
  // Complex nested fields kept as unknown
  icon?: unknown
  collaboration?: unknown
  user?: unknown
  user_updated?: unknown
  members?: unknown[]
  checklists?: unknown[]
  checklist_order?: unknown
  checklist_item_order?: unknown
  parent_card?: unknown
  child_cards?: unknown[]
  child_card_order?: unknown
  linked_cards?: unknown[]
  archived?: unknown
  archived_list?: boolean
  archived_board?: boolean
  tags?: unknown[]
  external_links?: unknown[]
  hints?: unknown[]
  epic?: unknown
  cover_image?: unknown
  total_comments?: number
  total_files?: number
  is_watching?: boolean
  is_bookmarked?: boolean
  estimate?: number
}

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
 * Tag information from Superthread API
 */
export interface Tag {
  id: string
  team_id: string
  project_id?: string
  name: string
  slug: string
  color: string
  total_cards: number
}

/**
 * Parameters for retrieving tags
 */
export interface GetTagsParams {
  project_id?: string
  all?: boolean
}

/**
 * Response from get tags endpoint
 */
export interface GetTagsResponse {
  cursor: string
  count: number
  tags: Tag[]
}

/**
 * Parameters for adding tags to a card
 * Either id or ids must be specified
 */
export interface AddTagsToCardParams {
  id?: string
  ids?: string[]
}

/**
 * Checklist item from Superthread API
 */
export interface ChecklistItem {
  id: string
  checklist_id: string
  title: string
  content?: string
  user_id: string
  time_created: number
  time_updated: number
  checked: boolean
}

/**
 * Checklist from Superthread API
 */
export interface Checklist {
  id: string
  card_id: string
  title: string
  content?: string
  user_id: string
  time_created: number
  time_updated: number
  items?: ChecklistItem[]
}

/**
 * Response from creating a checklist
 */
export interface CreateChecklistResponse {
  checklist: Checklist
}

/**
 * Response from adding a checklist item
 */
export interface AddChecklistItemResponse {
  checklist_item: ChecklistItem
}

/**
 * Response from updating a checklist item
 */
export interface UpdateChecklistItemResponse {
  checklist_item: ChecklistItem
}

export class CardResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new card.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Card creation parameters
   * @returns Created card details
   */
  async create(workspaceId: string, params: CreateCardParams): Promise<Card> {
    // Validate required fields
    if (!params.board_id && !params.sprint_id) {
      throw new Error("Either board_id or sprint_id must be provided")
    }

    const response = await this.client.request<{ card: Card }>(`/${workspaceId}/cards`, {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.card
  }

  /**
   * Updates an existing card.
   * Note: If archived=true/false, only archiving is processed and other changes are ignored.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to update
   * @param params - Card update parameters (only specified fields will be updated)
   * @returns Updated card details
   */
  async update(workspaceId: string, cardId: string, params: UpdateCardParams): Promise<Card> {
    const response = await this.client.request<{ card: Card }>(`/${workspaceId}/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
    return response.card
  }

  /**
   * Gets a specific card with full details.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID
   * @returns Card details including checklists, tags, links, and relationships
   */
  async get(workspaceId: string, cardId: string): Promise<Card> {
    const response = await this.client.request<{ card: Card }>(`/${workspaceId}/cards/${cardId}`, {
      method: "GET",
    })
    return response.card
  }

  /**
   * Gets cards assigned to a user with optional filtering.
   * Uses the views/preview API endpoint with card filtering.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Filter parameters (user_id required, others optional)
   * @returns List of cards assigned to the user
   */
  async getAssigned(workspaceId: string, params: GetAssignedCardsParams): Promise<Card[]> {
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

    const response = await this.client.request<{ cards: Card[] }>(`/${workspaceId}/views/preview`, {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
    return response.cards || []
  }

  /**
   * Links two cards with a relationship.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Source card ID
   * @param params - Linked card parameters (card_id and linked_card_type)
   * @returns Linked card details
   */
  async addRelated(
    workspaceId: string,
    cardId: string,
    params: AddRelatedCardParams
  ): Promise<{ linked_card: Card }> {
    const response = await this.client.request<{ linked_card: Card }>(
      `/${workspaceId}/cards/${cardId}/linked_cards`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    )
    return response
  }

  /**
   * Removes a relationship between two linked cards.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Source card ID
   * @param linkedCardId - Linked card ID to remove
   * @returns Success response
   */
  async removeRelated(
    workspaceId: string,
    cardId: string,
    linkedCardId: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}/linked_cards/${linkedCardId}`,
      {
        method: "DELETE",
      }
    )
    return response
  }

  /**
   * Duplicates an existing card.
   * If params are not provided, automatically duplicates to the same location.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to duplicate
   * @param params - Optional parameters for where to duplicate the card
   * @returns The newly created duplicate card
   */
  async duplicate(
    workspaceId: string,
    cardId: string,
    params?: DuplicateCardParams
  ): Promise<Card> {
    let body = params || {}

    // If no params provided, get the card details to duplicate to same location
    if (!params || !params.project_id) {
      const card = await this.get(workspaceId, cardId)
      body = {
        project_id: card.project_id || params?.project_id,
        board_id: params?.board_id || card.board_id,
        list_id: params?.list_id || card.list_id,
        ...params,
      }
    }

    const response = await this.client.request<{ card: Card }>(
      `/${workspaceId}/cards/${cardId}/copy`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    )
    return response.card
  }

  /**
   * Permanently deletes a card.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to delete
   * @returns Success response
   */
  async delete(workspaceId: string, cardId: string): Promise<{ success: boolean }> {
    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}`,
      {
        method: "DELETE",
      }
    )
    return response
  }

  /**
   * Retrieves tags for a workspace, optionally filtered by project.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Optional filter parameters
   * @returns Tags with cursor and count
   */
  async getTags(workspaceId: string, params?: GetTagsParams): Promise<GetTagsResponse> {
    // Build query string
    const queryParams = new URLSearchParams()
    if (params?.project_id) {
      queryParams.append("project_id", params.project_id)
    }
    if (params?.all !== undefined) {
      queryParams.append("all", String(params.all))
    }

    const queryString = queryParams.toString()
    const path = `/${workspaceId}/tags${queryString ? `?${queryString}` : ""}`

    const response = await this.client.request<GetTagsResponse>(path, {
      method: "GET",
    })
    return response
  }

  /**
   * Adds one or more tags to a card.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to add tags to
   * @param params - Tag parameters (either id or ids must be specified)
   * @returns Success response (204 No Content)
   */
  async addTags(
    workspaceId: string,
    cardId: string,
    params: AddTagsToCardParams
  ): Promise<{ success: boolean }> {
    // Validate that at least one of id or ids is provided
    if (!params.id && !params.ids) {
      throw new Error("Either 'id' or 'ids' must be specified")
    }

    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}/tags`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    )
    return response
  }

  /**
   * Removes a tag from a card.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to remove tag from
   * @param tagId - Tag ID to remove
   * @returns Success response (204 No Content)
   */
  async removeTag(
    workspaceId: string,
    cardId: string,
    tagId: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}/tags/${tagId}`,
      {
        method: "DELETE",
      }
    )
    return response
  }

  /**
   * Adds a member to a card.
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to add member to
   * @param userId - User ID to add as member
   * @param role - Member role (defaults to "member")
   * @returns Success response
   */
  async addMember(
    workspaceId: string,
    cardId: string,
    userId: string,
    role: string = "member"
  ): Promise<{ success: boolean }> {
    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}/members`,
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, role }),
      }
    )
    return response
  }

  /**
   * Removes a member from a card.
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to remove member from
   * @param userId - User ID to remove
   * @returns Success response
   */
  async removeMember(
    workspaceId: string,
    cardId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}/members/${userId}`,
      {
        method: "DELETE",
      }
    )
    return response
  }

  /**
   * Creates a new checklist on a card.
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID to add checklist to
   * @param title - Checklist title
   * @returns Checklist creation response
   */
  async createChecklist(
    workspaceId: string,
    cardId: string,
    title: string
  ): Promise<CreateChecklistResponse> {
    const response = await this.client.request<CreateChecklistResponse>(
      `/${workspaceId}/cards/${cardId}/checklists`,
      {
        method: "POST",
        body: JSON.stringify({ title }),
      }
    )
    return response
  }

  /**
   * Adds an item to a checklist.
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID to add item to
   * @param title - Item title (can include HTML like "<p>text</p>")
   * @returns Checklist item creation response
   */
  async addChecklistItem(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    title: string
  ): Promise<AddChecklistItemResponse> {
    const response = await this.client.request<AddChecklistItemResponse>(
      `/${workspaceId}/cards/${cardId}/checklists/${checklistId}/items`,
      {
        method: "POST",
        body: JSON.stringify({
          title,
          checklist_id: checklistId, // Required in body per API observation
        }),
      }
    )
    return response
  }

  /**
   * Updates a checklist item (e.g., to check/uncheck it or update title).
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID containing the item
   * @param itemId - Item ID to update
   * @param updates - Fields to update (e.g., {checked: true} or {title: "..."})
   * @returns Checklist item update response
   */
  async updateChecklistItem(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    itemId: string,
    updates: { checked?: boolean; title?: string }
  ): Promise<UpdateChecklistItemResponse> {
    const response = await this.client.request<UpdateChecklistItemResponse>(
      `/${workspaceId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      }
    )
    return response
  }

  /**
   * Deletes a checklist item.
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID containing the item
   * @param itemId - Item ID to delete
   * @returns Success response
   */
  async deleteChecklistItem(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    itemId: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}`,
      {
        method: "DELETE",
      }
    )
    return response
  }

  /**
   * Updates a checklist (e.g., to change its title).
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID to update
   * @param title - New checklist title
   * @returns Checklist update response
   */
  async updateChecklist(
    workspaceId: string,
    cardId: string,
    checklistId: string,
    title: string
  ): Promise<{ checklist: Checklist }> {
    const response = await this.client.request<{ checklist: Checklist }>(
      `/${workspaceId}/cards/${cardId}/checklists/${checklistId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          card_id: cardId,
          title,
        }),
      }
    )
    return response
  }

  /**
   * Deletes an entire checklist from a card.
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID containing the checklist
   * @param checklistId - Checklist ID to delete
   * @returns Success response
   */
  async deleteChecklist(
    workspaceId: string,
    cardId: string,
    checklistId: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.request<{ success: boolean }>(
      `/${workspaceId}/cards/${cardId}/checklists/${checklistId}`,
      {
        method: "DELETE",
      }
    )
    return response
  }
}
