/**
 * @fileoverview Pages API client for Superthread.
 * Handles page operations including creation, retrieval, and management.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

/**
 * Page icon configuration
 */
export interface PageIcon {
  type: string
  src?: string
  blurhash?: string
  color?: string
  emoji?: string
}

/**
 * Page cover image configuration
 */
export interface PageCoverImage {
  type: string
  src?: string
  blurhash?: string
  color?: string
  emoji?: string
  positionY?: number
  object_fit?: string
}

/**
 * Parameters for creating a new page
 */
export interface CreatePageParams {
  project_id: string
  title?: string
  content?: string
  schema?: number
  font?: string
  cover_image?: PageCoverImage
  icon?: PageIcon
  parent_page_id?: string | null
  position?: number | null
  is_public?: boolean | null
}

/**
 * Public settings for a page
 */
export interface PagePublicSettings {
  url: string
  robots: string[]
}

/**
 * Parameters for updating a page
 */
export interface UpdatePageParams {
  title?: string | null
  font?: string | null
  project_id?: string | null
  cover_image?: PageCoverImage
  icon?: PageIcon
  is_public?: boolean | null
  parent_page_id?: string | null
  position?: number | null
  public_settings?: PagePublicSettings
  archived?: boolean | null
  hide_table_of_contents?: boolean | null
  hide_subpages?: boolean | null
}

/**
 * Parameters for duplicating a page
 */
export interface DuplicatePageParams {
  project_id: string
  title?: string | null
  parent_page_id?: string | null
  position?: number | null
}

/**
 * Page response object
 */
export interface Page {
  id: string
  alias_id?: string
  title: string
  font?: string
  icon?: PageIcon
  content?: string
  schema?: number
  collaboration?: {
    token: string
  }
  project_id: string
  cover_image?: PageCoverImage
  user_id: string
  user_id_updated?: string
  user?: unknown
  user_updated?: unknown
  team_id: string
  time_created: number
  time_updated: number
  members?: Array<{
    user_id: string
    assigned_date: number
    role: string
  }>
  bookmarked?: boolean
  archived?: {
    user_id: string
    time_archived: number
    parent_page_id?: string
  }
  is_public?: boolean
  public_settings?: {
    url: string
    robots: string[]
  }
  total_comments?: number
  is_watching?: boolean
  is_bookmarked?: boolean
  hide_table_of_contents?: boolean
  hide_subpages?: boolean
}

/**
 * Page API resource for managing pages.
 */
export class PageResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new page in a workspace.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Page creation parameters
   * @returns Created page details
   */
  async create(workspaceId: string, params: CreatePageParams): Promise<Page> {
    const path = urlcat("/:workspace/pages", {
      workspace: safeId("workspaceId", workspaceId),
    })
    const response = await this.client.request<{ page: Page }>(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.page
  }

  /**
   * Updates an existing page.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to update
   * @param params - Page update parameters
   * @returns Updated page details
   */
  async update(workspaceId: string, pageId: string, params: UpdatePageParams): Promise<Page> {
    const path = urlcat("/:workspace/pages/:page", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    const response = await this.client.request<{ page: Page }>(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
    return response.page
  }

  /**
   * Retrieves a specific page by ID.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to retrieve
   * @returns Page details
   */
  async get(workspaceId: string, pageId: string): Promise<Page> {
    const path = urlcat("/:workspace/pages/:page", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    const response = await this.client.request<{ page: Page }>(path, {
      method: "GET",
    })
    return response.page
  }

  /**
   * Lists all pages in a workspace with optional filtering.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Optional filtering parameters
   * @returns Array of pages
   */
  async list(
    workspaceId: string,
    params?: {
      project_id?: string
      archived?: boolean
      updated_recently?: boolean
    }
  ): Promise<Page[]> {
    const queryParams = new URLSearchParams()
    if (params?.project_id) queryParams.append("project_id", params.project_id)
    if (params?.archived !== undefined) queryParams.append("archived", String(params.archived))
    if (params?.updated_recently !== undefined)
      queryParams.append("updated_recently", String(params.updated_recently))

    const queryString = queryParams.toString()
    const path =
      urlcat("/:workspace/pages", {
        workspace: safeId("workspaceId", workspaceId),
      }) + (queryString ? `?${queryString}` : "")

    const response = await this.client.request<{ pages: Page[] }>(path, {
      method: "GET",
    })
    return response.pages
  }

  /**
   * Duplicates an existing page.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to duplicate
   * @param params - Duplication parameters
   * @returns Duplicated page details
   */
  async duplicate(workspaceId: string, pageId: string, params: DuplicatePageParams): Promise<Page> {
    const path = urlcat("/:workspace/pages/:page/copy", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    const response = await this.client.request<{ page: Page }>(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.page
  }

  /**
   * Archives or unarchives a page.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to archive
   * @returns Archived page details
   */
  async archive(workspaceId: string, pageId: string): Promise<Page> {
    const path = urlcat("/:workspace/pages/:page/archive", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    const response = await this.client.request<{ page: Page }>(path, {
      method: "PUT",
    })
    return response.page
  }

  /**
   * Permanently deletes a page.
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to delete
   * @returns Success response
   */
  async delete(workspaceId: string, pageId: string): Promise<{ success: boolean }> {
    const path = urlcat("/:workspace/pages/:page", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    return await this.client.request<{ success: boolean }>(path, {
      method: "DELETE",
    })
  }
}
