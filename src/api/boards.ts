/**
 * @fileoverview Board resource for Superthread API.
 * Provides board and kanban operations.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

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

export class BoardResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new board in a workspace.
   * API: POST /:workspace/boards
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Board creation parameters
   * @returns API response (passed through to LLM)
   */
  async create(workspaceId: string, params: CreateBoardParams): Promise<unknown> {
    const path = urlcat("/:workspace/boards", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Gets all boards in a workspace.
   * API: GET /:workspace/boards
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param options - Optional filters (project_id, bookmarked, or archived)
   * @returns API response (passed through to LLM)
   */
  async list(
    workspaceId: string,
    options?: { project_id?: string; bookmarked?: boolean; archived?: boolean }
  ): Promise<unknown> {
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

    const path =
      urlcat("/:workspace/boards", {
        workspace: safeId("workspaceId", workspaceId),
      }) + `?${params.toString()}`
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Gets a specific board with full details including lists and cards.
   * API: GET /:workspace/boards/:board
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, boardId: string): Promise<unknown> {
    const path = urlcat("/:workspace/boards/:board", {
      workspace: safeId("workspaceId", workspaceId),
      board: safeId("boardId", boardId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Creates a new list (column/status) within a board.
   * API: POST /:workspace/lists
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - List creation parameters
   * @returns API response (passed through to LLM)
   */
  async createList(workspaceId: string, params: CreateListParams): Promise<unknown> {
    const path = urlcat("/:workspace/lists", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing board.
   * API: PATCH /:workspace/boards/:board
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID to update
   * @param params - Board update parameters
   * @returns API response (passed through to LLM)
   */
  async update(workspaceId: string, boardId: string, params: UpdateBoardParams): Promise<unknown> {
    const path = urlcat("/:workspace/boards/:board", {
      workspace: safeId("workspaceId", workspaceId),
      board: safeId("boardId", boardId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing list.
   * API: PATCH /:workspace/lists/:list
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param listId - List ID to update
   * @param params - List update parameters
   * @returns API response (passed through to LLM)
   */
  async updateList(
    workspaceId: string,
    listId: string,
    params: UpdateListParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/lists/:list", {
      workspace: safeId("workspaceId", workspaceId),
      list: safeId("listId", listId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Duplicates a board.
   * API: POST /:workspace/boards/:board/copy
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID to duplicate
   * @param params - Optional title and project_id for the copy
   * @returns API response (passed through to LLM)
   */
  async duplicate(
    workspaceId: string,
    boardId: string,
    params?: { title?: string; project_id?: string }
  ): Promise<unknown> {
    const path = urlcat("/:workspace/boards/:board/copy", {
      workspace: safeId("workspaceId", workspaceId),
      board: safeId("boardId", boardId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: params ? JSON.stringify(params) : undefined,
    })
  }

  /**
   * Deletes a board permanently.
   * API: DELETE /:workspace/boards/:board
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param boardId - Board ID to delete
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, boardId: string): Promise<unknown> {
    const path = urlcat("/:workspace/boards/:board", {
      workspace: safeId("workspaceId", workspaceId),
      board: safeId("boardId", boardId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Deletes a list permanently.
   * API: DELETE /:workspace/lists/:list
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param listId - List ID to delete
   * @returns API response (passed through to LLM)
   */
  async deleteList(workspaceId: string, listId: string): Promise<unknown> {
    const path = urlcat("/:workspace/lists/:list", {
      workspace: safeId("workspaceId", workspaceId),
      list: safeId("listId", listId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
