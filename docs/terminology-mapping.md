# SuperThread Terminology Mapping

## Overview

SuperThread's API uses legacy terminology that differs from the modern UI. This document provides the complete mapping and explains how our MCP server handles the translation.

## Why This Matters

When SuperThread evolved, they updated the UI terminology to be more intuitive, but the API retained legacy names for backward compatibility. This creates confusion when building integrations.

**Our Solution**: Use modern UI terms everywhere in our MCP server. The API client handles translation internally.

## Complete Terminology Mapping

| Modern UI Term | Legacy API Term | Used In API As | Example |
|----------------|-----------------|----------------|---------|
| **Workspace** | `team` | Path parameter | `GET /{team_id}/cards` |
| **Space** | `project` | Endpoint & parameter | `GET /{team_id}/projects/{project_id}` |
| **Project** (Roadmap) | `epic` | Endpoint & parameter | `GET /{team_id}/epics/{epic_id}` |
| **Status** or **Column** | `list` | Parameter | `list_id` in card creation |

## Detailed Mappings

### 1. Workspace ↔ Team

**UI:** "Workspace" - Your organization's main hub  
**API:** `team` - Legacy term for the same concept

**In Our Code:**
```typescript
// Tool parameter (what users see)
workspace_id: z.string().describe("Workspace ID")

// Internal API call (what SuperThread expects)
await client.request(`/${team_id}/cards`, ...)
```

**API Paths Using This:**
- `GET /{team_id}/cards`
- `GET /{team_id}/boards`
- `GET /{team_id}/projects`
- `GET /{team_id}/epics`
- `GET /teams/{team_id}/members`

### 2. Space ↔ Project

**UI:** "Space" - Organizational container for boards and pages  
**API:** `project` - Same thing, old name

**Important:** This causes confusion because "Project" means two different things:
1. **Space** (organizational container) → API `/projects`
2. **Roadmap Project** (epic/initiative) → API `/epics`

**In Our Code:**
```typescript
// For Spaces (organizational containers)
space_id: z.string().describe("Space ID")
// Maps to: /{team_id}/projects/{project_id}

// For Roadmap Projects (epics)
project_id: z.string().describe("Project ID")  
// Maps to: /{team_id}/epics/{epic_id}
```

**API Paths:**
- `GET /{team_id}/projects` - Lists Spaces
- `GET /{team_id}/projects/{project_id}` - Gets Space details

### 3. Project (Roadmap) ↔ Epic

**UI:** "Project" on the Roadmap  
**API:** `epic` - Large initiative tracking

**In Our Code:**
```typescript
// For Roadmap Projects
project_id: z.string().describe("Project ID (Roadmap)")
// Maps to: /{team_id}/epics/{epic_id}
```

**API Paths:**
- `GET /{team_id}/epics` - Lists Roadmap projects
- `GET /{team_id}/epics/{epic_id}` - Gets project details

### 4. Status/Column ↔ List

**UI:** "Status" or "Column" - Board columns (To Do, In Progress, Done)  
**API:** `list` - Status columns

**In Our Code:**
```typescript
// We use both terms interchangeably for clarity
list_id: z.string().describe("List ID (status column)")
// or
status_id: z.string().describe("Status ID")
// Both map to: list_id in API
```

**API Parameters:**
- Card creation requires `list_id`
- List management uses `/boards/{board_id}/lists/{list_id}`

## Resource File Organization

Our API client resource files use modern UI terminology:

```
src/api/
├── spaces.ts    # Space operations → /projects endpoint
├── projects.ts  # Roadmap operations → /epics endpoint
├── boards.ts    # Board operations → /boards endpoint
├── cards.ts     # Card operations → /cards endpoint
└── ...
```

## How Translation Works

### Example: Creating a Card in a Space

**User Intent:**
"Create a card in Space A, Board B, List C"

**Our Tool Call:**
```typescript
create_card({
  workspace_id: "wks_123",  // UI term
  space_id: "spc_456",      // UI term
  board_id: "brd_789",      // Same in both
  list_id: "lst_101",       // API term (we keep this)
  title: "New task"
})
```

**API Client Translation:**
```typescript
// spaces.ts (if needed to resolve space)
GET /wks_123/projects/spc_456
     ^^^^^^         ^^^^^^^^
     team_id        project_id (API terms)

// cards.ts
POST /wks_123/cards
      ^^^^^^
      team_id
{
  "project_id": "spc_456",  // Space → project_id
  "board_id": "brd_789",
  "list_id": "lst_101",
  "title": "New task"
}
```

## Implementation Pattern

Each resource class handles the mapping:

```typescript
// spaces.ts
class SpaceResource {
  async create(workspaceId: string, data: any) {
    // workspaceId (UI) → team_id (API) in path
    return this.client.request(`/${workspaceId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// projects.ts (Roadmap)
class ProjectResource {
  async create(workspaceId: string, data: any) {
    // workspaceId → team_id, creates epic
    return this.client.request(`/${workspaceId}/epics`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}
```

## Decision Rationale

### Why Use UI Terminology?

1. **User Experience**: AI and users interact with SuperThread UI
2. **Consistency**: Matches what users see in the application
3. **Future-Proof**: If SuperThread updates API, we only change one place
4. **Clarity**: "Space" and "Project" have distinct meanings in UI

### Why Not Just Use API Terms?

1. **Confusion**: "Project" means two different things
2. **Poor UX**: Users would need to learn legacy terminology
3. **Documentation Burden**: Would need to explain API quirks everywhere

### What About list_id vs status_id?

We use `list_id` because:
- SuperThread UI uses both "list" and "status" interchangeably
- API exclusively uses `list_id`
- Less translation needed
- But we do describe it as "(status column)" for clarity

## Common Pitfalls

### ❌ Mixing Terminologies
```typescript
// Don't do this - mixes UI and API terms
await client.request(`/${team_id}/projects`, {
  body: { space_name: "My Space" }  // Confusing!
})
```

### ✅ Consistent UI Terms
```typescript
// Do this - consistent UI terminology
async createSpace(workspaceId: string, data: { name: string }) {
  // Translation happens in one place
  return this.client.request(`/${workspaceId}/projects`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

## Reference Table

Quick reference for developers:

| When You See | Think Of It As | API Uses |
|--------------|----------------|----------|
| `workspace_id` | Organization | `{team_id}` in paths |
| `space_id` | Team/Folder | `{project_id}` for `/projects` |
| `project_id` | Epic/Initiative | `{epic_id}` for `/epics` |
| `list_id` | Column/Status | `{list_id}` |
| `board_id` | Board | `{board_id}` (same!) |
| `card_id` | Task/Ticket | `{card_id}` (same!) |

## Testing Terminology Mapping

When implementing API calls, verify:

1. Tool uses UI terminology in parameters
2. API client maps to correct endpoint
3. Request body uses API field names
4. Response parsing handles API field names
5. Returned data uses UI terminology (if transformed)

## Future Updates

If SuperThread updates their API terminology:

**Low Impact**: Change only happens in API client resource files  
**No Impact**: Tools continue using UI terminology  
**Documentation**: Update this file with new mappings

