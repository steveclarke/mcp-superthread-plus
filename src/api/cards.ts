/**
 * @fileoverview Card resource for SuperThread API.
 * Provides all card-related API operations (tasks/tickets in SuperThread).
 *
 * Terminology mapping:
 * - workspace_id (our API) → team_id (SuperThread API)
 */

import type { SuperThreadClient } from "./client.js"

export class CardResource {
  constructor(private client: SuperThreadClient) {}

  /**
   * Creates a new card.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param data - Card creation data
   * @returns Created card
   */
  async create(workspaceId: string, data: any): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/cards
    throw new Error("CardResource.create() not implemented yet")
  }

  /**
   * Gets a card by ID.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param cardId - Card ID
   * @returns Card details
   */
  async get(workspaceId: string, cardId: string): Promise<any> {
    // TODO: Implement API call
    // GET /{team_id}/cards/{card_id}
    throw new Error("CardResource.get() not implemented yet")
  }

  /**
   * Updates a card.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   * @param data - Update data
   * @returns Updated card
   */
  async update(workspaceId: string, cardId: string, data: any): Promise<any> {
    // TODO: Implement API call
    // PATCH /{team_id}/cards/{card_id}
    throw new Error("CardResource.update() not implemented yet")
  }

  /**
   * Deletes a card.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   */
  async delete(workspaceId: string, cardId: string): Promise<void> {
    // TODO: Implement API call
    // DELETE /{team_id}/cards/{card_id}
    throw new Error("CardResource.delete() not implemented yet")
  }

  /**
   * Duplicates a card.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   * @returns Duplicated card
   */
  async duplicate(workspaceId: string, cardId: string): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/cards/{card_id}/duplicate
    throw new Error("CardResource.duplicate() not implemented yet")
  }

  /**
   * Archives a card.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   * @returns Archived card
   */
  async archive(workspaceId: string, cardId: string): Promise<any> {
    // TODO: Implement API call
    // PATCH /{team_id}/cards/{card_id} with archived: true
    throw new Error("CardResource.archive() not implemented yet")
  }

  /**
   * Gets cards assigned to a user.
   * @param workspaceId - Workspace ID
   * @param userId - User ID
   * @param projectId - Optional project ID filter
   * @returns List of assigned cards
   */
  async getAssignedToUser(
    workspaceId: string,
    userId: string,
    projectId?: string
  ): Promise<any[]> {
    // TODO: Implement API call
    // POST /{team_id}/cards/assigned
    throw new Error("CardResource.getAssignedToUser() not implemented yet")
  }

  /**
   * Adds a related card relationship.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   * @param relatedCardId - Related card ID
   * @param relationType - Relationship type (blocks, blocked_by, relates_to)
   */
  async addRelated(
    workspaceId: string,
    cardId: string,
    relatedCardId: string,
    relationType: string
  ): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/cards/{card_id}/related
    throw new Error("CardResource.addRelated() not implemented yet")
  }

  /**
   * Removes a related card relationship.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   * @param relatedCardId - Related card ID
   */
  async removeRelated(
    workspaceId: string,
    cardId: string,
    relatedCardId: string
  ): Promise<void> {
    // TODO: Implement API call
    // DELETE /{team_id}/cards/{card_id}/related
    throw new Error("CardResource.removeRelated() not implemented yet")
  }

  /**
   * Gets all available tags.
   * @param workspaceId - Workspace ID
   * @returns List of tags
   */
  async getTags(workspaceId: string): Promise<any[]> {
    // TODO: Implement API call
    // GET /{team_id}/tags
    throw new Error("CardResource.getTags() not implemented yet")
  }

  /**
   * Adds tags to a card.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   * @param tagIds - Array of tag IDs
   */
  async addTags(
    workspaceId: string,
    cardId: string,
    tagIds: string[]
  ): Promise<any> {
    // TODO: Implement API call
    // POST /{team_id}/cards/{card_id}/tags
    throw new Error("CardResource.addTags() not implemented yet")
  }

  /**
   * Removes a tag from a card.
   * @param workspaceId - Workspace ID
   * @param cardId - Card ID
   * @param tagId - Tag ID to remove
   */
  async removeTag(
    workspaceId: string,
    cardId: string,
    tagId: string
  ): Promise<void> {
    // TODO: Implement API call
    // DELETE /{team_id}/cards/{card_id}/tags/{tag_id}
    throw new Error("CardResource.removeTag() not implemented yet")
  }
}

