/**
 * @fileoverview Configuration for MCP SuperThread Plus server.
 * Loads settings from environment variables for API authentication and defaults.
 */

/**
 * Configuration interface for MCP SuperThread Plus settings loaded from environment variables.
 */
export interface Config {
  /** SuperThread API Personal Access Token for authentication */
  apiKey: string
  /** SuperThread API base URL */
  baseUrl: string
}

/**
 * Default configuration values.
 * These are used when environment variables are not set.
 */
const DEFAULT_API_KEY = ""
const DEFAULT_BASE_URL = "https://api.superthread.com/v1"

/**
 * Global configuration object loaded from environment variables.
 * Provides settings for SuperThread API authentication and defaults.
 *
 * Environment variables:
 * - SUPERTHREAD_API_KEY: Personal Access Token from SuperThread account settings (REQUIRED)
 * - SUPERTHREAD_API_BASE_URL: API base URL (optional, defaults to https://api.superthread.com/v1)
 *
 * Note: Workspace IDs are provided as parameters to individual tool calls, not in configuration.
 * Use the get_my_account tool to discover your available workspaces and their IDs.
 *
 * API Terminology Mapping:
 * The SuperThread API uses legacy terminology that differs from the UI:
 * - Workspace (UI) = team (API) - used as {team_id} in API paths
 * - Space (UI) = project (API) - /projects endpoint, {project_id}
 * - Project/Roadmap (UI) = epic (API) - {epic_id} parameters
 * - Status/Column (UI) = list (API) - {list_id} parameters
 *
 * Our tools use modern UI terminology, and the API client handles the mapping internally.
 */
export const config: Config = {
  apiKey: process.env.SUPERTHREAD_API_KEY || DEFAULT_API_KEY,
  baseUrl: process.env.SUPERTHREAD_API_BASE_URL || DEFAULT_BASE_URL,
}
