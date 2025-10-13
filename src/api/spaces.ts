/**
 * @fileoverview Space resource for SuperThread API.
 * Provides space/workspace management operations.
 *
 * Terminology mapping:
 * - space_id (our API) → project_id (SuperThread API)
 * - Spaces in UI = Projects in API (/projects endpoint)
 */

import type { SuperThreadClient } from "./client.js"

export class SpaceResource {
  constructor(private client: SuperThreadClient) {}

  /**
   * Creates a new space.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param data - Space creation data
   * @returns Created space
   */
  async create(workspaceId: string, data: any): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/projects
    throw new Error("SpaceResource.create() not implemented yet")
  }

  /**
   * Gets a space by ID.
   * @param workspaceId - Workspace ID
   * @param spaceId - Space ID (maps to project_id in API)
   * @returns Space details
   */
  async get(workspaceId: string, spaceId: string): Promise<any> {
    // TODO: Implement API call
    // GET /{team_id}/projects/{project_id}
    throw new Error("SpaceResource.get() not implemented yet")
  }

  /**
   * Lists all spaces.
   * @param workspaceId - Workspace ID
   * @returns List of spaces
   */
  async list(workspaceId: string): Promise<any[]> {
    // TODO: Implement API call
    // GET /{team_id}/projects
    throw new Error("SpaceResource.list() not implemented yet")
  }

  /**
   * Updates a space.
   * @param workspaceId - Workspace ID
   * @param spaceId - Space ID
   * @param data - Update data
   * @returns Updated space
   */
  async update(workspaceId: string, spaceId: string, data: any): Promise<any> {
    // TODO: Implement API call
    // PATCH /{team_id}/projects/{project_id}
    throw new Error("SpaceResource.update() not implemented yet")
  }

  /**
   * Deletes a space.
   * @param workspaceId - Workspace ID
   * @param spaceId - Space ID
   */
  async delete(workspaceId: string, spaceId: string): Promise<void> {
    // TODO: Implement API call
    // DELETE /{team_id}/projects/{project_id}
    throw new Error("SpaceResource.delete() not implemented yet")
  }

  /**
   * Adds a member to a space.
   * @param workspaceId - Workspace ID
   * @param spaceId - Space ID
   * @param userId - User ID to add
   * @param role - Member role
   */
  async addMember(
    workspaceId: string,
    spaceId: string,
    userId: string,
    role?: string
  ): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/projects/{project_id}/members
    throw new Error("SpaceResource.addMember() not implemented yet")
  }

  /**
   * Removes a member from a space.
   * @param workspaceId - Workspace ID
   * @param spaceId - Space ID
   * @param userId - User ID to remove
   */
  async removeMember(
    workspaceId: string,
    spaceId: string,
    userId: string
  ): Promise<void> {
    // TODO: Implement API call
    // DELETE /{team_id}/projects/{project_id}/members/{user_id}
    throw new Error("SpaceResource.removeMember() not implemented yet")
  }
}

