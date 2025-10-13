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
}
