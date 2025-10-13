/**
 * @fileoverview SuperThread API client with resource-based organization.
 * Provides a clean abstraction over the SuperThread REST API with automatic
 * terminology mapping from modern UI terms to legacy API terms.
 */

import { config } from "../config.js"
import { UserResource } from "./user.js"

/**
 * Main SuperThread API client.
 * Provides access to all resource endpoints through a clean interface.
 */
export class SuperThreadClient {
  private apiKey: string
  private baseUrl: string

  public user: UserResource

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl

    this.user = new UserResource(this)
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

    return (await response.json()) as T
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
