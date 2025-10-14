/**
 * @fileoverview Comment resource for SuperThread API.
 * Provides comment operations.
 */

import type { SuperThreadClient } from "./client.js"

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
 * Comment information from SuperThread API
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

export class CommentResource {
  constructor(private client: SuperThreadClient) {}

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
}
