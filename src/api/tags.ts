/**
 * @fileoverview Tag resource for Superthread API.
 * Provides tag management operations.
 */

import urlcat from "urlcat"
import { safeId } from "../utils.js"
import type { SuperthreadClient } from "./client.js"

/**
 * Parameters for creating a new tag
 */
export interface CreateTagParams {
  name: string
  color: string
  project_id?: string
}

/**
 * Parameters for updating an existing tag
 * All fields are optional - only specified fields will be updated
 */
export interface UpdateTagParams {
  name?: string
  color?: string
}

export class TagResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new tag in the workspace.
   * API: POST /:workspace/tags
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Tag creation parameters (name and color required, project_id optional)
   * @returns API response with created tag (passed through to LLM)
   */
  async create(workspaceId: string, params: CreateTagParams): Promise<unknown> {
    const path = urlcat("/:workspace/tags", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing tag's properties.
   * API: PATCH /:workspace/tags/:tag
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param tagId - Tag ID to update
   * @param params - Tag update parameters (only specified fields will be updated)
   * @returns API response with updated tag (passed through to LLM)
   */
  async update(workspaceId: string, tagId: string, params: UpdateTagParams): Promise<unknown> {
    const path = urlcat("/:workspace/tags/:tag", {
      workspace: safeId("workspaceId", workspaceId),
      tag: safeId("tagId", tagId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Permanently deletes a tag from the workspace.
   * API: DELETE /:workspace/tags/:tag
   *
   * ⚠️ WARNING: This endpoint is UNDOCUMENTED in Superthread's public API.
   * It was discovered via browser network inspection and may change without notice.
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param tagId - Tag ID to delete
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, tagId: string): Promise<unknown> {
    const path = urlcat("/:workspace/tags/:tag", {
      workspace: safeId("workspaceId", workspaceId),
      tag: safeId("tagId", tagId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
