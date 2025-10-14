/**
 * @fileoverview Search resource for Superthread API.
 * Provides search operations across multiple entity types.
 */

import type { SuperthreadClient } from "./client.js"
import urlcat from "urlcat"
import { safeId } from "../utils.js"

/**
 * Search parameters for querying workspace entities
 */
export interface SearchParams {
  q: string // Search query (required)
  field?: "title" | "content" // Target fields
  types?: string[] // Filter by types: board, card, page, project, epic, note
  statuses?: string[] // Filter by statuses
  project_id?: string // Filter by specific project
  archived?: boolean // Include archived items
  grouped?: boolean // Return grouped results
  cursor?: string // Pagination cursor
}

export class SearchResource {
  constructor(private client: SuperthreadClient) {}

  /**
   * Execute a search query across workspace entities.
   * API: GET /:workspace/search
   *
   * @param workspaceId - Workspace ID (maps to team_id in API)
   * @param params - Search parameters including query, filters, and options
   * @returns API response (passed through to LLM)
   */
  async search(workspaceId: string, params: SearchParams): Promise<unknown> {
    const queryParams = new URLSearchParams()
    queryParams.append("query", params.q)

    if (params.field) queryParams.append("fields", params.field)
    if (params.types) queryParams.append("types", params.types.join(","))
    if (params.statuses) queryParams.append("statuses", params.statuses.join(","))
    if (params.project_id) queryParams.append("project_id", params.project_id)
    if (params.archived !== undefined) queryParams.append("archived", String(params.archived))
    if (params.grouped !== undefined) queryParams.append("grouped", String(params.grouped))
    if (params.cursor) queryParams.append("cursor", params.cursor)

    const path =
      urlcat("/:workspace/search", {
        workspace: safeId("workspaceId", workspaceId),
      }) + `?${queryParams.toString()}`
    return await this.client.request(path, { method: "GET" })
  }
}
