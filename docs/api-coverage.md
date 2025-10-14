# API Coverage

Complete list of all 63 planned tools, their SuperThread API endpoints, and implementation status.

## Development Approach

We're implementing tools **incrementally** to establish solid patterns before scaling:

1. **Phase 1 (Complete)**: Core patterns established ✅
2. **Phase 2 (Current)**: 32 tools implemented - covering primary workflows ✅
3. **Phase 3**: Add remaining tools based on usage needs

## Tool Organization

Tools are organized into 9 categories matching SuperThread's domain model.

## Coverage Summary

| Category           | Total Tools | Implemented | Read-Only | Write  | Status              |
| ------------------ | ----------- | ----------- | --------- | ------ | ------------------- |
| Users              | 5           | 2           | 2         | 0      | 40% ✅               |
| Cards              | 16          | 16          | 3         | 13     | 100% ✅              |
| Projects (Roadmap) | 7           | 7           | 2         | 5      | 100% ✅              |
| Boards             | 8           | 8           | 2         | 6      | 100% ✅              |
| Spaces             | 7           | 2           | 2         | 0      | 29% ✅               |
| Pages              | 7           | 0           | 0         | 0      | 0% ⏸️                |
| Notes              | 4           | 0           | 0         | 0      | 0% ⏸️                |
| Comments           | 8           | 8           | 2         | 6      | 100% ✅              |
| Search             | 1           | 1           | 1         | 0      | 100% ✅              |
| **Total**          | **63**      | **43**      | **15**    | **28** | **68% implemented** |

**Legend:** ✅ Partial | 🚧 In Progress | ⏸️ Planned

## Users (5 tools)

### Implemented ✅

| Tool                  | Method | Endpoint             | Description                   |
| --------------------- | ------ | -------------------- | ----------------------------- |
| `user_get_my_account` | GET    | `/users/me`          | Get current user account info |
| `user_get_members`    | GET    | `/{team_id}/members` | List workspace members        |

### Planned ⏸️

| Tool                     | Method | Endpoint                         | Description         |
| ------------------------ | ------ | -------------------------------- | ------------------- |
| `user_update_my_account` | PATCH  | `/users/me`                      | Update user profile |
| `user_update_member`     | PATCH  | `/{team_id}/members/{member_id}` | Update member role  |
| `user_delete_member`     | DELETE | `/{team_id}/members/{member_id}` | Remove member       |

## Cards (16 tools)

### Implemented ✅

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

### Notes

- **Archive functionality** is handled by `card_update` with `archived: true/false` parameter (no separate tool needed)
- ⚠️ **UNDOCUMENTED ENDPOINTS**: `card_add_member`, `card_remove_member`, `card_create_checklist`, `card_add_checklist_item`, and `card_update_checklist_item` were discovered via browser network inspection and are NOT in SuperThread's official API documentation. These may change without notice.
- See "Known API Limitations" section below for constraint on updating `content`

## Projects/Roadmap (7 tools)

### Implemented ✅

| Tool                     | Method | Endpoint                                     | Description                         |
| ------------------------ | ------ | -------------------------------------------- | ----------------------------------- |
| `project_get_all`        | GET    | `/{team_id}/epics`                           | List all roadmap projects           |
| `project_get`            | GET    | `/{team_id}/epics/{epic_id}`                 | Get project details                 |
| `project_create`         | POST   | `/{team_id}/epics`                           | Create roadmap project              |
| `project_update`         | PATCH  | `/{team_id}/epics/{epic_id}`                 | Update project properties           |
| `project_delete`         | DELETE | `/{team_id}/epics/{epic_id}`                 | Delete project permanently          |
| `project_add_related`    | POST   | `/{team_id}/epics/{epic_id}/cards/{card_id}` | Link card to project ⚠️ UNDOCUMENTED |
| `project_remove_related` | DELETE | `/{team_id}/epics/{epic_id}/cards/{card_id}` | Remove card link ⚠️ UNDOCUMENTED     |

### Planned ⏸️

None - all endpoints implemented!

### Notes

- **Archive functionality** is handled by `project_update` with `archived: true/false` parameter (no separate tool needed)
- **Project-card relationships** use dedicated epic endpoints (not the card relationship endpoints)
- ⚠️ **UNDOCUMENTED ENDPOINTS**: `project_add_related` and `project_remove_related` were discovered via browser network inspection and are NOT in SuperThread's official API documentation. These may change without notice.
- See `docs/project-card-relationship.md` for details on why projects have separate relationship endpoints

## Boards (8 tools)

### Implemented ✅

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

## Spaces (7 tools)

### Implemented ✅

| Tool            | Method | Endpoint                           | Description       |
| --------------- | ------ | ---------------------------------- | ----------------- |
| `space_get_all` | GET    | `/{team_id}/projects`              | List all spaces   |
| `space_get`     | GET    | `/{team_id}/projects/{project_id}` | Get space details |

### Planned ⏸️

| Tool                  | Method | Endpoint                                               | Description         |
| --------------------- | ------ | ------------------------------------------------------ | ------------------- |
| `space_create`        | POST   | `/{team_id}/projects`                                  | Create new space    |
| `space_update`        | PATCH  | `/{team_id}/projects/{project_id}`                     | Update space        |
| `space_add_member`    | POST   | `/{team_id}/projects/{project_id}/members`             | Add member to space |
| `space_remove_member` | DELETE | `/{team_id}/projects/{project_id}/members/{member_id}` | Remove member       |
| `space_delete`        | DELETE | `/{team_id}/projects/{project_id}`                     | Delete space        |

## Comments (8 tools)

### Implemented ✅

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

### Notes

- Comments support status values: `resolved`, `open`, `orphaned`
- Reply operations use child comment endpoints under the parent comment path
- Deleting a parent comment also removes all child replies

## Search (1 tool)

### Implemented ✅

| Tool         | Method | Endpoint            | Description                             |
| ------------ | ------ | ------------------- | --------------------------------------- |
| `search_get` | GET    | `/{team_id}/search` | Search across boards, cards, pages, etc |

### Notes

- Search supports filtering by: `types`, `statuses`, `project_id`, `archived`, `field` (title/content)
- Results can be returned grouped by entity type or ungrouped
- Supports pagination via `cursor` parameter

## Remaining Categories

The following categories (11 tools) are planned but not yet implemented:

- **Pages** (7 tools) - Documentation page management
- **Notes** (4 tools) - Meeting note management

These will be added incrementally as we refine implementation patterns.

## Known API Limitations

### Card Content Updates
**Issue:** The `content` field cannot be updated via REST API endpoints.

**Reason:** SuperThread uses [TipTap collaborative editor](https://newsletter.superthread.com/p/how-we-implemented-tiptap-editor) (built on ProseMirror) for all rich text content. Content changes are synced through a real-time collaboration protocol using operational transforms, not traditional REST API endpoints. Each card has a collaboration token (JWT) for connecting to the TipTap collaboration server.

**Technical Details:**
- Content is edited via TipTap's collaborative editing protocol (WebSocket-based)
- Changes are sent as operational transforms (small incremental operations)
- The collaboration token in card responses is used for real-time sync
- Activity polling (`GET /{team_id}/activity?card_id={card_id}`) tracks changes after they're synced

**Workaround:** Content can only be set during card creation via `card_create`. To update existing content, you must use the SuperThread UI. Programmatic content updates would require implementing the TipTap collaboration protocol, which is beyond the scope of a REST API client.

**Status:** This is an architectural limitation, not a missing API endpoint. Network inspection confirmed no REST endpoint exists for content updates.

### Card Member Assignment ✅ SOLVED VIA NETWORK INSPECTION
**Solution Found:** Members can be added/removed from existing cards using undocumented endpoints discovered via browser network inspection:
- **Add member**: `POST /{team_id}/cards/{card_id}/members` with body `{"user_id": "...", "role": "member"}`
- **Remove member**: `DELETE /{team_id}/cards/{card_id}/members/{user_id}`

**Status:** ⚠️ These endpoints are UNDOCUMENTED in SuperThread's official API and were discovered by inspecting browser network traffic. They may change without notice.

**Tools:** ✅ `card_add_member` and `card_remove_member` have been implemented

### Empty DELETE Responses
**Note:** DELETE endpoints (e.g., `card_delete`) return empty responses with no JSON body. Our API client handles this by returning `{success: true}` for empty 200/204 responses.
