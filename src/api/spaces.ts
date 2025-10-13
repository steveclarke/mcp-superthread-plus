/**
 * @fileoverview Space resource for SuperThread API.
 * Provides space (organizational container) operations.
 *
 * Note: UI "Spaces" map to API "projects" endpoint.
 * Do not confuse with roadmap projects which use the /epics endpoint.
 */

import type { SuperThreadClient } from "./client.js"

/**
 * Space (organizational container) information from SuperThread API
 */
export interface Space {
  id: string
  team_id: string
  title: string
  description?: string
  icon?: {
    type: string
    src?: string
    emoji?: string
    color?: string
  }
  user_id: string
  time_created: number
  time_updated: number
  members?: Array<{
    user_id: string
    assigned_date: number
    role: string
  }>
  total_members?: number
  is_member?: boolean
  boards?: Array<{
    id: string
    title: string
  }>
}

export class SpaceResource {
  constructor(private client: SuperThreadClient) {}

  /**
   * Gets all spaces (organizational containers) in a workspace.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns List of spaces
   */
  async list(workspaceId: string): Promise<Space[]> {
    const response = await this.client.request<{ projects: Space[] }>(`/${workspaceId}/projects`, {
      method: "GET",
    })
    return response.projects || []
  }

  /**
   * Gets a specific space with full details.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @returns Space details
   */
  async get(workspaceId: string, spaceId: string): Promise<Space> {
    const response = await this.client.request<{ project: Space }>(
      `/${workspaceId}/projects/${spaceId}`,
      {
        method: "GET",
      }
    )
    return response.project
  }
}
