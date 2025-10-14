#!/usr/bin/env node

/**
 * @fileoverview Entry point for the MCP Superthread Plus server.
 * Starts the Model Context Protocol server for Superthread project management operations.
 */

import { startServer } from "./server.js"

// Start the MCP Superthread Plus server
startServer().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
