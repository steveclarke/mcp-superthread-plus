/**
 * @fileoverview Configuration for MCP Superthread Plus server.
 * Loads settings from environment variables for API authentication and defaults.
 */

import { parseDelimitedString } from "./utils.js"

/**
 * Configuration interface for MCP Superthread Plus settings loaded from environment variables.
 */
export interface Config {
  /** Superthread API Personal Access Token for authentication */
  apiKey: string
  /** Superthread API base URL */
  baseUrl: string
  /** Set of enabled tool domains. Empty set means all domains are enabled. */
  enabledTools: Set<string>
}

/**
 * Default configuration values.
 * These are used when environment variables are not set.
 */
const DEFAULT_API_KEY = ""
const DEFAULT_BASE_URL = "https://api.superthread.com/v1"

/**
 * Available tool domains that can be enabled/disabled.
 * Used for type safety and IntelliSense in isDomainEnabled() calls.
 */
export const AVAILABLE_DOMAINS = [
  "users",
  "cards",
  "boards",
  "projects",
  "spaces",
  "sprints",
  "pages",
  "comments",
  "notes",
  "tags",
  "search",
] as const

/**
 * Type representing a valid tool domain name.
 */
export type ToolDomain = (typeof AVAILABLE_DOMAINS)[number]

// Parse enabled tools from environment variable
const enabledToolsList = parseDelimitedString(process.env.SUPERTHREAD_ENABLED_TOOLS, ",", (s) =>
  s.toLowerCase()
)

/**
 * Global configuration object loaded from environment variables.
 *
 * Environment variables:
 * - SUPERTHREAD_API_KEY: Personal Access Token from Superthread account settings (REQUIRED)
 * - SUPERTHREAD_API_BASE_URL: API base URL (optional, defaults to https://api.superthread.com/v1)
 * - SUPERTHREAD_ENABLED_TOOLS: Comma-separated list of tool domains to enable (optional, defaults to all)
 *   Available domains: users, cards, boards, projects, spaces, sprints, pages, comments, notes, tags, search
 */
export const config: Config = {
  apiKey: process.env.SUPERTHREAD_API_KEY || DEFAULT_API_KEY,
  baseUrl: process.env.SUPERTHREAD_API_BASE_URL || DEFAULT_BASE_URL,
  enabledTools: new Set(enabledToolsList),
}
