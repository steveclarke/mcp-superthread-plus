/**
 * @fileoverview Project (Roadmap) resource for Superthread API.
 * Provides roadmap project/epic operations.
 *
 * Note: UI "Projects" map to API "epics" (roadmap projects, not spaces).
 * Spaces use the /projects endpoint (confusing terminology!).
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

/**
 * Project creation parameters
 */
export interface CreateProjectParams {
  title: string // Required
  list_id: string // Required - status list
  content?: string
  schema?: number
  icon?: unknown
  start_date?: number
  due_date?: number
  members?: Array<{ user_id: string; role: string }>
  owner_id?: string
  priority?: number
  cover_image?: unknown
}

/**
 * Project update parameters
 */
export interface UpdateProjectParams {
  title?: string
  list_id?: string
  owner_id?: string
  start_date?: number
  due_date?: number
  position?: number
  priority?: number
  archived?: boolean
  icon?: unknown
  cover_image?: unknown
}

export class ProjectResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Gets all roadmap projects (epics) in a workspace.
   * API: GET /:workspace/epics
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns API response (passed through to LLM)
   */
  async list(workspaceId: string): Promise<unknown> {
    const path = urlcat("/:workspace/epics", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Gets a specific roadmap project.
   * API: GET /:workspace/epics/:project
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, projectId: string): Promise<unknown> {
    const path = urlcat("/:workspace/epics/:project", {
      workspace: safeId("workspaceId", workspaceId),
      project: safeId("projectId", projectId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Creates a new roadmap project (epic).
   * API: POST /:workspace/epics
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Project creation parameters
   * @returns API response (passed through to LLM)
   */
  async create(workspaceId: string, params: CreateProjectParams): Promise<unknown> {
    const path = urlcat("/:workspace/epics", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing roadmap project.
   * Supports archiving via the archived parameter.
   * API: PATCH /:workspace/epics/:project
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @param params - Project update parameters
   * @returns API response (passed through to LLM)
   */
  async update(
    workspaceId: string,
    projectId: string,
    params: UpdateProjectParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/epics/:project", {
      workspace: safeId("workspaceId", workspaceId),
      project: safeId("projectId", projectId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Permanently deletes a project (epic).
   * API: DELETE /:workspace/epics/:project
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, projectId: string): Promise<unknown> {
    const path = urlcat("/:workspace/epics/:project", {
      workspace: safeId("workspaceId", workspaceId),
      project: safeId("projectId", projectId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Links a card to a project (epic).
   * API: POST /:workspace/epics/:project/cards/:card
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @param cardId - Card ID to link to the project
   * @returns API response (passed through to LLM)
   */
  async addRelatedCard(workspaceId: string, projectId: string, cardId: string): Promise<unknown> {
    const path = urlcat("/:workspace/epics/:project/cards/:card", {
      workspace: safeId("workspaceId", workspaceId),
      project: safeId("projectId", projectId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "POST",
    })
  }

  /**
   * Removes a linked card from a project (epic).
   * API: DELETE /:workspace/epics/:project/cards/:card
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @param cardId - Card ID to unlink from the project
   * @returns API response (passed through to LLM)
   */
  async removeRelatedCard(
    workspaceId: string,
    projectId: string,
    cardId: string
  ): Promise<unknown> {
    const path = urlcat("/:workspace/epics/:project/cards/:card", {
      workspace: safeId("workspaceId", workspaceId),
      project: safeId("projectId", projectId),
      card: safeId("cardId", cardId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
