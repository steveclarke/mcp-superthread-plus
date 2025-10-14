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
 * Page API resource for managing pages.
 */
export class PageResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Creates a new page in a workspace.
   * API: POST /:workspace/pages
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Page creation parameters
   * @returns API response (passed through to LLM)
   */
  async create(workspaceId: string, params: CreatePageParams): Promise<unknown> {
    const path = urlcat("/:workspace/pages", {
      workspace: safeId("workspaceId", workspaceId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Updates an existing page.
   * API: PATCH /:workspace/pages/:page
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to update
   * @param params - Page update parameters
   * @returns API response (passed through to LLM)
   */
  async update(workspaceId: string, pageId: string, params: UpdatePageParams): Promise<unknown> {
    const path = urlcat("/:workspace/pages/:page", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    return await this.client.request(path, {
      method: "PATCH",
      body: JSON.stringify(params),
    })
  }

  /**
   * Retrieves a specific page by ID.
   * API: GET /:workspace/pages/:page
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to retrieve
   * @returns API response (passed through to LLM)
   */
  async get(workspaceId: string, pageId: string): Promise<unknown> {
    const path = urlcat("/:workspace/pages/:page", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Lists all pages in a workspace with optional filtering.
   * API: GET /:workspace/pages
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Optional filtering parameters
   * @returns API response (passed through to LLM)
   */
  async list(
    workspaceId: string,
    params?: {
      project_id?: string
      archived?: boolean
      updated_recently?: boolean
    }
  ): Promise<unknown> {
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

    return await this.client.request(path, {
      method: "GET",
    })
  }

  /**
   * Duplicates an existing page.
   * API: POST /:workspace/pages/:page/copy
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to duplicate
   * @param params - Duplication parameters
   * @returns API response (passed through to LLM)
   */
  async duplicate(
    workspaceId: string,
    pageId: string,
    params: DuplicatePageParams
  ): Promise<unknown> {
    const path = urlcat("/:workspace/pages/:page/copy", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    return await this.client.request(path, {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Archives or unarchives a page.
   * API: PUT /:workspace/pages/:page/archive
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to archive
   * @returns API response (passed through to LLM)
   */
  async archive(workspaceId: string, pageId: string): Promise<unknown> {
    const path = urlcat("/:workspace/pages/:page/archive", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    return await this.client.request(path, {
      method: "PUT",
    })
  }

  /**
   * Permanently deletes a page.
   * API: DELETE /:workspace/pages/:page
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param pageId - Page ID to delete
   * @returns API response (passed through to LLM)
   */
  async delete(workspaceId: string, pageId: string): Promise<unknown> {
    const path = urlcat("/:workspace/pages/:page", {
      workspace: safeId("workspaceId", workspaceId),
      page: safeId("pageId", pageId),
    })
    return await this.client.request(path, {
      method: "DELETE",
    })
  }
}
