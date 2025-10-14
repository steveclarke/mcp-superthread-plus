/**
 * @fileoverview Board resource for Superthread API.
 * Provides board and kanban operations.
 */

import type { SuperthreadClient } from "./client.js"

/**
 * List information from Superthread API
 */
export interface List {
  id: string
  team_id: string
  title: string
  content?: string
  behavior?: string
  board_id: string
  user_id: string
  project_id?: string
  icon?: string
  color?: string
  card_order?: unknown
  total_cards?: number
  time_created: number
  time_updated: number
}

/**
 * Parameters for creating a new list
 */
export interface CreateListParams {
  board_id: string
  title: string
  content?: string
  icon?: string
  color?: string
  behavior?: string
}

/**
 * Parameters for updating a list
 */
export interface UpdateListParams {
  title?: string
  content?: string
  icon?: string
  color?: string
  behavior?: string
}

/**
 * Parameters for updating a board
 */
export interface UpdateBoardParams {
  title?: string
  content?: string
  icon?: string
  color?: string
  archived?: boolean
}

/**
 * Parameters for creating a new board
 */
export interface CreateBoardParams {
  project_id: string
  title: string
  content?: string
  icon?: string
  color?: string
  image_urls?: string
  thumbnail_url?: string
  lists?: Array<{
    title: string
    content?: string
    icon?: string
    color?: string
    behavior?: string
  }>
  members?: Array<{
    user_id: string
    role?: string
  }>
  layout?: string
}

/**
 * Board information from Superthread API
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
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new board in a workspace.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Board creation parameters
   * @returns Created board details
   */
  async create(workspaceId: string, params: CreateBoardParams): Promise<Board> {
    const response = await this.client.request<{ board: Board }>(`/${workspaceId}/boards`, {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.board
  }

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

  /**
   * Creates a new list (column/status) within a board.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - List creation parameters
   * @returns Created list details
   */
  async createList(workspaceId: string, params: CreateListParams): Promise<List> {
    const response = await this.client.request<{ list: List }>(`/${workspaceId}/lists`, {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.list
  }

  /**
   * Updates an existing board.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID to update
   * @param params - Board update parameters
   * @returns Updated board
   */
  async update(workspaceId: string, boardId: string, params: UpdateBoardParams): Promise<Board> {
    const response = await this.client.request<{ board: Board }>(
      `/${workspaceId}/boards/${boardId}`,
      {
        method: "PATCH",
        body: JSON.stringify(params),
      }
    )
    return response.board
  }

  /**
   * Updates an existing list.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param listId - List ID to update
   * @param params - List update parameters
   * @returns Updated list
   */
  async updateList(workspaceId: string, listId: string, params: UpdateListParams): Promise<List> {
    const response = await this.client.request<{ list: List }>(`/${workspaceId}/lists/${listId}`, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
    return response.list
  }

  /**
   * Duplicates a board.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID to duplicate
   * @param params - Optional title and project_id for the copy
   * @returns Duplicated board
   */
  async duplicate(
    workspaceId: string,
    boardId: string,
    params?: { title?: string; project_id?: string }
  ): Promise<Board> {
    const response = await this.client.request<{ board: Board }>(
      `/${workspaceId}/boards/${boardId}/copy`,
      {
        method: "POST",
        body: params ? JSON.stringify(params) : undefined,
      }
    )
    return response.board
  }

  /**
   * Deletes a board permanently.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID to delete
   * @returns Success response
   */
  async delete(workspaceId: string, boardId: string): Promise<{ success: boolean }> {
    return await this.client.request<{ success: boolean }>(`/${workspaceId}/boards/${boardId}`, {
      method: "DELETE",
    })
  }
}
