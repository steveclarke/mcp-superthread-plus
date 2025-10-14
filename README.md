# MCP Superthread Plus Server

An MCP server for Superthread project management integration. Provides AI assistants with the ability to manage tasks, projects, documentation, and team collaboration through the Superthread platform.

## Why?

Superthread is a powerful project management platform combining tasks, boards, documentation, and AI meeting notes. This MCP server enables AI assistants to:

- Create and manage tasks/cards with full workflow control
- Organize work with boards, spaces, and roadmap projects
- Maintain documentation with pages and wikis
- Facilitate collaboration through comments and discussions
- Search across all project entities
- Configure entire workspaces programmatically

Perfect for teams using AI to streamline project setup, task creation from requirements, and workspace automation.

## Features

- 📋 **Task Management** - Create, update, assign, and track cards with relationships and tags
- 📊 **Boards & Spaces** - Organize work with customizable boards and organizational spaces
- 🗺️ **Roadmap Projects** - Plan and track large initiatives (epics)
- 📝 **Documentation** - Create and maintain pages/wikis with full content management
- 💬 **Comments & Collaboration** - Thread discussions on cards and pages
- 🎯 **AI Meeting Notes** - Manage transcribed meeting notes
- 🔍 **Global Search** - Find anything across your workspace
- 🤖 **AI Prompts** - Screenshot-to-tasks workflow for rapid task creation

## Installation

### Public Installation (Coming Soon)

Once published to NPM, you'll be able to install via `npx`:

```json
{
  "mcpServers": {
    "Superthread": {
      "command": "npx",
      "args": ["-y", "mcp-superthread-plus"],
      "env": {
        "SUPERTHREAD_API_KEY": "your-personal-access-token"
      }
    }
  }
}
```

### Team Distribution (Before NPM Publication)

For distributing to team members who don't have development tools:

1. **Create distribution package:**
   ```bash
   pnpm run pack:dist
   ```
   This creates `mcp-superthread-plus-X.X.X.tgz`

2. **Share the tarball** with team members (via shared drive, email, etc.)

3. **Team members install:**
   ```bash
   npm install -g ~/path/to/mcp-superthread-plus-0.1.0.tgz
   ```

4. **Configure MCP client** (see `DISTRIBUTION.md` for detailed instructions)

For complete team distribution instructions, see **`DISTRIBUTION.md`**.

### Getting Your API Key

**API Key**: Go to Superthread → Account Settings → API → Create Personal Access Token

**Workspace IDs**: After setup, use the `get_my_account` tool to see all your workspaces and their IDs. You'll provide the workspace ID when calling specific tools.

## Configuration

All configuration is done via environment variables:

| Variable                   | Required | Default                          | Description                                    |
| -------------------------- | -------- | -------------------------------- | ---------------------------------------------- |
| `SUPERTHREAD_API_KEY`      | ✅ Yes    | -                                | Personal Access Token from Superthread account |
| `SUPERTHREAD_API_BASE_URL` | No       | `https://api.superthread.com/v1` | API endpoint (only change for testing)         |

**Note:** Workspace IDs are not configured here. Instead, they're provided as parameters when calling tools. Use `get_my_account` to discover your available workspaces.

## Available Tools

> **Development Note**: This MCP server is under active development. We're implementing tools incrementally to establish solid patterns before scaling. Currently **3 tools** are available, with more being added based on usage needs.

### User & Workspace Management (2 tools implemented)
- ✅ `user_get_my_account` - Get current user info and workspace memberships
- ✅ `user_get_members` - Get all members of a workspace

### Card Management (1 tool implemented)
- ✅ `card_create` - Create new card/task

### Planned Tools (57 remaining)

See **`docs/tool-names.md`** for the complete list of 60 planned tools with their implementation status. Tools will be added incrementally as patterns are refined and tested.

## Usage Examples

### Initial Setup - Discover Your Workspaces
```
User: Get my Superthread account info
AI: *calls get_my_account*
→ Your account: user@example.com
→ Workspaces available:
  - Main Team (ID: t4k7Wa2e)
  - Side Project (ID: t9x3Ym5p)
```

### Create Workspace Structure
```
User: Set up a new project workspace
AI: I'll create the structure:
1. Creating space "Q1 2025 Launch"...
2. Creating boards: Development, Design, Marketing...
3. Adding lists: To Do, In Progress, Review, Done...
✓ Workspace ready! Space ID: space_789
```

### Task Creation from Requirements
```
User: /screenshot-to-tasks
[Describes features from a design mockup]
AI: Created 8 tasks:
- Implement user authentication (High priority, 8 points)
- Design dashboard layout (Medium, 5 points)
- Set up database schema (High, 13 points)
...
```

## Superthread API Terminology

Superthread's API uses legacy terminology that differs from the UI. This server handles the mapping automatically:

| UI Term           | API Term  | Used In                  |
| ----------------- | --------- | ------------------------ |
| Workspace         | `team`    | API paths as `{team_id}` |
| Space             | `project` | `/projects` endpoint     |
| Project (Roadmap) | `epic`    | Epic operations          |
| Status/Column     | `list`    | Board lists              |

You use modern UI terminology in all tools; the server handles translation internally.

## Development

### Setup
```bash
git clone https://github.com/steveclarke/mcp-superthread-plus.git
cd mcp-superthread-plus
pnpm install
pnpm run build
```

### Commands
```bash
# Watch mode for development
pnpm run dev

# Build
pnpm run build

# Test
pnpm run test

# Lint
pnpm run lint
pnpm run lint:fix

# Format
pnpm run format
```

### Running Locally in MCP
Configure your MCP client to run from your local development directory:

```json
{
  "mcpServers": {
    "Superthread": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-superthread-plus/dist/index.js"],
      "env": {
        "SUPERTHREAD_API_KEY": "your-token"
      }
    }
  }
}
```

## Architecture

See `docs/architecture.md` for detailed information about:
- API abstraction layer design
- Resource-based client organization
- Error handling strategy
- Authentication flow

See `docs/terminology-mapping.md` for the complete UI → API terminology mapping reference.

## Requirements

- **Node.js** 22+
- **Superthread account** with API access
- **Personal Access Token** from Superthread account settings

## Contributing

Contributions welcome! We're building this incrementally with a focus on quality:

**Current Focus:**
- Refining patterns for the 3 implemented tools
- Adding new tools one-by-one using proven patterns
- Comprehensive test coverage for implemented tools

**Future Areas:**
- Implement remaining 57 planned tools (see `docs/tool-names.md`)
- Enhanced response filtering/formatting
- Performance optimizations
- Additional prompts (like screenshot-to-tasks)

## License

MIT
