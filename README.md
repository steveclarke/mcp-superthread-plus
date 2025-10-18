# MCP Superthread Plus Server

A community-maintained MCP server for [Superthread](https://superthread.com), a powerful project management platform. This server enables AI assistants to manage cards, boards, documentation, and more through natural conversation—perfect for teams using AI to streamline project setup, task creation from requirements, and workspace automation.

## Table of Contents

- [MCP Superthread Plus Server](#mcp-superthread-plus-server)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [⚠️ Important: Pre-Release Software](#️-important-pre-release-software)
  - [Installation](#installation)
    - [Getting Your API Key](#getting-your-api-key)
  - [Configuration](#configuration)
    - [Selective Tool Enabling](#selective-tool-enabling)
    - [Smart Card Positioning](#smart-card-positioning)
  - [Available Tools](#available-tools)
      - [Users \& Workspace Management](#users--workspace-management)
      - [Card Management](#card-management)
      - [Tag Management](#tag-management)
      - [Project Management (Roadmap)](#project-management-roadmap)
      - [Board Management](#board-management)
      - [Sprint Management](#sprint-management)
      - [Space Management](#space-management)
      - [Page Management](#page-management)
      - [Note Management](#note-management)
      - [Comments \& Collaboration](#comments--collaboration)
      - [Search](#search)
  - [Usage Examples](#usage-examples)
    - [Initial Setup - Discover Your Workspaces](#initial-setup---discover-your-workspaces)
    - [Create Workspace Structure](#create-workspace-structure)
    - [Task Creation from Requirements](#task-creation-from-requirements)
    - [Manage Cards with Checklists](#manage-cards-with-checklists)
    - [Collaborate with Comments](#collaborate-with-comments)
  - [Requirements](#requirements)
  - [Development](#development)
    - [Setup](#setup)
    - [Commands](#commands)
    - [Running Locally](#running-locally)
    - [Architecture](#architecture)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- 📋 **Card Management** - Create and manage cards with full workflow control (tags, checklists, relationships, assignments)
- 📊 **Boards & Spaces** - Organize work with customizable boards and organizational spaces
- 🗺️ **Roadmap Projects** - Plan and track large initiatives (epics)
- 📝 **Documentation** - Create and maintain pages
- 💬 **Collaboration** - Thread discussions on cards and pages with comments
- 🔍 **Search** - Find anything across all entities
- 🎯 **Meeting Notes** - Manage meeting notes and transcriptions

## ⚠️ Important: Pre-Release Software

**This is very much a work in progress.** Please read this carefully before using:

- **Interim Solution:** Superthread has an [official MCP server](https://api.superthread.com/mcp) which they're actively developing. Our goal is to provide a more complete toolset with full read/write API access until their official server expands. We are **not** trying to replace their official server—we're confident they're building it out—we just wanted more comprehensive functionality now. This is something to use in the meantime.

- **Not Production-Ready:** This server is not yet at version 1.0 and should be used with caution. It may never reach version 1.0 as Superthread continues to expand their official MCP server.

- **Unofficial & Independent:** This is a community project and is not officially affiliated with or endorsed by Superthread.

- **Direct API Passthrough:** This server makes direct API calls to the Superthread API and returns all data exactly as received. We do not perform any caching, data reduction, or transformation. This means responses can be large and may impact performance.

- **Use at Your Own Risk:** While we've taken reasonable security precautions, this is experimental software. Test thoroughly in non-critical environments before relying on it for important workflows.

- **Limited Support:** This is a community project maintained in spare time. Issues and pull requests are welcome.

**Bottom line:** If you need something stable and production-ready, wait for Superthread's official solution. If you need functionality now and understand the risks, this server aims to help bridge the gap.

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

| Variable                       | Required | Default                          | Description                                                                                                                                                                                                                    |
| ------------------------------ | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SUPERTHREAD_API_KEY`          | ✅ Yes    | -                                | Personal Access Token from Superthread account                                                                                                                                                                                 |
| `SUPERTHREAD_API_BASE_URL`     | No       | `https://api.superthread.com/v1` | API endpoint (only change for testing)                                                                                                                                                                                         |
| `SUPERTHREAD_ENABLED_TOOLS`    | No       | (all enabled)                    | Comma-separated list of tool domains to enable. **If not set or empty, ALL tools are enabled.** Available domains: `users`, `cards`, `boards`, `projects`, `spaces`, `sprints`, `pages`, `comments`, `notes`, `tags`, `search` |
| `SUPERTHREAD_LISTS_ADD_TO_TOP` | No       | (none)                           | Comma-separated list of list name patterns for smart positioning. Cards moved/created in matching lists are positioned at top (position 0). Supports wildcards (`*`). Example: `"Done,Complet*,*finished,*archive*"`           |

### Selective Tool Enabling

By default, **all tool domains are enabled** when `SUPERTHREAD_ENABLED_TOOLS` is not set. This ensures backward compatibility and full functionality out of the box.

To reduce tool clutter in your AI client, you can explicitly specify which domains to enable. **Only the domains you list will be enabled** - all others will be disabled.

**Enable only cards and boards:**
```json
{
  "mcpServers": {
    "superthread": {
      "command": "npx",
      "args": ["-y", "mcp-superthread-plus"],
      "env": {
        "SUPERTHREAD_API_KEY": "your-api-key-here",
        "SUPERTHREAD_ENABLED_TOOLS": "cards,boards"
      }
    }
  }
}
```

**Enable most tools except notes and tags:**
```json
{
  "env": {
    "SUPERTHREAD_API_KEY": "your-api-key-here",
    "SUPERTHREAD_ENABLED_TOOLS": "users,cards,boards,projects,spaces,sprints,pages,comments,search"
  }
}
```

**Important:**
- **Not set or empty** = All domains enabled (full functionality)
- **Set to specific domains** = Only those domains enabled, all others disabled
- This is backward compatible - existing configs without this setting will continue to work with all tools enabled

### Smart Card Positioning

By default, newly created or moved cards are added to the bottom of a list.
While this works well for most lists (like "Backlog" or "To Do"), it's
problematic for completion lists like "Done" or "Archived" where you typically
want to see the most recently completed items at the top. Without smart
positioning, recent completions get buried at the bottom, making it harder to
track what was just finished.

Configure lists where cards should automatically be positioned at the top using
`SUPERTHREAD_LISTS_ADD_TO_TOP`:

```json
{
  "env": {
    "SUPERTHREAD_API_KEY": "your-api-key-here",
    "SUPERTHREAD_LISTS_ADD_TO_TOP": "Done,Completed,Finished"
  }
}
```

**Features:**
- **Wildcard support:** Use `*` for pattern matching (e.g., `"Done,Complet*,*finished,*archive*"`)
- **Case-insensitive:** Matches "done", "Done", "DONE" equally
- **Comma escaping:** Use backslash for list names with commas (e.g., `"Tasks\\, Urgent"`)
- **LLM override:** Explicit position parameter in tools always takes precedence
- **Graceful fallback:** If board/sprint fetch fails, cards use default positioning


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

#### Tag Management

| Tool         | Description                                     |
| ------------ | ----------------------------------------------- |
| `tag_create` | Create new tag with name and color              |
| `tag_update` | Update tag properties (name, color)             |
| `tag_delete` | Delete tag permanently (removes from all cards) |

**Note:** Tag management tools use undocumented API endpoints discovered via browser network inspection.

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
| `board_delete_list` | Delete list/column permanently         |

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

**Note:** Comment tools support @mentions and HTML formatting. You can ask the AI to mention team members by name in comments and use HTML tags for rich formatting (headers, bold, italic, lists, links, etc.).

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
