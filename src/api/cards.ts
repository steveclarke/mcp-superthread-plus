/**
 * @fileoverview Card resource for SuperThread API.
 * Provides card operations.
 */

import type { SuperThreadClient } from "./client.js"

/**
 * Card information from SuperThread API
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

export class CardResource {
  constructor(private client: SuperThreadClient) {}

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
}
