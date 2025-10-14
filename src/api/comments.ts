/**
 * @fileoverview Comment resource for Superthread API.
 * Provides comment operations.
 */

import type { SuperthreadClient } from "./client.js"

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

/**
 * Comment information from Superthread API
 */
export interface Comment {
  id: string
  type: string
  content: string
  schema?: number
  page_id?: string
  card_id?: string
  user_id: string
  team_id: string
  time_created: number
  time_updated: number
  context?: string
  status?: string
  user?: unknown
  user_updated?: unknown
  reactions?: unknown[]
  participants?: string[]
  children?: unknown
  parent_id?: string
}

/**
 * Comment creation response
 */
export interface CreateCommentResponse {
  comment: Comment
}

/**
 * Reply to comment response
 */
export interface ReplyToCommentResponse {
  child_comment: Comment
}

/**
 * Get all replies response
 */
export interface GetRepliesResponse {
  cursor: string
  count: number
  child_comments: Comment[]
}

export class CommentResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new comment on a card or page.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Comment creation parameters
   * @returns Created comment details
   */
  async create(workspaceId: string, params: CreateCommentParams): Promise<CreateCommentResponse> {
    return await this.client.request<CreateCommentResponse>(`/${workspaceId}/comments`, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing comment.
   * Only the original author can modify comments.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Comment ID to update
   * @param params - Comment update parameters
   * @returns Updated comment details
   */
  async update(
    workspaceId: string,
    commentId: string,
    params: UpdateCommentParams
  ): Promise<CreateCommentResponse> {
    return await this.client.request<CreateCommentResponse>(
      `/${workspaceId}/comments/${commentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(params),
      }
    )
  }

  /**
   * Creates a reply (child comment) to an existing comment.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID to reply to
   * @param params - Reply parameters
   * @returns Created reply details
   */
  async reply(
    workspaceId: string,
    commentId: string,
    params: ReplyToCommentParams
  ): Promise<ReplyToCommentResponse> {
    return await this.client.request<ReplyToCommentResponse>(
      `/${workspaceId}/comments/${commentId}/children`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    )
  }

  /**
   * Retrieves a specific comment by ID.
   * Includes metadata like author, reactions, timestamps, and child comments.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Comment ID to retrieve
   * @returns Comment details
   */
  async get(workspaceId: string, commentId: string): Promise<CreateCommentResponse> {
    return await this.client.request<CreateCommentResponse>(
      `/${workspaceId}/comments/${commentId}`,
      {
        method: "GET",
      }
    )
  }

  /**
   * Permanently deletes a comment.
   * Only the original author can delete their own comment.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Comment ID to delete
   * @returns void (204 No Content)
   */
  async delete(workspaceId: string, commentId: string): Promise<void> {
    await this.client.request<void>(`/${workspaceId}/comments/${commentId}`, {
      method: "DELETE",
    })
  }

  /**
   * Retrieves all replies (child comments) for a parent comment.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID
   * @returns List of child comments with pagination details
   */
  async getReplies(workspaceId: string, commentId: string): Promise<GetRepliesResponse> {
    return await this.client.request<GetRepliesResponse>(
      `/${workspaceId}/comments/${commentId}/children`,
      {
        method: "GET",
      }
    )
  }

  /**
   * Updates a specific reply (child comment).
   * Only the original author can modify their reply.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID
   * @param childCommentId - Child comment ID to update
   * @param params - Comment update parameters
   * @returns Updated reply details
   */
  async updateReply(
    workspaceId: string,
    commentId: string,
    childCommentId: string,
    params: UpdateCommentParams
  ): Promise<ReplyToCommentResponse> {
    return await this.client.request<ReplyToCommentResponse>(
      `/${workspaceId}/comments/${commentId}/children/${childCommentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(params),
      }
    )
  }

  /**
   * Permanently deletes a reply (child comment).
   * Only the original author can delete their own reply.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param commentId - Parent comment ID
   * @param childCommentId - Child comment ID to delete
   * @returns void (204 No Content)
   */
  async deleteReply(workspaceId: string, commentId: string, childCommentId: string): Promise<void> {
    await this.client.request<void>(
      `/${workspaceId}/comments/${commentId}/children/${childCommentId}`,
      {
        method: "DELETE",
      }
    )
  }
}
