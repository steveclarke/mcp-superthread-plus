/**
 * @fileoverview Space resource for Superthread API.
 * Provides space (organizational container) operations.
 *
 * Note: UI "Spaces" map to API "projects" endpoint.
 * Do not confuse with roadmap projects which use the /epics endpoint.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

/**
 * Parameters for creating a space
 */
export interface CreateSpaceParams {
  title: string
  description?: string
  icon?: {
    type: string
    src?: string
    emoji?: string
    color?: string
  }
}

/**
 * Parameters for updating a space
 */
export interface UpdateSpaceParams {
  title?: string
  description?: string
  icon?: {
    type?: string
    src?: string
    emoji?: string
    color?: string
  }
  archived?: boolean
}

/**
 * Parameters for adding a member to a space
 */
export interface AddSpaceMemberParams {
  user_id: string
  role?: string
}

export class SpaceResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Gets all spaces (organizational containers) in a workspace.
   * API: GET /:workspace/projects
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns API response (passed through to LLM)
   */
  async list(workspaceId: string): Promise<unknown> {
    const path = urlcat("/:workspace/projects", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Gets a specific space with full details.
   * API: GET /:workspace/projects/:space
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, spaceId: string): Promise<unknown> {
    const path = urlcat("/:workspace/projects/:space", {
      workspace: safeId("workspaceId", workspaceId),
      space: safeId("spaceId", spaceId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Creates a new space (organizational container).
   * API: POST /:workspace/projects
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Space creation parameters
   * @returns API response (passed through to LLM)
   */
  async create(workspaceId: string, params: CreateSpaceParams): Promise<unknown> {
    const path = urlcat("/:workspace/projects", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing space.
   * API: PATCH /:workspace/projects/:space
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @param params - Space update parameters
   * @returns API response (passed through to LLM)
   */
  async update(workspaceId: string, spaceId: string, params: UpdateSpaceParams): Promise<unknown> {
    const path = urlcat("/:workspace/projects/:space", {
      workspace: safeId("workspaceId", workspaceId),
      space: safeId("spaceId", spaceId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Adds a member to a space.
   * API: POST /:workspace/projects/:space/members
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @param params - Member to add
   * @returns API response (passed through to LLM)
   */
  async addMember(
    workspaceId: string,
    spaceId: string,
    params: AddSpaceMemberParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/projects/:space/members", {
      workspace: safeId("workspaceId", workspaceId),
      space: safeId("spaceId", spaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Removes a member from a space.
   * API: DELETE /:workspace/projects/:space/members/:member
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @param memberId - Member ID to remove
   * @returns API response (passed through to LLM)
   */
  async removeMember(workspaceId: string, spaceId: string, memberId: string): Promise<unknown> {
    const path = urlcat("/:workspace/projects/:space/members/:member", {
      workspace: safeId("workspaceId", workspaceId),
      space: safeId("spaceId", spaceId),
      member: safeId("memberId", memberId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Deletes a space permanently.
   * API: DELETE /:workspace/projects/:space
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, spaceId: string): Promise<unknown> {
    const path = urlcat("/:workspace/projects/:space", {
      workspace: safeId("workspaceId", workspaceId),
      space: safeId("spaceId", spaceId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
