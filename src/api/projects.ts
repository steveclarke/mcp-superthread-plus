/**
 * @fileoverview Project resource for SuperThread API.
 * Provides roadmap project operations (epics in SuperThread).
 *
 * Terminology mapping:
 * - project_id (our API, for Roadmap projects) → epic_id (SuperThread API)
 * - These are NOT the same as Spaces (which are called "projects" in the API)
 */

import type { SuperThreadClient } from "./client.js"

export class ProjectResource {
  constructor(private client: SuperThreadClient) {}

  /**
   * Creates a new roadmap project (epic).
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param data - Project creation data
   * @returns Created project
   */
  async create(workspaceId: string, data: any): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/epics
    throw new Error("ProjectResource.create() not implemented yet")
  }

  /**
   * Gets a project by ID.
   * @param workspaceId - Workspace ID
   * @param projectId - Project ID (maps to epic_id in API)
   * @returns Project details
   */
  async get(workspaceId: string, projectId: string): Promise<any> {
    // TODO: Implement API call
    // GET /{team_id}/epics/{epic_id}
    throw new Error("ProjectResource.get() not implemented yet")
  }

  /**
   * Lists all roadmap projects.
   * @param workspaceId - Workspace ID
   * @returns List of projects
   */
  async list(workspaceId: string): Promise<any[]> {
    // TODO: Implement API call
    // GET /{team_id}/epics
    throw new Error("ProjectResource.list() not implemented yet")
  }

  /**
   * Updates a project.
   * @param workspaceId - Workspace ID
   * @param projectId - Project ID
   * @param data - Update data
   * @returns Updated project
   */
  async update(
    workspaceId: string,
    projectId: string,
    data: any
  ): Promise<any> {
    // TODO: Implement API call
    // PATCH /{team_id}/epics/{epic_id}
    throw new Error("ProjectResource.update() not implemented yet")
  }

  /**
   * Deletes a project.
   * @param workspaceId - Workspace ID
   * @param projectId - Project ID
   */
  async delete(workspaceId: string, projectId: string): Promise<void> {
    // TODO: Implement API call
    // DELETE /{team_id}/epics/{epic_id}
    throw new Error("ProjectResource.delete() not implemented yet")
  }

  /**
   * Archives a project.
   * @param workspaceId - Workspace ID
   * @param projectId - Project ID
   * @returns Archived project
   */
  async archive(workspaceId: string, projectId: string): Promise<any> {
    // TODO: Implement API call
    // PATCH /{team_id}/epics/{epic_id} with archived: true
    throw new Error("ProjectResource.archive() not implemented yet")
  }

  /**
   * Adds a related card to a project.
   * @param workspaceId - Workspace ID
   * @param projectId - Project ID
   * @param cardId - Card ID
   */
  async addRelatedCard(
    workspaceId: string,
    projectId: string,
    cardId: string
  ): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/epics/{epic_id}/related
    throw new Error("ProjectResource.addRelatedCard() not implemented yet")
  }

  /**
   * Removes a related card from a project.
   * @param workspaceId - Workspace ID
   * @param projectId - Project ID
   * @param cardId - Card ID
   */
  async removeRelatedCard(
    workspaceId: string,
    projectId: string,
    cardId: string
  ): Promise<void> {
    // TODO: Implement API call
    // DELETE /{team_id}/epics/{epic_id}/related/{card_id}
    throw new Error("ProjectResource.removeRelatedCard() not implemented yet")
  }
}

