/**
 * @fileoverview Configuration for MCP Superthread Plus server.
 * Loads settings from environment variables for API authentication and defaults.
 */

/**
 * Configuration interface for MCP Superthread Plus settings loaded from environment variables.
 */
export interface Config {
  /** Superthread API Personal Access Token for authentication */
  apiKey: string
  /** Superthread API base URL */
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
 *
 * Environment variables:
 * - SUPERTHREAD_API_KEY: Personal Access Token from Superthread account settings (REQUIRED)
 * - SUPERTHREAD_API_BASE_URL: API base URL (optional, defaults to https://api.superthread.com/v1)
 */
export const config: Config = {
  apiKey: process.env.SUPERTHREAD_API_KEY || DEFAULT_API_KEY,
  baseUrl: process.env.SUPERTHREAD_API_BASE_URL || DEFAULT_BASE_URL,
}
