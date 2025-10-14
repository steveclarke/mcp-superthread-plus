/**
 * @fileoverview Comment resource for Superthread API.
 * Provides comment operations.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

/**
 * Comment creation parameters
 */
export interface CreateCommentParams {
  content: string // Comment text (required, max 102400 chars)
  schema?: number // Schema version (optional, defaults to 1)
  card_id?: string // Card to attach comment to
  page_id?: string // Page to attach comment to
  context?: string // Highlighted text context
}

/**
 * Comment update parameters
 */
export interface UpdateCommentParams {
  content?: string // Updated comment text (max 102400 chars)
  schema?: number // Schema version
  context?: string // Updated highlighted text context
  status?: "resolved" | "open" | "orphaned" // Comment status
}

/**
 * Reply to comment parameters
 */
export interface ReplyToCommentParams {
  content: string // Reply text (required, max 102400 chars)
  schema?: number // Schema version (optional)
}

export class CommentResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new comment on a card or page.
   * API: POST /:workspace/comments
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Comment creation parameters
   * @returns API response (passed through to LLM)
   */
  async create(workspaceId: string, params: CreateCommentParams): Promise<unknown> {
    const path = urlcat("/:workspace/comments", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing comment.
   * Only the original author can modify comments.
   * API: PATCH /:workspace/comments/:comment
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Comment ID to update
   * @param params - Comment update parameters
   * @returns API response (passed through to LLM)
   */
  async update(
    workspaceId: string,
    commentId: string,
    params: UpdateCommentParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/comments/:comment", {
      workspace: safeId("workspaceId", workspaceId),
      comment: safeId("commentId", commentId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Creates a reply (child comment) to an existing comment.
   * API: POST /:workspace/comments/:comment/children
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID to reply to
   * @param params - Reply parameters
   * @returns API response (passed through to LLM)
   */
  async reply(
    workspaceId: string,
    commentId: string,
    params: ReplyToCommentParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/comments/:comment/children", {
      workspace: safeId("workspaceId", workspaceId),
      comment: safeId("commentId", commentId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Retrieves a specific comment by ID.
   * Includes metadata like author, reactions, timestamps, and child comments.
   * API: GET /:workspace/comments/:comment
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Comment ID to retrieve
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, commentId: string): Promise<unknown> {
    const path = urlcat("/:workspace/comments/:comment", {
      workspace: safeId("workspaceId", workspaceId),
      comment: safeId("commentId", commentId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Permanently deletes a comment.
   * Only the original author can delete their own comment.
   * API: DELETE /:workspace/comments/:comment
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Comment ID to delete
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, commentId: string): Promise<unknown> {
    const path = urlcat("/:workspace/comments/:comment", {
      workspace: safeId("workspaceId", workspaceId),
      comment: safeId("commentId", commentId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }

  /**
   * Retrieves all replies (child comments) for a parent comment.
   * API: GET /:workspace/comments/:comment/children
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID
   * @returns API response (passed through to LLM)
   */
  async getReplies(workspaceId: string, commentId: string): Promise<unknown> {
    const path = urlcat("/:workspace/comments/:comment/children", {
      workspace: safeId("workspaceId", workspaceId),
      comment: safeId("commentId", commentId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Updates a specific reply (child comment).
   * Only the original author can modify their reply.
   * API: PATCH /:workspace/comments/:comment/children/:child
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID
   * @param childCommentId - Child comment ID to update
   * @param params - Comment update parameters
   * @returns API response (passed through to LLM)
   */
  async updateReply(
    workspaceId: string,
    commentId: string,
    childCommentId: string,
    params: UpdateCommentParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/comments/:comment/children/:child", {
      workspace: safeId("workspaceId", workspaceId),
      comment: safeId("commentId", commentId),
      child: safeId("childCommentId", childCommentId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Permanently deletes a reply (child comment).
   * Only the original author can delete their own reply.
   * API: DELETE /:workspace/comments/:comment/children/:child
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID
   * @param childCommentId - Child comment ID to delete
   * @returns API response (passed through to LLM)
   */
  async deleteReply(
    workspaceId: string,
    commentId: string,
    childCommentId: string
  ): Promise<unknown> {
    const path = urlcat("/:workspace/comments/:comment/children/:child", {
      workspace: safeId("workspaceId", workspaceId),
      comment: safeId("commentId", commentId),
      child: safeId("childCommentId", childCommentId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
