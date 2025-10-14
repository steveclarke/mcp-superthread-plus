/**
 * @fileoverview Sprint resource for Superthread API.
 * Provides sprint operations for discovering list IDs and managing sprints.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

/**
 * Sprint list (column/status) within a sprint
 */
export interface SprintList {
  id: string
  title: string
  behavior: "committed" | "started" | "completed" | "cancelled"
  team_id: string
  time_created: number
  time_updated: number
}

/**
 * Sprint information from Superthread API
 */
export interface Sprint {
  id: string
  title: string
  start_date: number
  end_date: number
  override_end_date?: number
  project_id: string
  team_id: string
  state: string
  lists: SprintList[]
  progress?: unknown[]
  unfinished_cards?: unknown
  time_created: number
  time_updated: number
}

export class SprintResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Gets all sprints for a space.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @returns List of sprints with basic information
   */
  async list(workspaceId: string, spaceId: string): Promise<Sprint[]> {
    const path = urlcat("/:workspace/projects/:project", {
      workspace: safeId("workspaceId", workspaceId),
      project: safeId("spaceId", spaceId),
    })
    const response = await this.client.request<{ project: { sprints?: Sprint[] } }>(path, {
      method: "GET",
    })
    return response.project.sprints || []
  }

  /**
   * Gets detailed sprint information including list IDs.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param sprintId - Sprint ID
   * @param spaceId - Space ID (maps to project_id in API) - required query parameter
   * @returns Sprint details including lists
   */
  async get(workspaceId: string, sprintId: string, spaceId: string): Promise<Sprint> {
    const path = urlcat("/:workspace/sprints/:sprint", {
      workspace: safeId("workspaceId", workspaceId),
      sprint: safeId("sprintId", sprintId),
    })
    const params = new URLSearchParams()
    params.append("project_id", safeId("spaceId", spaceId))

    const response = await this.client.request<{ sprint: Sprint }>(`${path}?${params.toString()}`, {
      method: "GET",
    })
    return response.sprint
  }
}
