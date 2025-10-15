# MCP Superthread Plus Server

An unofficial, community-maintained MCP server for Superthread project management integration. Provides AI assistants with the ability to manage tasks, projects, documentation, and team collaboration through the Superthread platform.

> **Note:** This is an independent project and is not officially affiliated with or endorsed by Superthread.

## Why?

Superthread is a powerful project management platform. This MCP server enables AI assistants to manage cards, boards, documentation, and more through natural conversation.

Perfect for teams using AI to streamline project setup, task creation from requirements, and workspace automation.

## Features

- 📋 **Card Management** - Create and manage cards with full workflow control (tags, checklists, relationships, assignments)
- 📊 **Boards & Spaces** - Organize work with customizable boards and organizational spaces
- 🗺️ **Roadmap Projects** - Plan and track large initiatives (epics)
- 📝 **Documentation** - Create and maintain pages
- 💬 **Collaboration** - Thread discussions on cards and pages with comments
- 🔍 **Search** - Find anything across all entities
- 🎯 **Meeting Notes** - Manage meeting notes and transcriptions

## Installation

Add to your MCP settings file (e.g., Claude Desktop config):

```json
{
  "mcpServers": {
    "superthread": {
      "command": "npx",
      "args": ["-y", "mcp-superthread-plus"],
      "env": {
        "SUPERTHREAD_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Requirements:** Node.js 22+

### Getting Your API Key

1. Log into Superthread → Settings & Preferences → Account → API Access
2. Create token
3. Add to your MCP config above

## Configuration

All configuration is done via environment variables:

| Variable                   | Required | Default                          | Description                                    |
| -------------------------- | -------- | -------------------------------- | ---------------------------------------------- |
| `SUPERTHREAD_API_KEY`      | ✅ Yes    | -                                | Personal Access Token from Superthread account |
| `SUPERTHREAD_API_BASE_URL` | No       | `https://api.superthread.com/v1` | API endpoint (only change for testing)         |

### Discovering Your Workspace IDs

Workspace IDs are provided as parameters when calling tools. After setup, use the `user_get_my_account` tool to discover your available workspaces:

```
User: Get my Superthread account info
AI: Your account: user@example.com
    Workspaces available:
    - Main Team (ID: t4k7Wa2e)
    - Side Project (ID: t9x3Ym5p)
```

## Available Tools

#### Users & Workspace Management

| Tool                  | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `user_get_my_account` | Get current user account info and workspace memberships |
| `user_get_members`    | List all members of a workspace                         |

#### Card Management

| Tool                         | Description                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| `card_create`                | Create new card/task                                          |
| `card_update`                | Update card properties (title, status, priority, dates, etc.) |
| `card_get`                   | Get card details                                              |
| `card_duplicate`             | Clone an existing card                                        |
| `card_get_assigned`          | Get cards assigned to a specific user                         |
| `card_delete`                | Delete card permanently                                       |
| `card_add_related`           | Link cards with relationships (blocks, related, duplicates)   |
| `card_remove_related`        | Remove card relationship                                      |
| `card_get_tags`              | List all available tags in workspace                          |
| `card_add_tags`              | Add existing tags to a card (tags must already exist)         |
| `card_remove_tag`            | Remove tag from card                                          |
| `card_add_member`            | Assign member to card                                         |
| `card_remove_member`         | Remove member from card                                       |
| `card_create_checklist`      | Create checklist on card                                      |
| `card_add_checklist_item`    | Add item to checklist                                         |
| `card_update_checklist_item` | Update checklist item (check/uncheck, edit text)              |
| `card_delete_checklist_item` | Delete checklist item                                         |
| `card_update_checklist`      | Update checklist title                                        |
| `card_delete_checklist`      | Delete entire checklist from card                             |

#### Project Management (Roadmap)

| Tool                     | Description                       |
| ------------------------ | --------------------------------- |
| `project_get_all`        | List all roadmap projects (epics) |
| `project_get`            | Get project details               |
| `project_create`         | Create new roadmap project        |
| `project_update`         | Update project properties         |
| `project_delete`         | Delete project permanently        |
| `project_add_related`    | Link card to roadmap project      |
| `project_remove_related` | Remove card from roadmap project  |

#### Board Management

| Tool                | Description                            |
| ------------------- | -------------------------------------- |
| `board_get_all`     | List all boards in a space             |
| `board_get`         | Get board details with lists and cards |
| `board_create`      | Create new board                       |
| `board_update`      | Update board properties                |
| `board_duplicate`   | Clone an existing board                |
| `board_delete`      | Delete board permanently               |
| `board_create_list` | Create status column/list on board     |
| `board_update_list` | Update list/column properties          |

#### Sprint Management

| Tool             | Description                           |
| ---------------- | ------------------------------------- |
| `sprint_get_all` | List all sprints for a space          |
| `sprint_get`     | Get sprint details including list IDs |

#### Space Management

| Tool            | Description                                 |
| --------------- | ------------------------------------------- |
| `space_get_all` | List all spaces (organizational containers) |
| `space_get`     | Get space details                           |

#### Page Management

| Tool             | Description                        |
| ---------------- | ---------------------------------- |
| `page_create`    | Create new documentation page      |
| `page_update`    | Update page properties and content |
| `page_get`       | Get page details                   |
| `page_get_all`   | List all pages in workspace        |
| `page_duplicate` | Clone an existing page             |
| `page_archive`   | Archive page (soft delete)         |
| `page_delete`    | Delete page permanently            |

#### Note Management

| Tool           | Description             |
| -------------- | ----------------------- |
| `note_create`  | Create meeting note     |
| `note_get`     | Get note details        |
| `note_get_all` | List all notes          |
| `note_delete`  | Delete note permanently |

#### Comments & Collaboration

| Tool                   | Description                      |
| ---------------------- | -------------------------------- |
| `comment_create`       | Create comment on card or page   |
| `comment_update`       | Edit existing comment            |
| `comment_get`          | Get comment details with replies |
| `comment_delete`       | Delete comment permanently       |
| `comment_reply`        | Reply to comment (create thread) |
| `comment_get_replies`  | Get all replies to a comment     |
| `comment_update_reply` | Edit a reply                     |
| `comment_delete_reply` | Delete a reply                   |

**Note:** Comment tools support @mentions - you can ask the AI to mention team members by name in comments.

#### Search

| Tool         | Description                                  |
| ------------ | -------------------------------------------- |
| `search_get` | Search across boards, cards, pages, and more |

## Usage Examples

### Initial Setup - Discover Your Workspaces

```
User: Get my Superthread account info
AI: *calls user_get_my_account*
→ Your account: user@example.com
→ Workspaces available:
  - Main Team 
  - Side Project
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
User: Create tasks for implementing user authentication
AI: Created 5 tasks:
- Set up auth provider (High priority, 8 points)
- Design login UI (Medium, 5 points)
- Implement JWT tokens (High, 8 points)
- Add password reset flow (Medium, 5 points)
- Write auth tests (Low, 3 points)
```

### Manage Cards with Checklists

```
User: Add a checklist to card 123 for deployment steps
AI: *creates checklist with items*
✓ Created deployment checklist:
  - [ ] Run tests
  - [ ] Update changelog
  - [ ] Build production bundle
  - [ ] Deploy to staging
  - [ ] Deploy to production
```

### Collaborate with Comments

```
User: Comment on card 456 and mention Sarah Chen: "Can you review the API changes?"
AI: *creates comment with mention*
✓ Added comment with mention to @Sarah Chen
```

## Requirements

- **Node.js** 22+
- **Superthread account** with API access
- **Personal Access Token** from Superthread account settings

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

### Running Locally

Configure your MCP client to run from your local development directory:

```json
{
  "mcpServers": {
    "superthread": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-superthread-plus/dist/index.js"],
      "env": {
        "SUPERTHREAD_API_KEY": "your-token"
      }
    }
  }
}
```

### Architecture

This server uses a composition-based API client architecture with resource classes for each domain (cards, boards, projects, etc.). The client handles authentication, error handling, and automatic terminology mapping between Superthread's modern UI terms and legacy API terms.

**For contributors:** See [`docs/contributing/ARCHITECTURE.md`](docs/contributing/ARCHITECTURE.md) for detailed architectural information and [`docs/contributing/API-REFERENCE.md`](docs/contributing/API-REFERENCE.md) for API terminology mapping.

**Important notes:** See [`docs/NOTES.md`](docs/NOTES.md) for information about API quirks, limitations, and undocumented endpoints.

## Contributing

Contributions welcome! We're focused on comprehensive API coverage with full read/write capabilities.

**Areas for contribution:**
- Enhanced response filtering and formatting
- Performance optimizations
- Documentation improvements

## License

MIT
