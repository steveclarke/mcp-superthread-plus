# Architecture

## Overview

MCP Superthread Plus is built with a clean separation of concerns, using a resource-based API client architecture that abstracts the Superthread REST API.

This architecture provides:
- **Single Source of Truth**: All API calls go through one place
- **Terminology Translation**: Automatically maps modern UI terms to legacy API terms
- **Consistent Error Handling**: Centralized error handling and retry logic
- **Type Safety**: TypeScript interfaces provide compile-time checking
- **Testability**: Easy to mock for unit testing
- **Maintainability**: API changes only require updates in one location

## API Client Pattern

The MCP Superthread Plus server uses a **composition-based API client architecture** to interact with the Superthread REST API.

### Core Components

1. **Main Client** (`src/api/client.ts`)
   - Central hub for all API communication
   - Handles authentication, error handling, and HTTP requests
   - Exposes resource classes as public properties

2. **Resource Classes** (`src/api/*.ts`)
   - Domain-specific API operations (users, cards, boards, etc.)
   - Receive the main client via dependency injection
   - Use the client's `request()` method to make API calls

3. **TypeScript Interfaces**
   - Define proper types for request/response data
   - No `any` types - everything is properly typed

### Main Client Structure

```typescript
export class SuperthreadClient {
  private apiKey: string
  private baseUrl: string
  
  public user: UserResource
  public cards: CardResource
  public boards: BoardResource
  // ... etc
  
  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.user = new UserResource(this)
    this.cards = new CardResource(this)
    // ... initialize other resources
  }
  
  async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    // Handles auth headers, error handling, JSON parsing
  }
}
```

### Resource Class Structure

```typescript
export interface Card {
  id: string
  title: string
  content?: string
  // ... proper types
}

export class CardResource {
  constructor(private client: SuperthreadClient) {}
  
  async create(workspaceId: string, data: CreateCardData): Promise<Card> {
    return await this.client.request<Card>(
      `/${workspaceId}/cards`,
      { method: "POST", body: JSON.stringify(data) }
    )
  }
  
  async get(workspaceId: string, cardId: string): Promise<Card> {
    return await this.client.request<Card>(
      `/${workspaceId}/cards/${cardId}`,
      { method: "GET" }
    )
  }
}
```

### Usage in Tools

```typescript
const { createClient } = await import("../api/client.js")
const client = createClient()
const card = await client.cards.create(workspaceId, cardData)
```

## Resource-Based Organization

The API client is organized by resource type, mirroring the domain model:

```
SuperthreadClient
├── cards: CardResource
├── boards: BoardResource
├── spaces: SpaceResource
├── projects: ProjectResource
├── pages: PageResource
├── notes: NoteResource
├── comments: CommentResource
├── sprints: SprintResource
├── user: UserResource
└── search: SearchResource
```

**Benefits:**
- **Logical Grouping**: Related operations stay together
- **Parallel Structure**: Tools directory mirrors API directory
- **Easy Navigation**: Find methods by thinking about the domain
- **Scalability**: Adding new resources is straightforward

**Directory Structure:**
```
src/
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

## Modern UI Terminology

All tools and client methods use modern Superthread UI terminology:
- `workspace_id` instead of `team_id`
- `space_id` instead of `project_id` (for Spaces)
- `project_id` for Roadmap projects (instead of `epic_id`)
- `list_id` for board columns/statuses

**Why:** Users and AI interact with the Superthread UI, so tools should use familiar terms. The translation to legacy API terms happens transparently in the API layer.

See [`API-REFERENCE.md#terminology-mapping`](./API-REFERENCE.md#terminology-mapping) for complete mappings.

## Adding New Resources

To add a new resource (e.g., `pages`):

### Step 1: Create Resource File

Create `src/api/pages.ts`:

```typescript
import type { SuperthreadClient } from "./client.js"

export interface Page {
  id: string
  title: string
  content?: string
  // ... proper types
}

export interface CreatePageData {
  title: string
  content?: string
  project_id: string
  // ... other fields
}

export class PageResource {
  constructor(private client: SuperthreadClient) {}
  
  async create(workspaceId: string, data: CreatePageData): Promise<Page> {
    return await this.client.request<Page>(
      `/${workspaceId}/pages`,
      { method: "POST", body: JSON.stringify(data) }
    )
  }
  
  async get(workspaceId: string, pageId: string): Promise<Page> {
    return await this.client.request<Page>(
      `/${workspaceId}/pages/${pageId}`,
      { method: "GET" }
    )
  }
}
```

### Step 2: Register in Main Client

Update `src/api/client.ts`:

```typescript
import { PageResource } from "./pages.js"

export class SuperthreadClient {
  public user: UserResource
  public cards: CardResource
  public pages: PageResource  // Add property
  
  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.user = new UserResource(this)
    this.cards = new CardResource(this)
    this.pages = new PageResource(this)  // Initialize
  }
}
```

### Step 3: Create Tool Registrations

Create `src/tools/pages.ts`:

```typescript
import { z } from "zod"
import type { McpServer } from "../server.js"

export function registerPageTools(server: McpServer) {
  server.registerTool(
    "page_create",
    {
      title: "Create Page",
      description: "Create a new page in a workspace",
      inputSchema: {
        workspace_id: z.string().describe("Workspace ID"),
        title: z.string().describe("Page title"),
        content: z.string().optional().describe("Page content"),
        space_id: z.string().describe("Space ID to create page in")
      }
    },
    async (args) => {
      const { createClient } = await import("../api/client.js")
      const client = createClient()
      return await client.pages.create(args.workspace_id, {
        title: args.title,
        content: args.content,
        project_id: args.space_id  // Terminology mapping
      })
    }
  )
}
```

### Step 4: Register in Tool Index

Update `src/tools/index.ts`:

```typescript
import { registerPageTools } from "./pages.js"

export function registerAllTools(server: McpServer) {
  registerUserTools(server)
  registerCardTools(server)
  registerPageTools(server)  // Add this
  // ... other registrations
}
```

## Why Composition Over Inheritance

This pattern uses **composition** (resources *have* a client) rather than **inheritance** (resources *are* a client).

### Benefits

1. **Single Responsibility**: Each resource class only manages its domain (cards, users, etc.), not HTTP concerns

2. **Clear Dependencies**: Explicit injection makes it obvious what each resource needs

3. **Easy Testing**: Simple to mock the client for unit tests

4. **Resource Sharing**: Multiple resources share one client instance (one connection pool, one auth setup)

5. **Better Encapsulation**: HTTP implementation details stay private to the client

6. **Flexibility**: Easy to change HTTP implementation without affecting resources

7. **Correct Semantics**: "A CardResource HAS a client" (true) vs "A CardResource IS a client" (false)

### Inheritance Problems Avoided

- **Tight coupling**: Resources wouldn't be tightly bound to client implementation
- **Exposed internals**: `request()`, `apiKey` wouldn't be exposed on resource classes
- **Testing difficulty**: Wouldn't need to mock entire base classes
- **Confusing hierarchy**: Clear that resources are domain objects, not HTTP clients

## Design Principles

This pattern follows these established principles:

- **Favor Composition Over Inheritance** (Gang of Four)
- **Single Responsibility Principle** (SOLID)
- **Dependency Injection**
- **Interface Segregation** (resources only see what they need)

## Type Safety

All API methods must:
- Use proper TypeScript interfaces for data
- Never use `any` types
- Use `unknown` for generic/uncertain types
- Provide explicit return types

Example:
```typescript
// ✅ Correct
async getMembers(workspaceId: string): Promise<WorkspaceMember[]>

// ❌ Wrong
async getMembers(workspaceId: string): Promise<any>
```

## No Unimplemented Methods

Resource classes should **only contain methods that are fully implemented**. Do not include:
- Placeholder methods that throw "not implemented" errors
- TODO methods
- Commented-out methods

Add methods incrementally as they're needed and implemented.

## Error Handling Strategy

### Centralized in SuperthreadClient

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
- **Server Errors** (500+): Superthread API issues

### Tool-Level Error Handling

Tools should:
1. Let API errors bubble up (client handles them)
2. Add context-specific error messages when needed
3. Validate required parameters before API calls

## Authentication Flow

1. User provides `SUPERTHREAD_API_KEY` in environment variables
2. `createClient()` reads from config
3. Every API request includes `Authorization: Bearer {token}` header
4. Superthread API validates token
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

