/**
 * @fileoverview Board resource for SuperThread API.
 * Provides board and kanban operations.
 */

import type { SuperThreadClient } from "./client.js"

/**
 * Board information from SuperThread API
 */
export interface Board {
  id: string
  team_id: string
  title: string
  description?: string
  project_id?: string
  icon?: {
    type: string
    src?: string
    emoji?: string
    color?: string
  }
  user_id: string
  time_created: number
  time_updated: number
  lists?: Array<{
    id: string
    title: string
    behavior: string
    color: string
    card_order?: string[]
    cards?: unknown[]
  }>
  list_order?: string[]
}

export class BoardResource {
  constructor(private client: SuperThreadClient) {}

  /**
   * Gets all boards in a workspace.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param options - Optional filters (project_id, bookmarked, or archived)
   * @returns List of boards
   */
  async list(
    workspaceId: string,
    options?: { project_id?: string; bookmarked?: boolean; archived?: boolean }
  ): Promise<Board[]> {
    const params = new URLSearchParams()

    // API requires at least one of: project_id, bookmarked, or archived
    if (options?.project_id) {
      params.append("project_id", options.project_id)
    }
    if (options?.bookmarked !== undefined) {
      params.append("bookmarked", String(options.bookmarked))
    }
    if (options?.archived !== undefined) {
      params.append("archived", String(options.archived))
    }

    const response = await this.client.request<{ boards: Board[] }>(
      `/${workspaceId}/boards?${params.toString()}`,
      {
        method: "GET",
      }
    )
    return response.boards || []
  }

  /**
   * Gets a specific board with full details including lists and cards.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID
   * @returns Board details with lists and cards
   */
  async get(workspaceId: string, boardId: string): Promise<Board> {
    const response = await this.client.request<{ board: Board }>(
      `/${workspaceId}/boards/${boardId}`,
      {
        method: "GET",
      }
    )
    return response.board
  }
}
