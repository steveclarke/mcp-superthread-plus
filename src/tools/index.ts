/**
 * @fileoverview Central tool registry for MCP SuperThread Plus.
 * Registers all available tools with the MCP server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerUserTools } from "./user.js"

/**
 * Registers all tools with the MCP server.
 * Currently implements 2 working tools: user_get_my_account and user_get_members.
 *
 * @param server - The McpServer instance to register tools with
 */
export function registerAllTools(server: McpServer): void {
  registerUserTools(server)
}
