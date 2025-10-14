/**
 * @fileoverview MCP Server implementation for Superthread operations.
 * Provides a Model Context Protocol server that exposes Superthread project management tools.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerAllTools } from "./tools/index.js"
import packageJson from "../package.json" with { type: "json" }

/**
 * MCP Server instance for Superthread project management.
 * Handles cards, boards, spaces, projects, pages, notes, comments, and search.
 */
const mcpServer = new McpServer({
  name: "mcp-superthread-plus",
  version: packageJson.version,
})

// Register all tools with the server
registerAllTools(mcpServer)

/**
 * Starts the MCP Superthread Plus server and connects it to stdio transport.
 * The server will handle tool requests for Superthread operations via stdin/stdout.
 *
 * @throws {Error} If server connection fails
 */
export async function startServer() {
  // Log startup information
  console.error(`MCP Superthread Plus Server starting...`)

  const transport = new StdioServerTransport()
  await mcpServer.connect(transport)
  console.error("MCP Superthread Plus Server running on stdio")
}
