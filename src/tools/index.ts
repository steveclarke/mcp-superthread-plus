/**
 * @fileoverview Central tool registry for MCP SuperThread Plus.
 * Registers all available tools with the MCP server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerUserTools } from "./user.js"

/**
 * Registers all tools with the MCP server.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerAllTools(server: McpServer): void {
  registerUserTools(server)
}
