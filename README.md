# MCP SuperThread Plus Server

An MCP server for SuperThread project management integration. Provides AI assistants with the ability to manage tasks, projects, documentation, and team collaboration through the SuperThread platform.

## Why?

SuperThread is a powerful project management platform combining tasks, boards, documentation, and AI meeting notes. This MCP server enables AI assistants to:

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

Add to your MCP configuration file (e.g., `~/.cursor/mcp.json` for Cursor):

```json
{
  "mcpServers": {
    "SuperThread": {
      "command": "npx",
      "args": ["-y", "mcp-superthread-plus"],
      "env": {
        "SUPERTHREAD_API_KEY": "your-personal-access-token"
      }
    }
  }
}
```

### Getting Your API Key

**API Key**: Go to SuperThread → Account Settings → API → Create Personal Access Token

**Workspace IDs**: After setup, use the `get_my_account` tool to see all your workspaces and their IDs. You'll provide the workspace ID when calling specific tools.

## Configuration

All configuration is done via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPERTHREAD_API_KEY` | ✅ Yes | - | Personal Access Token from SuperThread account |
| `SUPERTHREAD_API_BASE_URL` | No | `https://api.superthread.com/v1` | API endpoint (only change for testing) |

**Note:** Workspace IDs are not configured here. Instead, they're provided as parameters when calling tools. Use `get_my_account` to discover your available workspaces.

## Available Tools

### User & Team Management (5 tools)
- `get_my_account` - Get current user info and team memberships
- `update_my_account` - Update user profile
- `get_team_members` - List workspace members
- `update_team_member` - Modify member roles
- `delete_team_member` - Remove team member

### Cards/Tasks (12 tools)
- `create_card` - Create new task/card
- `update_card` - Modify card properties
- `get_card` - Get card details
- `duplicate_card` - Clone a card
- `get_cards_assigned_to_user` - List user's tasks
- `add_related_card` - Link cards (blocks/blocked_by/relates_to)
- `remove_related_card` - Unlink cards
- `archive_card` - Archive card
- `delete_card` - Permanently delete card
- `get_tags` - List available tags
- `add_tags_to_card` - Tag a card
- `remove_tag_from_card` - Remove tag

### Roadmap Projects (8 tools)
- `create_project` - Create roadmap project (epic)
- `update_project` - Modify project
- `get_project` - Get project details
- `get_projects` - List all projects
- `add_related_card` - Link card to project
- `remove_related_card` - Unlink card
- `archive_project` - Archive project
- `delete_project` - Delete project

### Boards & Lists (8 tools)
- `create_board` - Create new board
- `update_board` - Modify board
- `create_list` - Add status column to board
- `update_list` - Modify list/status
- `duplicate_board` - Clone board
- `get_board` - Get board details
- `get_boards` - List boards
- `delete_board` - Delete board

### Spaces (7 tools)
- `create_space` - Create organizational space
- `update_space` - Modify space
- `get_space` - Get space details
- `get_spaces` - List spaces
- `add_member_to_space` - Add team member
- `remove_member_from_space` - Remove member
- `delete_space` - Delete space

### Pages/Docs (7 tools)
- `create_page` - Create documentation page
- `update_page` - Modify page content
- `get_page` - Get page content
- `duplicate_page` - Clone page
- `get_pages` - List pages
- `archive_page` - Archive page
- `delete_page` - Delete page

### Notes (4 tools)
- `create_note` - Create meeting note
- `get_note` - Get note details
- `get_notes` - List notes
- `delete_note` - Delete note

### Comments (8 tools)
- `create_comment` - Add comment to card/page
- `edit_comment` - Edit comment
- `get_comment` - Get comment details
- `get_all_replies_to_comment` - Get thread replies
- `reply_to_comment` - Reply to comment
- `edit_reply` - Edit reply
- `delete_reply` - Delete reply
- `delete_comment` - Delete comment

### Search (1 tool)
- `get_search_results` - Global search across all entities

## Available Prompts

### `/screenshot-to-tasks`
Convert screenshot content into actionable SuperThread tasks with proper structure and priorities.

**Parameters:**
- `screenshot_description` - Description of screenshot content
- `board_id` - Target board (optional)
- `list_id` - Target status column (optional)
- `project_context` - Project context (optional)

**Use case:** AI analyzes screenshot descriptions and creates well-structured task breakdowns with titles, descriptions, priorities, and estimates ready for import.

## Usage Examples

### Initial Setup - Discover Your Workspaces
```
User: Get my SuperThread account info
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

## SuperThread API Terminology

SuperThread's API uses legacy terminology that differs from the UI. This server handles the mapping automatically:

| UI Term | API Term | Used In |
|---------|----------|---------|
| Workspace | `team` | API paths as `{team_id}` |
| Space | `project` | `/projects` endpoint |
| Project (Roadmap) | `epic` | Epic operations |
| Status/Column | `list` | Board lists |

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
    "SuperThread": {
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
- **SuperThread account** with API access
- **Personal Access Token** from SuperThread account settings

## Contributing

Contributions welcome! Areas for improvement:
- Implement remaining tool API calls (currently placeholders)
- Add comprehensive test coverage
- Enhance error handling
- Add response filtering/formatting
- Performance optimizations

## License

MIT
