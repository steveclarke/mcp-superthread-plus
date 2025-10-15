# API Reference

Complete reference for all MCP tools, implementation status, API endpoints, and terminology mapping.

## Implementation Status

Complete list of all 71 planned tools and their implementation status.

| Category           | Total Tools | Implemented | Read-Only | Write  | Status              |
| ------------------ | ----------- | ----------- | --------- | ------ | ------------------- |
| Users              | 5           | 2           | 2         | 0      | 40% ✅               |
| Cards              | 19          | 19          | 3         | 16     | 100% ✅              |
| Tags               | 3           | 3           | 0         | 3      | 100% ✅              |
| Projects (Roadmap) | 7           | 7           | 2         | 5      | 100% ✅              |
| Boards             | 8           | 8           | 2         | 6      | 100% ✅              |
| Sprints            | 2           | 2           | 2         | 0      | 100% ✅              |
| Spaces             | 7           | 2           | 2         | 0      | 29% ✅               |
| Pages              | 7           | 7           | 2         | 5      | 100% ✅              |
| Notes              | 4           | 4           | 2         | 2      | 100% ✅              |
| Comments           | 8           | 8           | 2         | 6      | 100% ✅              |
| Search             | 1           | 1           | 1         | 0      | 100% ✅              |
| **Total**          | **71**      | **61**      | **20**    | **41** | **86% implemented** |

**Legend:** ✅ Partial | 🚧 In Progress | ⏸️ Planned

## Tool Naming Convention

Format: `{entity}_{action}`

All tool names use Superthread's UI terminology (not legacy API terms):
- Workspace (not "team")
- Space (not API "project")
- Project (not API "epic")
- Status (not API "list")

## API Coverage by Category

### Users (5 tools)

#### Implemented ✅

| Tool                  | Method | Endpoint             | Description                   |
| --------------------- | ------ | -------------------- | ----------------------------- |
| `user_get_my_account` | GET    | `/users/me`          | Get current user account info |
| `user_get_members`    | GET    | `/{team_id}/members` | List workspace members        |

#### Planned ⏸️

| Tool                     | Method | Endpoint                         | Description         |
| ------------------------ | ------ | -------------------------------- | ------------------- |
| `user_update_my_account` | PATCH  | `/users/me`                      | Update user profile |
| `user_update_member`     | PATCH  | `/{team_id}/members/{member_id}` | Update member role  |
| `user_delete_member`     | DELETE | `/{team_id}/members/{member_id}` | Remove member       |

### Cards (19 tools)

#### Implemented ✅

| Tool                         | Method | Endpoint                                                               | Description                                        |
| ---------------------------- | ------ | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `card_create`                | POST   | `/{team_id}/cards`                                                     | Create new card                                    |
| `card_update`                | PATCH  | `/{team_id}/cards/{card_id}`                                           | Update card properties                             |
| `card_get`                   | GET    | `/{team_id}/cards/{card_id}`                                           | Get card details                                   |
| `card_duplicate`             | POST   | `/{team_id}/cards/{card_id}/copy`                                      | Clone card                                         |
| `card_get_assigned`          | POST   | `/{team_id}/views/preview`                                             | Get user's assigned cards                          |
| `card_add_related`           | POST   | `/{team_id}/cards/{card_id}/linked_cards`                              | Link cards with relationships                      |
| `card_delete`                | DELETE | `/{team_id}/cards/{card_id}`                                           | Delete card permanently                            |
| `card_get_tags`              | GET    | `/{team_id}/tags`                                                      | List available tags                                |
| `card_add_tags`              | POST   | `/{team_id}/cards/{card_id}/tags`                                      | Add tags to card                                   |
| `card_remove_tag`            | DELETE | `/{team_id}/cards/{card_id}/tags/{tag_id}`                             | Remove tag from card                               |
| `card_remove_related`        | DELETE | `/{team_id}/cards/{card_id}/linked_cards/{linked_card_id}`             | Remove card relationship                           |
| `card_add_member`            | POST   | `/{team_id}/cards/{card_id}/members`                                   | Add member to card ⚠️ UNDOCUMENTED                  |
| `card_remove_member`         | DELETE | `/{team_id}/cards/{card_id}/members/{user_id}`                         | Remove member from card ⚠️ UNDOCUMENTED             |
| `card_create_checklist`      | POST   | `/{team_id}/cards/{card_id}/checklists`                                | Create checklist on card ⚠️ UNDOCUMENTED            |
| `card_add_checklist_item`    | POST   | `/{team_id}/cards/{card_id}/checklists/{checklist_id}/items`           | Add item to checklist ⚠️ UNDOCUMENTED               |
| `card_update_checklist_item` | PATCH  | `/{team_id}/cards/{card_id}/checklists/{checklist_id}/items/{item_id}` | Update checklist item (check/title) ⚠️ UNDOCUMENTED |
| `card_delete_checklist_item` | DELETE | `/{team_id}/cards/{card_id}/checklists/{checklist_id}/items/{item_id}` | Delete checklist item ⚠️ UNDOCUMENTED               |
| `card_update_checklist`      | PATCH  | `/{team_id}/cards/{card_id}/checklists/{checklist_id}`                 | Update checklist title ⚠️ UNDOCUMENTED              |
| `card_delete_checklist`      | DELETE | `/{team_id}/cards/{card_id}/checklists/{checklist_id}`                 | Delete entire checklist ⚠️ UNDOCUMENTED             |

#### Notes

- **Archive functionality** is handled by `card_update` with `archived: true/false` parameter (no separate tool needed)
- ⚠️ **UNDOCUMENTED ENDPOINTS**: All checklist management tools and card member assignment tools were discovered via browser network inspection and are NOT in Superthread's official API documentation. These may change without notice.
- See [`NOTES.md`](../NOTES.md) for details on API limitations (e.g., content updates)

### Tags (3 tools)

#### Implemented ✅

| Tool         | Method | Endpoint                       | Description                                    |
| ------------ | ------ | ------------------------------ | ---------------------------------------------- |
| `tag_create` | POST   | `/{team_id}/tags`              | Create new tag with name and color ⚠️ UNDOCUMENTED |
| `tag_update` | PATCH  | `/{team_id}/tags/{tag_id}`     | Update tag properties (name, color) ⚠️ UNDOCUMENTED |
| `tag_delete` | DELETE | `/{team_id}/tags/{tag_id}`     | Delete tag permanently ⚠️ UNDOCUMENTED             |

#### Notes

- ⚠️ **UNDOCUMENTED ENDPOINTS**: All tag management tools were discovered via browser network inspection and are NOT in Superthread's official API documentation. These may change without notice.
- Tags can be created with optional `project_id` to associate with a specific space
- Color must be provided as hex string (e.g., `#ee46bc`)
- Deleting a tag removes it from all cards that use it
- Tag listing is available through `card_get_tags` tool (read-only)

### Projects/Roadmap (7 tools)

#### Implemented ✅

| Tool                     | Method | Endpoint                                     | Description                         |
| ------------------------ | ------ | -------------------------------------------- | ----------------------------------- |
| `project_get_all`        | GET    | `/{team_id}/epics`                           | List all roadmap projects           |
| `project_get`            | GET    | `/{team_id}/epics/{epic_id}`                 | Get project details                 |
| `project_create`         | POST   | `/{team_id}/epics`                           | Create roadmap project              |
| `project_update`         | PATCH  | `/{team_id}/epics/{epic_id}`                 | Update project properties           |
| `project_delete`         | DELETE | `/{team_id}/epics/{epic_id}`                 | Delete project permanently          |
| `project_add_related`    | POST   | `/{team_id}/epics/{epic_id}/cards/{card_id}` | Link card to project ⚠️ UNDOCUMENTED |
| `project_remove_related` | DELETE | `/{team_id}/epics/{epic_id}/cards/{card_id}` | Remove card link ⚠️ UNDOCUMENTED     |

#### Notes

- **Archive functionality** is handled by `project_update` with `archived: true/false` parameter (no separate tool needed)
- **Project-card relationships** use dedicated epic endpoints (not the card relationship endpoints)
- ⚠️ **UNDOCUMENTED ENDPOINTS**: `project_add_related` and `project_remove_related` were discovered via browser network inspection and are NOT in Superthread's official API documentation. These may change without notice.
- See [`NOTES.md`](../NOTES.md) for details on why projects have separate relationship endpoints

### Boards (8 tools)

#### Implemented ✅

| Tool                | Method | Endpoint                                 | Description                 |
| ------------------- | ------ | ---------------------------------------- | --------------------------- |
| `board_get_all`     | GET    | `/{team_id}/boards`                      | List all boards             |
| `board_get`         | GET    | `/{team_id}/boards/{board_id}`           | Get board details           |
| `board_create`      | POST   | `/{team_id}/boards`                      | Create new board            |
| `board_create_list` | POST   | `/{team_id}/lists`                       | Create list/column on board |
| `board_update`      | PATCH  | `/{team_id}/boards/{board_id}`           | Update board properties     |
| `board_update_list` | PATCH  | `/{team_id}/lists/{list_id}`             | Update list/column          |
| `board_duplicate`   | POST   | `/{team_id}/boards/{board_id}/duplicate` | Clone board                 |
| `board_delete`      | DELETE | `/{team_id}/boards/{board_id}`           | Delete board                |

### Sprints (2 tools)

#### Implemented ✅

| Tool             | Method | Endpoint                                                 | Description                           |
| ---------------- | ------ | -------------------------------------------------------- | ------------------------------------- |
| `sprint_get_all` | GET    | `/{team_id}/projects/{project_id}` (returns sprints)     | List all sprints for a space          |
| `sprint_get`     | GET    | `/{team_id}/sprints/{sprint_id}?project_id={project_id}` | Get sprint details including list IDs |

#### Notes

- **Sprint list IDs** are UUID-based and unique to each sprint (e.g., `dc8a470f-a871-47d8-980b-40bd987f2bdf`)
- Each sprint has standard lists: "Not started" (committed), "In progress" (started), "Done" (completed), "Cancelled" (cancelled)
- These list IDs are required when creating cards in sprints via `card_create` with `sprint_id` parameter
- Sprint endpoints were discovered via browser network inspection and are **not documented** in SuperThread's official API documentation
- The `project_id` query parameter is required for the `sprint_get` endpoint

### Spaces (7 tools)

#### Implemented ✅

| Tool            | Method | Endpoint                           | Description       |
| --------------- | ------ | ---------------------------------- | ----------------- |
| `space_get_all` | GET    | `/{team_id}/projects`              | List all spaces   |
| `space_get`     | GET    | `/{team_id}/projects/{project_id}` | Get space details |

#### Planned ⏸️

| Tool                  | Method | Endpoint                                               | Description         |
| --------------------- | ------ | ------------------------------------------------------ | ------------------- |
| `space_create`        | POST   | `/{team_id}/projects`                                  | Create new space    |
| `space_update`        | PATCH  | `/{team_id}/projects/{project_id}`                     | Update space        |
| `space_add_member`    | POST   | `/{team_id}/projects/{project_id}/members`             | Add member to space |
| `space_remove_member` | DELETE | `/{team_id}/projects/{project_id}/members/{member_id}` | Remove member       |
| `space_delete`        | DELETE | `/{team_id}/projects/{project_id}`                     | Delete space        |

### Pages (7 tools)

#### Implemented ✅

| Tool             | Method | Endpoint                               | Description            |
| ---------------- | ------ | -------------------------------------- | ---------------------- |
| `page_create`    | POST   | `/{team_id}/pages`                     | Create new page        |
| `page_update`    | PATCH  | `/{team_id}/pages/{page_id}`           | Update page properties |
| `page_get`       | GET    | `/{team_id}/pages/{page_id}`           | Get page details       |
| `page_get_all`   | GET    | `/{team_id}/pages`                     | List all pages         |
| `page_duplicate` | POST   | `/{team_id}/pages/{page_id}/duplicate` | Clone page             |
| `page_archive`   | POST   | `/{team_id}/pages/{page_id}/archive`   | Archive page           |
| `page_delete`    | DELETE | `/{team_id}/pages/{page_id}`           | Delete page            |

### Notes (4 tools)

#### Implemented ✅

| Tool           | Method | Endpoint                     | Description      |
| -------------- | ------ | ---------------------------- | ---------------- |
| `note_create`  | POST   | `/{team_id}/notes`           | Create new note  |
| `note_get`     | GET    | `/{team_id}/notes/{note_id}` | Get note details |
| `note_get_all` | GET    | `/{team_id}/notes`           | List all notes   |
| `note_delete`  | DELETE | `/{team_id}/notes/{note_id}` | Delete note      |

### Comments (8 tools)

#### Implemented ✅

| Tool                   | Method | Endpoint                                                       | Description                      |
| ---------------------- | ------ | -------------------------------------------------------------- | -------------------------------- |
| `comment_create`       | POST   | `/{team_id}/comments`                                          | Create comment on card/page      |
| `comment_update`       | PATCH  | `/{team_id}/comments/{comment_id}`                             | Edit existing comment            |
| `comment_get`          | GET    | `/{team_id}/comments/{comment_id}`                             | Get comment details with replies |
| `comment_reply`        | POST   | `/{team_id}/comments/{comment_id}/children`                    | Reply to comment (thread)        |
| `comment_delete`       | DELETE | `/{team_id}/comments/{comment_id}`                             | Delete comment permanently       |
| `comment_get_replies`  | GET    | `/{team_id}/comments/{comment_id}/children`                    | Get all replies to comment       |
| `comment_update_reply` | PATCH  | `/{team_id}/comments/{comment_id}/children/{child_comment_id}` | Edit a reply                     |
| `comment_delete_reply` | DELETE | `/{team_id}/comments/{comment_id}/children/{child_comment_id}` | Delete a reply                   |

#### Notes

- Comments support status values: `resolved`, `open`, `orphaned`
- Reply operations use child comment endpoints under the parent comment path
- Deleting a parent comment also removes all child replies
- See [`NOTES.md`](../NOTES.md) for details on @mention support

### Search (1 tool)

#### Implemented ✅

| Tool         | Method | Endpoint            | Description                             |
| ------------ | ------ | ------------------- | --------------------------------------- |
| `search_get` | GET    | `/{team_id}/search` | Search across boards, cards, pages, etc |

#### Notes

- Search supports filtering by: `types`, `statuses`, `project_id`, `archived`, `field` (title/content)
- Results can be returned grouped by entity type or ungrouped
- Supports pagination via `cursor` parameter

## Terminology Mapping

Superthread's API uses legacy terminology that differs from the modern UI. This document provides the complete mapping and explains how our MCP server handles the translation.

### Why This Matters

When Superthread evolved, they updated the UI terminology to be more intuitive, but the API retained legacy names for backward compatibility. This creates confusion when building integrations.

**Our Solution**: Use modern UI terms everywhere in our MCP server. The API client handles translation internally.

### Complete Terminology Mapping

| Modern UI Term           | Legacy API Term | Used In API As       | Example                                |
| ------------------------ | --------------- | -------------------- | -------------------------------------- |
| **Workspace**            | `team`          | Path parameter       | `GET /{team_id}/cards`                 |
| **Space**                | `project`       | Endpoint & parameter | `GET /{team_id}/projects/{project_id}` |
| **Project** (Roadmap)    | `epic`          | Endpoint & parameter | `GET /{team_id}/epics/{epic_id}`       |
| **Status** or **Column** | `list`          | Parameter            | `list_id` in card creation             |

### Detailed Mappings

#### 1. Workspace ↔ Team

**UI:** "Workspace" - Your organization's main hub  
**API:** `team` - Legacy term for the same concept

**In Our Code:**
```typescript
// Tool parameter (what users see)
workspace_id: z.string().describe("Workspace ID")

// Internal API call (what Superthread expects)
await client.request(`/${team_id}/cards`, ...)
```

**API Paths Using This:**
- `GET /{team_id}/cards`
- `GET /{team_id}/boards`
- `GET /{team_id}/projects`
- `GET /{team_id}/epics`
- `GET /teams/{team_id}/members`

#### 2. Space ↔ Project

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

#### 3. Project (Roadmap) ↔ Epic

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

#### 4. Status/Column ↔ List

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

### Resource File Organization

Our API client resource files use modern UI terminology:

```
src/api/
├── spaces.ts    # Space operations → /projects endpoint
├── projects.ts  # Roadmap operations → /epics endpoint
├── boards.ts    # Board operations → /boards endpoint
├── cards.ts     # Card operations → /cards endpoint
└── ...
```

### How Translation Works

#### Example: Creating a Card in a Space

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

### Implementation Pattern

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

### Decision Rationale

#### Why Use UI Terminology?

1. **User Experience**: AI and users interact with Superthread UI
2. **Consistency**: Matches what users see in the application
3. **Future-Proof**: If Superthread updates API, we only change one place
4. **Clarity**: "Space" and "Project" have distinct meanings in UI

#### Why Not Just Use API Terms?

1. **Confusion**: "Project" means two different things
2. **Poor UX**: Users would need to learn legacy terminology
3. **Documentation Burden**: Would need to explain API quirks everywhere

#### What About list_id vs status_id?

We use `list_id` because:
- Superthread UI uses both "list" and "status" interchangeably
- API exclusively uses `list_id`
- Less translation needed
- But we do describe it as "(status column)" for clarity

### Common Pitfalls

#### ❌ Mixing Terminologies
```typescript
// Don't do this - mixes UI and API terms
await client.request(`/${team_id}/projects`, {
  body: { space_name: "My Space" }  // Confusing!
})
```

#### ✅ Consistent UI Terms
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

### Reference Table

Quick reference for developers:

| When You See   | Think Of It As  | API Uses                       |
| -------------- | --------------- | ------------------------------ |
| `workspace_id` | Organization    | `{team_id}` in paths           |
| `space_id`     | Team/Folder     | `{project_id}` for `/projects` |
| `project_id`   | Epic/Initiative | `{epic_id}` for `/epics`       |
| `list_id`      | Column/Status   | `{list_id}`                    |
| `board_id`     | Board           | `{board_id}` (same!)           |
| `card_id`      | Task/Ticket     | `{card_id}` (same!)            |

### Testing Terminology Mapping

When implementing API calls, verify:

1. Tool uses UI terminology in parameters
2. API client maps to correct endpoint
3. Request body uses API field names
4. Response parsing handles API field names
5. Returned data uses UI terminology (if transformed)

