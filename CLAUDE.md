# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP Superthread Plus is a community-maintained Model Context Protocol (MCP) server for [Superthread](https://superthread.com) project management. It provides AI assistants with comprehensive read/write API access to manage cards, boards, projects, documentation, and collaboration features.

**Key Points:**
- Built with TypeScript using Node.js 22+
- Uses pnpm for package management (pnpm@10.27.0)
- Pre-release software (v0.4.0) - may contain undocumented API endpoints
- Direct API passthrough - returns all data exactly as received from Superthread API

## Development Commands

### Setup
```bash
pnpm install          # Install dependencies
pnpm run build        # Build TypeScript to dist/
```

### Development
```bash
pnpm run dev          # Watch mode - rebuilds on file changes
pnpm run clean        # Remove dist/ directory
```

### Testing
```bash
pnpm run test                    # Run all tests (unit + integration)
pnpm run test:unit               # Run unit tests only
pnpm run test:integration        # Run integration tests (30s timeout)
pnpm run test:watch              # Run unit tests in watch mode
pnpm run test:ui                 # Open Vitest UI
pnpm run test:coverage           # Generate coverage report
```

**Test Structure:**
- `tests/unit/` - Fast unit tests (5s timeout)
- `tests/integration/` - Integration tests requiring API calls (30s timeout)

### Code Quality
```bash
pnpm run lint          # Run ESLint
pnpm run lint:fix      # Fix ESLint errors automatically
pnpm run format        # Format with Prettier
pnpm run format:check  # Check formatting without changes
```

### Local Testing
```bash
pnpm run build
# Configure MCP client to use: node /absolute/path/to/dist/index.js
```

### Publishing
```bash
pnpm run pack:dist     # Build and pack for distribution testing
pnpm run release       # Release using np (interactive)
```

## Architecture

### Composition-Based API Client Pattern

The codebase uses a **resource-based API client architecture** with clean separation between API operations and MCP tool registration.

**Key Components:**

1. **Main Client** (`src/api/client.ts`)
   - `SuperthreadClient` class handles all HTTP communication
   - Centralizes authentication, error handling, and request logic
   - Exposes resource classes as public properties

2. **Resource Classes** (`src/api/*.ts`)
   - Domain-specific API operations (users, cards, boards, projects, etc.)
   - Receive client via dependency injection (composition, not inheritance)
   - Each resource contains only fully implemented methods (no placeholders)

3. **Tool Handlers** (`src/tools/*.ts`)
   - Register MCP tools using standard helpers
   - Translate between modern UI terminology and legacy API terms
   - Map to resource class methods

**Directory Structure:**
```
src/
├── api/                  # API abstraction layer
│   ├── client.ts         # Main SuperthreadClient
│   ├── cards.ts          # CardResource
│   ├── boards.ts         # BoardResource
│   └── ...               # Other resources
├── tools/                # MCP tool registration
│   ├── index.ts          # Tool registry
│   ├── helpers.ts        # createToolHandler, buildParams
│   ├── cards.ts          # Card tools
│   └── ...               # Other tool groups
├── config.ts             # Environment-based configuration
├── utils.ts              # Shared utilities
└── server.ts             # MCP server initialization
```

### Tool Registration Pattern

All tools follow a consistent pattern using helper utilities:

```typescript
import { createToolHandler, buildParams } from "./helpers.js"

export function registerCardTools(server: McpServer) {
  server.registerTool(
    "card_create",
    {
      title: "Create Cards",
      description: "Create one or more cards (batch operation)",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        // ... other parameters
      }
    },
    createToolHandler(async (client, args) => {
      const params = buildParams<CreateCardData>({
        title: args.title,
        board_id: args.board_id,  // only included if defined
      })
      return await client.cards.create(args.workspace_id, params)
    })
  )
}
```

**Helper Functions:**
- `createToolHandler` - Wraps handlers with client creation, error handling, and response formatting
- `buildParams` - Filters out undefined values to create clean API payloads

### Terminology Mapping

The codebase uses **modern Superthread UI terminology** in tools and translates to legacy API terms internally:

| Modern Term (Tools) | Legacy API Term        | Context                |
| ------------------- | ---------------------- | ---------------------- |
| `workspace_id`      | `team_id`              | Account organization   |
| `space_id`          | `project_id`           | Organizational spaces  |
| `project_id`        | `epic_id`              | Roadmap projects/epics |
| `list_id`           | `list_id`/`status_id`  | Board columns          |

**Why:** Users interact with the modern UI, so tools should use familiar terms. Translation happens transparently in the API layer.

See `docs/contributing/API-REFERENCE.md` for complete terminology mappings.

### Batch Operations

Since v0.4.0, most tools support **batch operations** for efficiency:
- All batch tools require **array parameters**, even for single operations
- Each operation is a self-contained object with all necessary parameters
- Reduces MCP tool calls by up to 80% for bulk operations

Example: Creating 10 cards with checklists now takes 2 calls instead of 20+.

## Important API Quirks

### Undocumented Endpoints

Several endpoints were discovered via browser network inspection and are **NOT documented** in Superthread's official API:

- **Card member assignment** - `POST/DELETE /{team_id}/cards/{card_id}/members`
- **Checklist management** - All checklist CRUD operations
- **Project-card relationships** - `POST/DELETE /{team_id}/epics/{epic_id}/cards/{card_id}`
- **Sprint operations** - `GET /{team_id}/sprints/{sprint_id}?project_id={project_id}`

See `docs/NOTES.md` for complete details on undocumented endpoints and API limitations.

### Card Content Updates

**IMPORTANT:** Card `content` field **cannot be updated via REST API**.

Superthread uses [TipTap collaborative editor](https://newsletter.superthread.com/p/how-we-implemented-tiptap-editor) with real-time operational transforms (WebSocket-based). Content can only be:
- Set during card creation via `card_create`
- Modified through Superthread UI
- Updated programmatically by implementing TipTap collaboration protocol (out of scope)

### Comment Mentions

Comments support @mentions using **`{{@Username}}`** template syntax:
- System scans for patterns and looks up workspace members
- Converts to HTML `<user-mention>` tags automatically
- Invalid names remain as plain text (comment still posts)

Example: `"Hey {{@Sarah Chen}}, can you review this?"`

## Configuration

All configuration is via environment variables (loaded in `src/config.ts`):

| Variable                       | Required | Default                          | Description                                   |
| ------------------------------ | -------- | -------------------------------- | --------------------------------------------- |
| `SUPERTHREAD_API_KEY`          | ✅ Yes    | -                                | Personal Access Token from Superthread        |
| `SUPERTHREAD_API_BASE_URL`     | No       | `https://api.superthread.com/v1` | API endpoint (only change for testing)        |
| `SUPERTHREAD_ENABLED_TOOLS`    | No       | (all enabled)                    | Comma-separated tool domains to enable        |
| `SUPERTHREAD_LISTS_ADD_TO_TOP` | No       | (none)                           | List patterns for smart card positioning      |

**Smart Card Positioning:** Cards moved/created in lists matching `SUPERTHREAD_LISTS_ADD_TO_TOP` patterns are positioned at top (position 0). Supports wildcards (e.g., `"Done,Complet*,*archive*"`).

## Type Safety Requirements

- **No `any` types** - Use proper TypeScript interfaces
- Use `unknown` for generic/uncertain types
- All API methods must provide explicit return types
- All resource interfaces defined in respective API files

Example:
```typescript
// ✅ Correct
async getMembers(workspaceId: string): Promise<WorkspaceMember[]>

// ❌ Wrong
async getMembers(workspaceId: string): Promise<any>
```

## Code Quality Standards

- **Strict TypeScript** - All strict mode flags enabled
- **No unimplemented methods** - Only add methods that are fully functional
- **ES Modules** - Use `.js` extensions in imports (even for TypeScript files)
- **Target ES2024** with NodeNext module resolution
- **Husky pre-commit hooks** - Run linting and formatting automatically

## Testing Guidelines

- Unit tests for utilities, config parsing, and helper functions
- Integration tests for API operations (require valid API key)
- Use Vitest for all testing
- Coverage excludes `src/index.ts` (entry point) and type definitions

## Adding New Resources

See `docs/contributing/ARCHITECTURE.md` for detailed instructions on adding new resource classes and tools. The pattern is:

1. Create resource class in `src/api/[resource].ts` with typed interfaces
2. Register resource in `SuperthreadClient` constructor
3. Create tool handlers in `src/tools/[resource].ts`
4. Register tools in `src/tools/index.ts`

## Error Handling

- **Centralized in `SuperthreadClient.request()`** - Handles auth, HTTP errors, JSON parsing
- **Tool-level** - Let API errors bubble up; add context-specific messages when needed
- **Validate parameters** before API calls

Common error types:
- 401 - Authentication errors (invalid API key)
- 403 - Permission errors
- 404 - Resource not found
- 400 - Validation errors
- 429 - Rate limiting
- 500+ - Superthread API issues

## Documentation

- `README.md` - User-facing documentation and installation
- `docs/contributing/ARCHITECTURE.md` - Detailed architecture patterns
- `docs/contributing/API-REFERENCE.md` - API terminology mapping
- `docs/NOTES.md` - API quirks, limitations, undocumented endpoints
- `CHANGELOG.md` - Version history and release notes
