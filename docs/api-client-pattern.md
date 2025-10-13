# API Client Architecture Pattern

## Overview

The MCP SuperThread Plus server uses a **composition-based API client architecture** to interact with the SuperThread REST API. This document explains the pattern and rationale.

## Architecture

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

## Pattern Implementation

### Main Client Structure

```typescript
export class SuperThreadClient {
  private apiKey: string
  private baseUrl: string
  
  public user: UserResource
  
  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.user = new UserResource(this)
  }
  
  async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    // Handles auth headers, error handling, JSON parsing
  }
}
```

### Resource Class Structure

```typescript
export interface UserAccount {
  id: string
  email: string
  name: string
}

export class UserResource {
  constructor(private client: SuperThreadClient) {}
  
  async getMyAccount(): Promise<UserAccount> {
    return await this.client.request<UserAccount>("/users/me", {
      method: "GET",
    })
  }
}
```

### Usage in Tools

```typescript
const { createClient } = await import("../api/client.js")
const client = createClient()
const account = await client.user.getMyAccount()
```

## Adding New Resources

To add a new resource (e.g., `cards`):

### Step 1: Create Resource File

Create `src/api/cards.ts`:

```typescript
import type { SuperThreadClient } from "./client.js"

export interface Card {
  id: string
  title: string
  // ... proper types
}

export class CardResource {
  constructor(private client: SuperThreadClient) {}
  
  async create(workspaceId: string, data: CreateCardData): Promise<Card> {
    return await this.client.request<Card>(
      `/${workspaceId}/cards`,
      { method: "POST", body: JSON.stringify(data) }
    )
  }
}
```

### Step 2: Register in Main Client

Update `src/api/client.ts`:

```typescript
import { CardResource } from "./cards.js"

export class SuperThreadClient {
  public user: UserResource
  public cards: CardResource  // Add property
  
  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.user = new UserResource(this)
    this.cards = new CardResource(this)  // Initialize
  }
}
```

### Step 3: Use in Tools

```typescript
const client = createClient()
const card = await client.cards.create(workspaceId, cardData)
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

