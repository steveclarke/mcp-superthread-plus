/**
 * @fileoverview User resource for SuperThread API.
 * Provides user and team member operations.
 */

import type { SuperThreadClient } from "./client.js"

export class UserResource {
  constructor(private client: SuperThreadClient) {}

  /**
   * Gets the current user's account information.
   * @returns Current user account details
   */
  async getMyAccount(): Promise<any> {
    return await this.client.request("/users/me", {
      method: "GET",
    })
  }

  /**
   * Updates the current user's account.
   * @param data - Update data
   * @returns Updated user account
   */
  async updateMyAccount(data: any): Promise<any> {
    // TODO: Implement API call
    // PATCH /users/me
    throw new Error("UserResource.updateMyAccount() not implemented yet")
  }

  /**
   * Gets workspace members.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns List of workspace members
   */
  async getMembers(workspaceId: string): Promise<any[]> {
    return await this.client.request(`/teams/${workspaceId}/members`, {
      method: "GET",
    })
  }

  /**
   * Updates a workspace member.
   * @param workspaceId - Workspace ID
   * @param memberId - Member ID
   * @param data - Update data
   * @returns Updated member
   */
  async updateMember(
    workspaceId: string,
    memberId: string,
    data: any
  ): Promise<any> {
    // TODO: Implement API call
    // PATCH /teams/{team_id}/members/{member_id}
    throw new Error("UserResource.updateMember() not implemented yet")
  }

  /**
   * Deletes a workspace member.
   * @param workspaceId - Workspace ID
   * @param memberId - Member ID
   */
  async deleteMember(workspaceId: string, memberId: string): Promise<void> {
    // TODO: Implement API call
    // DELETE /teams/{team_id}/members/{member_id}
    throw new Error("UserResource.deleteMember() not implemented yet")
  }
}

