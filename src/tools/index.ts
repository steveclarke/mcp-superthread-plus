/**
 * @fileoverview Central tool registry.
 * Registers all MCP tools and prompts with the server instance.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerUserTools } from "./user.js"
import { registerCardTools } from "./cards.js"
import { registerProjectTools } from "./projects.js"
import { registerBoardTools } from "./boards.js"
import { registerSpaceTools } from "./spaces.js"
import { registerPageTools } from "./pages.js"
import { registerNoteTools } from "./notes.js"
import { registerCommentTools } from "./comments.js"
import { registerSearchTools } from "./search.js"
import { registerPrompts } from "./prompts.js"

/**
 * Registers all available MCP tools and prompts with the given server.
 * Includes user management, cards, boards, spaces, projects, pages, notes, comments, and search.
 *
 * @param server - The McpServer instance to register tools and prompts with
 */
export function registerAllTools(server: McpServer) {
  registerUserTools(server)
  registerCardTools(server)
  registerProjectTools(server)
  registerBoardTools(server)
  registerSpaceTools(server)
  registerPageTools(server)
  registerNoteTools(server)
  registerCommentTools(server)
  registerSearchTools(server)
  registerPrompts(server)
}

