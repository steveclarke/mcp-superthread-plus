/**
 * @fileoverview Project (Roadmap) resource for SuperThread API.
 * Provides roadmap project/epic operations.
 *
 * Note: UI "Projects" map to API "epics" (roadmap projects, not spaces).
 * Spaces use the /projects endpoint (confusing terminology!).
 */

import type { SuperThreadClient } from "./client.js"

/**
 * Project (epic) information from SuperThread API
 */
export interface Project {
  id: string
  team_id: string
  title: string
  content: string
  status: string
  priority: number
  owner_id: string
  start_date?: number
  due_date?: number
  completed_date?: number
  time_created: number
  time_updated: number
}

export class ProjectResource {
  constructor(private client: SuperThreadClient) {}

  /**
   * Gets all roadmap projects (epics) in a workspace.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @returns List of projects
   */
  async list(workspaceId: string): Promise<Project[]> {
    return await this.client.request<Project[]>(`/${workspaceId}/epics`, {
      method: "GET",
    })
  }

  /**
   * Gets a specific roadmap project.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @returns Project details
   */
  async get(workspaceId: string, projectId: string): Promise<Project> {
    return await this.client.request<Project>(`/${workspaceId}/epics/${projectId}`, {
      method: "GET",
    })
  }
}
