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

export class CardResource {
  constructor(private client: SuperThreadClient) {}

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
