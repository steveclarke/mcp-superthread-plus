/**
 * @fileoverview User resource for Superthread API.
 * Provides user and team member operations.
 */

import urlcat from "urlcat"
import { safeId } from "../utils.js"
import type { SuperthreadClient } from "./client.js"

/**
 * User account information from Superthread API
 */
export interface UserAccount {
  id: string
  email: string
  name: string
  teams: Array<{
    id: string
    name: string
    role: string
  }>
}

/**
 * Workspace member information from Superthread API
 */
export interface WorkspaceMember {
  id: string
  email: string
  name: string
  role: string
}

export class UserResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Gets the current user's account information.
   * @returns Current user account details
   */
  async getMyAccount(): Promise<UserAccount> {
    return await this.client.request<UserAccount>("/users/me", {
      method: "GET",
    })
  }

  /**
   * Gets workspace members.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns List of workspace members
   */
  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const path = urlcat("/teams/:workspace/members", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request<WorkspaceMember[]>(path, {
      method: "GET",
    })
  }
}
