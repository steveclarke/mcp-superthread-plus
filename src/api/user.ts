/**
 * @fileoverview User resource for Superthread API.
 * Provides user and team member operations.
 */

import urlcat from "urlcat"
import { safeId } from "../utils.js"
import type { SuperthreadClient } from "./client.js"

export class UserResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Gets the current user's account information.
   * API: GET /users/me
   *
   * @returns API response (passed through to LLM)
   */
  async getMyAccount(): Promise<unknown> {
    return await this.client.request("/users/me", {
      method: "GET",
    })
  }

  /**
   * Gets workspace members.
   * API: GET /teams/:workspace/members
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns API response (passed through to LLM)
   */
  async getMembers(workspaceId: string): Promise<unknown> {
    const path = urlcat("/teams/:workspace/members", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }
}
