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

/**
 * Project creation parameters
 */
export interface CreateProjectParams {
  title: string // Required
  list_id: string // Required - status list
  content?: string
  schema?: number
  icon?: unknown
  start_date?: number
  due_date?: number
  members?: Array<{ user_id: string; role: string }>
  owner_id?: string
  priority?: number
  cover_image?: unknown
}

/**
 * Project update parameters
 */
export interface UpdateProjectParams {
  title?: string
  list_id?: string
  owner_id?: string
  start_date?: number
  due_date?: number
  position?: number
  priority?: number
  archived?: boolean
  icon?: unknown
  cover_image?: unknown
}

/**
 * Project response wrapper
 */
export interface ProjectResponse {
  epic: Project
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

  /**
   * Creates a new roadmap project (epic).
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Project creation parameters
   * @returns Created project details
   */
  async create(workspaceId: string, params: CreateProjectParams): Promise<ProjectResponse> {
    return await this.client.request<ProjectResponse>(`/${workspaceId}/epics`, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing roadmap project.
   * Supports archiving via the archived parameter.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @param params - Project update parameters
   * @returns Updated project details
   */
  async update(
    workspaceId: string,
    projectId: string,
    params: UpdateProjectParams
  ): Promise<ProjectResponse> {
    return await this.client.request<ProjectResponse>(`/${workspaceId}/epics/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Permanently deletes a project (epic).
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param projectId - Project ID (maps to epic_id in API)
   * @returns Success response
   */
  async delete(workspaceId: string, projectId: string): Promise<{ success: boolean }> {
    return await this.client.request<{ success: boolean }>(`/${workspaceId}/epics/${projectId}`, {
      method: "DELETE",
    })
  }
}
