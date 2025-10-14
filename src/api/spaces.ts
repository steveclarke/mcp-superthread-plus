/**
 * @fileoverview Space resource for Superthread API.
 * Provides space (organizational container) operations.
 *
 * Note: UI "Spaces" map to API "projects" endpoint.
 * Do not confuse with roadmap projects which use the /epics endpoint.
 */

import type { SuperthreadClient } from "./client.js"

/**
 * Space (organizational container) information from Superthread API
 */
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

/**
 * Space (organizational container) information from Superthread API
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
  constructor(private client: SuperthreadClient) {}

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

  /**
   * Creates a new space (organizational container).
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Space creation parameters
   * @returns Created space
   */
  async create(workspaceId: string, params: CreateSpaceParams): Promise<Space> {
    const response = await this.client.request<{ project: Space }>(`/${workspaceId}/projects`, {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.project
  }

  /**
   * Updates an existing space.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @param params - Space update parameters
   * @returns Updated space
   */
  async update(workspaceId: string, spaceId: string, params: UpdateSpaceParams): Promise<Space> {
    const response = await this.client.request<{ project: Space }>(
      `/${workspaceId}/projects/${spaceId}`,
      {
        method: "PATCH",
        body: JSON.stringify(params),
      }
    )
    return response.project
  }

  /**
   * Adds a member to a space.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @param params - Member to add
   * @returns Success response
   */
  async addMember(
    workspaceId: string,
    spaceId: string,
    params: AddSpaceMemberParams
  ): Promise<{ success: boolean }> {
    return await this.client.request<{ success: boolean }>(
      `/${workspaceId}/projects/${spaceId}/members`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    )
  }

  /**
   * Removes a member from a space.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @param memberId - Member ID to remove
   * @returns Success response
   */
  async removeMember(
    workspaceId: string,
    spaceId: string,
    memberId: string
  ): Promise<{ success: boolean }> {
    return await this.client.request<{ success: boolean }>(
      `/${workspaceId}/projects/${spaceId}/members/${memberId}`,
      {
        method: "DELETE",
      }
    )
  }

  /**
   * Deletes a space permanently.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param spaceId - Space ID (maps to project_id in API)
   * @returns Success response
   */
  async delete(workspaceId: string, spaceId: string): Promise<{ success: boolean }> {
    return await this.client.request<{ success: boolean }>(`/${workspaceId}/projects/${spaceId}`, {
      method: "DELETE",
    })
  }
}
