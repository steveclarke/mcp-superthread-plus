#!/usr/bin/env node

/**
 * @fileoverview Entry point for the MCP SuperThread Plus server.
 * Starts the Model Context Protocol server for SuperThread project management operations.
 */

import { startServer } from "./server.js"

// Start the MCP SuperThread Plus server
startServer().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
