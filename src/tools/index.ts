/**
 * @fileoverview Central tool registry for MCP Superthread Plus.
 * Registers all available tools with the MCP server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerUserTools } from "./user.js"
import { registerProjectTools } from "./projects.js"
import { registerSpaceTools } from "./spaces.js"
import { registerBoardTools } from "./boards.js"
import { registerCardTools } from "./cards.js"
import { registerSprintTools } from "./sprints.js"
import { registerSearchTools } from "./search.js"
import { registerPageTools } from "./pages.js"
import { registerCommentTools } from "./comments.js"
import { registerNoteTools } from "./notes.js"
import { registerTagTools } from "./tags.js"
import { config, type ToolDomain } from "../config.js"

/**
 * Checks if a tool domain should be enabled.
 * If enabledTools is empty (not configured), all domains are enabled.
 * Otherwise, only domains in the set are enabled.
 *
 * @param domain - The domain name to check (type-safe with IntelliSense)
 * @returns True if the domain should be enabled
 */
function isDomainEnabled(domain: ToolDomain): boolean {
  // If no domains are specified, enable all (backward compatible)
  if (config.enabledTools.size === 0) {
    return true
  }
  return config.enabledTools.has(domain)
}

/**
 * Registers all tools with the MCP server.
 * Only registers tool domains that are enabled via SUPERTHREAD_ENABLED_TOOLS configuration.
 * If SUPERTHREAD_ENABLED_TOOLS is not set, all domains are enabled (backward compatible).
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerAllTools(server: McpServer): void {
  if (isDomainEnabled("users")) {
    registerUserTools(server)
  }
  if (isDomainEnabled("projects")) {
    registerProjectTools(server)
  }
  if (isDomainEnabled("spaces")) {
    registerSpaceTools(server)
  }
  if (isDomainEnabled("boards")) {
    registerBoardTools(server)
  }
  if (isDomainEnabled("cards")) {
    registerCardTools(server)
  }
  if (isDomainEnabled("sprints")) {
    registerSprintTools(server)
  }
  if (isDomainEnabled("search")) {
    registerSearchTools(server)
  }
  if (isDomainEnabled("pages")) {
    registerPageTools(server)
  }
  if (isDomainEnabled("comments")) {
    registerCommentTools(server)
  }
  if (isDomainEnabled("notes")) {
    registerNoteTools(server)
  }
  if (isDomainEnabled("tags")) {
    registerTagTools(server)
  }
}
