/**
 * @fileoverview Sprint resource for Superthread API.
 * Provides sprint operations for discovering list IDs and managing sprints.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

export class SprintResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Gets all sprints for a space.
   * API: GET /:workspace/projects/:project
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @returns API response (passed through to LLM)
   */
  async list(workspaceId: string, spaceId: string): Promise<unknown> {
    const path = urlcat("/:workspace/projects/:project", {
      workspace: safeId("workspaceId", workspaceId),
      project: safeId("spaceId", spaceId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Gets detailed sprint information including list IDs.
   * API: GET /:workspace/sprints/:sprint
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param sprintId - Sprint ID
   * @param spaceId - Space ID (maps to project_id in API) - required query parameter
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, sprintId: string, spaceId: string): Promise<unknown> {
    const path = urlcat("/:workspace/sprints/:sprint", {
      workspace: safeId("workspaceId", workspaceId),
      sprint: safeId("sprintId", sprintId),
    })
    const params = new URLSearchParams()
    params.append("project_id", safeId("spaceId", spaceId))

    return await this.client.request(`${path}?${params.toString()}`, {
      method: "GET",
    })
  }
}
