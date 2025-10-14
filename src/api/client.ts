/**
 * @fileoverview SuperThread API client with resource-based organization.
 * Provides a clean abstraction over the SuperThread REST API with automatic
 * terminology mapping from modern UI terms to legacy API terms.
 */

import { config } from "../config.js"
import { UserResource } from "./user.js"
import { ProjectResource } from "./projects.js"
import { SpaceResource } from "./spaces.js"
import { BoardResource } from "./boards.js"
import { CardResource } from "./cards.js"

/**
 * Main SuperThread API client.
 * Provides access to all resource endpoints through a clean interface.
 *
 * Uses the Resource-Based API Client Pattern to organize operations by domain:
 * - `client.user.*` - User and workspace member operations
 * - `client.projects.*` - Roadmap project (epic) operations
 * - `client.spaces.*` - Space (organizational container) operations
 * - `client.boards.*` - Board and kanban operations
 * - `client.cards.*` - Card operations
 * - etc.
 *
 * This pattern provides:
 * - **Namespacing**: Groups related operations logically
 * - **Discoverability**: IDE autocomplete shows organized methods
 * - **Scalability**: Clean organization as we grow to 60+ tools
 * - **Separation of concerns**: Each resource handles its domain
 *
 * Note: Resources are organizational wrappers, not caches. Each method call
 * makes a fresh API request.
 */
export class SuperThreadClient {
  private apiKey: string
  private baseUrl: string

  /** User and workspace member operations */
  public user: UserResource

  /** Roadmap project (epic) operations */
  public projects: ProjectResource

  /** Space (organizational container) operations */
  public spaces: SpaceResource

  /** Board and kanban operations */
  public boards: BoardResource

  /** Card operations */
  public cards: CardResource

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl

    this.user = new UserResource(this)
    this.projects = new ProjectResource(this)
    this.spaces = new SpaceResource(this)
    this.boards = new BoardResource(this)
    this.cards = new CardResource(this)
  }

  /**
   * Makes a request to the SuperThread API.
   * Handles authentication, error handling, and response parsing.
   *
   * @param path - API path (will be appended to baseUrl)
   * @param options - Fetch options
   * @returns Parsed JSON response
   */
  async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`

    const headers = new Headers(options.headers || {})
    headers.set("Authorization", `Bearer ${this.apiKey}`)
    headers.set("Content-Type", "application/json")

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SuperThread API error (${response.status}): ${errorText}`)
    }

    // Handle empty responses (204 No Content or empty body)
    const contentLength = response.headers.get("content-length")
    if (response.status === 204 || contentLength === "0") {
      return { success: true } as T
    }

    const text = await response.text()
    if (!text || text.trim() === "") {
      return { success: true } as T
    }

    return JSON.parse(text) as T
  }
}

/**
 * Creates a SuperThread API client using configuration from environment variables.
 * @returns Configured SuperThreadClient instance
 * @throws {Error} If API key is not configured
 */
export function createClient(): SuperThreadClient {
  if (!config.apiKey) {
    throw new Error(
      "SUPERTHREAD_API_KEY environment variable is required but not set. " +
        "Please add it to your MCP server configuration."
    )
  }

  return new SuperThreadClient(config.apiKey, config.baseUrl)
}
