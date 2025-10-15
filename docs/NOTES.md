# Superthread API Notes

Important notes about Superthread's API behavior, limitations, and undocumented features discovered during implementation.

## Undocumented API Endpoints

The following endpoints were discovered via browser network inspection and are **NOT documented** in Superthread's official API documentation. They may change without notice.

### Card Member Assignment

```
POST   /{team_id}/cards/{card_id}/members
Body:  {"user_id": "...", "role": "member"}

DELETE /{team_id}/cards/{card_id}/members/{user_id}
```

**Status**: ⚠️ Undocumented but functional  
**Tools**: `card_add_member`, `card_remove_member`

### Card Checklist Management

All checklist operations are undocumented:

```
POST   /{team_id}/cards/{card_id}/checklists
Body:  {"title": "..."}

POST   /{team_id}/cards/{card_id}/checklists/{checklist_id}/items
Body:  {"title": "<p>item text</p>"}

PATCH  /{team_id}/cards/{card_id}/checklists/{checklist_id}/items/{item_id}
Body:  {"checked": true/false, "title": "..."}

DELETE /{team_id}/cards/{card_id}/checklists/{checklist_id}/items/{item_id}

PATCH  /{team_id}/cards/{card_id}/checklists/{checklist_id}
Body:  {"title": "..."}

DELETE /{team_id}/cards/{card_id}/checklists/{checklist_id}
```

**Status**: ⚠️ Undocumented but functional  
**Tools**: `card_create_checklist`, `card_add_checklist_item`, `card_update_checklist_item`, `card_delete_checklist_item`, `card_update_checklist`, `card_delete_checklist`

### Project-Card Relationships

Projects (epics) have dedicated relationship endpoints:

```
POST   /{team_id}/epics/{epic_id}/cards/{card_id}
Body:  (empty)

DELETE /{team_id}/epics/{epic_id}/cards/{card_id}
```

**Why separate endpoints?** Projects are internally treated as cards but require special handling to:
- Prevent circular references
- Maintain hierarchical integrity
- Track epic relationships separately from card-to-card links

**Key Discovery**: The card ID is in the URL path, NOT in the request body. The standard card relationship endpoints (`/cards/{card_id}/linked_cards`) explicitly reject epic IDs with `400 Bad Request: "cannot link card to epic"`.

**Status**: ⚠️ Undocumented but functional  
**Tools**: `project_add_related`, `project_remove_related`

## API Limitations

### Card Content Updates

**Issue**: The `content` field cannot be updated via REST API.

**Why**: Superthread uses [TipTap collaborative editor](https://newsletter.superthread.com/p/how-we-implemented-tiptap-editor) (built on ProseMirror) for rich text content. Content changes sync through a real-time collaboration protocol using operational transforms, not REST endpoints.

**Technical Details**:
- Content is edited via TipTap's collaborative editing protocol (WebSocket-based)
- Changes are sent as operational transforms (small incremental operations)
- Each card has a collaboration token (JWT) for connecting to the TipTap server
- Activity polling (`GET /{team_id}/activity?card_id={card_id}`) tracks changes after sync

**Workaround**: Content can only be set during card creation via `card_create`. To update existing content, you must use the Superthread UI. Programmatic content updates would require implementing the TipTap collaboration protocol, which is beyond the scope of a REST API client.

**Status**: Architectural limitation (not a missing endpoint)

### Empty DELETE Responses

**Behavior**: DELETE endpoints (e.g., `card_delete`, `board_delete`) return empty responses with no JSON body.

**Handling**: Our API client returns `{success: true}` for empty 200/204 responses.

## Sprint List IDs

Sprint lists have special characteristics:

- **UUID-based**: Each sprint has unique list IDs (e.g., `dc8a470f-a871-47d8-980b-40bd987f2bdf`)
- **Standard lists**: Every sprint includes:
  - "Not started" (committed status)
  - "In progress" (started status)
  - "Done" (completed status)
  - "Cancelled" (cancelled status)
- **Required for card creation**: Must use `sprint_get` to retrieve list IDs before creating cards in a sprint

**Sprint Endpoints** (also undocumented):
```
GET /{team_id}/projects/{project_id}  # Returns sprints array
GET /{team_id}/sprints/{sprint_id}?project_id={project_id}  # Get sprint details
```

The `project_id` query parameter is required for `sprint_get`.

## Project Internal Structure

Projects (epics) in Superthread have a dual nature:

**They are cards internally**:
- API responses indicate `"resource_type": "card"`
- Projects have card properties: `list_id`, `status`, `tags`, `members`
- They can have `linked_cards` and `child_cards`

**But require separate API endpoints**:
- Cannot use standard card relationship endpoints
- Special `/epics/{epic_id}/cards/{card_id}` paths required
- This maintains data model integrity and prevents circular references

This design suggests epics have elevated status in the hierarchy, treated as special cards that organize other cards.

## Comment Mentions

All comment tools support @mentions for tagging workspace members:

**Syntax**: Use `{{@Username}}` template syntax (e.g., `{{@ Sarah Chen}}`)

**Processing**:
1. System scans content for `{{@Username}}` patterns
2. Looks up exact name matches (case-insensitive) against workspace members
3. Converts to HTML `<user-mention>` tags automatically
4. Invalid names remain as plain text (comment still posts successfully)

**Why template syntax?** The `{{@Name}}` delimiters unambiguously mark name boundaries, handling complex names with spaces, Unicode, and special characters.

**Best Practice**: Call `user_get_members` first to verify correct names when ambiguous.

**Example**:
```
Input:  "Hey {{@Sarah Chen}}, can you review this?"
Output: "<p>Hey <user-mention data-type=\"mention\" user-id=\"uT2hPbnu\" ...></user-mention>, can you review this?</p>"
```
