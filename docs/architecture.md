# Architecture

## Overview

MCP SuperThread Plus is built with a clean separation of concerns, using a resource-based API client architecture that abstracts the SuperThread REST API.

## Key Design Decisions

### 1. API Abstraction Layer

We wrap the SuperThread API in a dedicated abstraction layer for several critical reasons:

**Benefits:**
- **Single Source of Truth**: All API calls go through one place, making changes and debugging easier
- **Terminology Translation**: Automatically maps modern UI terms to legacy API terms
- **Consistent Error Handling**: Centralized error handling and retry logic
- **Type Safety**: TypeScript interfaces provide compile-time checking
- **Testability**: Easy to mock for unit testing
- **Maintainability**: API changes only require updates in one location

**Alternative Rejected**: Scattering API calls throughout tool implementations would create:
- Duplicate error handling code
- Inconsistent terminology usage
- Harder maintenance when API changes
- More difficult testing

### 2. Resource-Based Client Organization

The API client is organized by resource type, mirroring the domain model:

```
SuperThreadClient
├── cards: CardResource
├── boards: BoardResource
├── spaces: SpaceResource
├── projects: ProjectResource
├── pages: PageResource
├── notes: NoteResource
├── comments: CommentResource
├── user: UserResource
└── search: SearchResource
```

**Benefits:**
- **Logical Grouping**: Related operations stay together
- **Parallel Structure**: Tools directory mirrors API directory
- **Easy Navigation**: Find methods by thinking about the domain
- **Scalability**: Adding new resources is straightforward

**Usage Pattern:**
```typescript
import { createClient } from '../api/client.js'

const client = createClient()
const card = await client.cards.create(workspace_id, {
  title: "New task",
  content: "Task description"
})
```

### 3. Modern UI Terminology

All tools and client methods use modern SuperThread UI terminology:
- `workspace_id` instead of `team_id`
- `space_id` instead of `project_id` (for Spaces)
- `project_id` for Roadmap projects (instead of `epic_id`)
- `status_id` or `list_id` for board columns

**Why:** Users and AI interact with the SuperThread UI, so tools should use familiar terms. The translation to legacy API terms happens transparently in the API layer.

See `terminology-mapping.md` for complete mappings.

## Client Architecture

### SuperThreadClient Class

The main client class provides:

```typescript
class SuperThreadClient {
  constructor(apiKey: string, baseUrl: string)
  
  // Core request method used by all resources
  async request<T>(path: string, options?: RequestInit): Promise<T>
  
  // Resource instances
  cards: CardResource
  boards: BoardResource
  // ... etc
}
```

### Resource Classes

Each resource class follows this pattern:

```typescript
class CardResource {
  constructor(private client: SuperThreadClient) {}
  
  async create(workspaceId: string, data: any): Promise<any> {
    return this.client.request(`/${workspaceId}/cards`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  // ... more methods
}
```

**Key Points:**
- Resource classes don't make HTTP requests directly
- They use `client.request()` which handles auth, errors, etc.
- Parameters use UI terminology
- Internal implementation maps to API terminology

## Error Handling Strategy

### Centralized in SuperThreadClient

```typescript
async request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // 1. Build request with auth headers
  // 2. Make HTTP request
  // 3. Check response status
  // 4. Parse JSON
  // 5. Throw descriptive errors on failure
}
```

### Error Types

- **Authentication Errors** (401): Missing or invalid API key
- **Permission Errors** (403): User lacks permission
- **Not Found** (404): Resource doesn't exist
- **Validation Errors** (400): Invalid input data
- **Rate Limiting** (429): Too many requests
- **Server Errors** (500+): SuperThread API issues

### Tool-Level Error Handling

Tools should:
1. Let API errors bubble up (client handles them)
2. Add context-specific error messages when needed
3. Validate required parameters before API calls

## Authentication Flow

1. User provides `SUPERTHREAD_API_KEY` in environment variables
2. `createClient()` reads from config
3. Every API request includes `Authorization: Bearer {token}` header
4. SuperThread API validates token
5. Errors return 401 if invalid

## Configuration Loading

```typescript
// config.ts
export const config: Config = {
  apiKey: process.env.SUPERTHREAD_API_KEY || '',
  workspaceId: process.env.SUPERTHREAD_WORKSPACE_ID || '',
  baseUrl: process.env.SUPERTHREAD_API_BASE_URL || 'https://api.superthread.com/v1'
}
```

Configuration is:
- Loaded once at startup
- Immutable after load
- Validated when creating client
- Environment-based (no config files)

## Tool Registration Pattern

All tools follow this consistent pattern:

```typescript
export function registerXxxTools(server: McpServer) {
  server.registerTool(
    "tool_name",
    {
      title: "Tool Title",
      description: "What the tool does",
      inputSchema: {
        param: z.string().describe("Parameter description")
      }
    },
    async (args) => {
      const client = createClient()
      return await client.resource.method(args.workspace_id, args)
    }
  )
}
```

**Benefits:**
- Consistent structure across all tools
- Clear separation: tools handle MCP, client handles API
- Easy to test each layer independently

## Directory Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # MCP server setup
├── config.ts             # Configuration
├── utils.ts              # Generic utilities
├── api/                  # API abstraction layer
│   ├── client.ts         # Main client
│   ├── cards.ts          # Card resource
│   ├── boards.ts         # Board resource
│   └── ...               # Other resources
└── tools/                # MCP tools
    ├── index.ts          # Tool registry
    ├── cards.ts          # Card tools
    ├── boards.ts         # Board tools
    └── ...               # Other tool groups
```

## Future Considerations

### Caching
Consider adding response caching for:
- User account info (changes rarely)
- Team members list
- Available tags

### Rate Limiting
SuperThread may have rate limits. Consider:
- Request queue with throttling
- Exponential backoff on 429 errors
- Request batching where possible

### Request/Response Transformation
Future enhancement: Add layers for:
- Response filtering (remove unnecessary fields)
- Data normalization (consistent date formats)
- Pagination handling (automatic page fetching)

### TypeScript Types
Currently using `any` for API responses. Future:
- Generate types from OpenAPI spec
- Add Zod schemas for runtime validation
- Type-safe request/response interfaces

