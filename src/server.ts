/**
 * @fileoverview MCP Server implementation for SuperThread operations.
 * Provides a Model Context Protocol server that exposes SuperThread project management tools.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerAllTools } from "./tools/index.js"
import packageJson from "../package.json" with { type: "json" }

/**
 * MCP Server instance for SuperThread project management.
 * Handles cards, boards, spaces, projects, pages, notes, comments, and search.
 */
const mcpServer = new McpServer({
  name: "mcp-superthread-plus",
  version: packageJson.version,
})

// Register all tools with the server
registerAllTools(mcpServer)

/**
 * Starts the MCP SuperThread Plus server and connects it to stdio transport.
 * The server will handle tool requests for SuperThread operations via stdin/stdout.
 *
 * @throws {Error} If server connection fails
 */
export async function startServer() {
  // Log startup information
  console.error(`MCP SuperThread Plus Server starting...`)

  const transport = new StdioServerTransport()
  await mcpServer.connect(transport)
  console.error("MCP SuperThread Plus Server running on stdio")
}
