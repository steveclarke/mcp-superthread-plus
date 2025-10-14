# API Coverage

Complete list of all 60 planned tools, their SuperThread API endpoints, and implementation status.

## Development Approach

We're implementing tools **incrementally** to establish solid patterns before scaling:

1. **Phase 1 (Current)**: 3 tools implemented - establishing patterns
2. **Phase 2**: Add 5-10 more commonly used tools
3. **Phase 3+**: Continue adding based on actual usage needs

## Tool Organization

Tools are organized into 9 categories matching SuperThread's domain model.

## Coverage Summary

| Category           | Total Tools | Implemented | Read-Only | Write | Status              |
| ------------------ | ----------- | ----------- | --------- | ----- | ------------------- |
| Users              | 5           | 2           | 2         | 0     | 40% ✅               |
| Cards              | 12          | 7           | 2         | 5     | 58% ✅               |
| Projects (Roadmap) | 8           | 2           | 2         | 0     | 25% ✅               |
| Boards             | 8           | 4           | 2         | 2     | 50% ✅               |
| Spaces             | 7           | 2           | 2         | 0     | 29% ✅               |
| Pages              | 7           | 0           | 0         | 0     | 0% ⏸️                |
| Notes              | 4           | 0           | 0         | 0     | 0% ⏸️                |
| Comments           | 8           | 0           | 0         | 0     | 0% ⏸️                |
| Search             | 1           | 0           | 0         | 0     | 0% ⏸️                |
| **Total**          | **60**      | **17**      | **10**    | **7** | **28% implemented** |

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

## Cards (12 tools)

### Implemented ✅

| Tool                | Method | Endpoint                                  | Description                   |
| ------------------- | ------ | ----------------------------------------- | ----------------------------- |
| `card_create`       | POST   | `/{team_id}/cards`                        | Create new card               |
| `card_update`       | PATCH  | `/{team_id}/cards/{card_id}`              | Update card properties        |
| `card_get`          | GET    | `/{team_id}/cards/{card_id}`              | Get card details              |
| `card_duplicate`    | POST   | `/{team_id}/cards/{card_id}/copy`         | Clone card                    |
| `card_get_assigned` | POST   | `/{team_id}/views/preview`                | Get user's assigned cards     |
| `card_add_related`  | POST   | `/{team_id}/cards/{card_id}/linked_cards` | Link cards with relationships |
| `card_delete`       | DELETE | `/{team_id}/cards/{card_id}`              | Delete card permanently       |

### Planned ⏸️

| Tool                  | Method | Endpoint                                                   | Description              |
| --------------------- | ------ | ---------------------------------------------------------- | ------------------------ |
| `card_remove_related` | DELETE | `/{team_id}/cards/{card_id}/linked_cards/{linked_card_id}` | Remove card relationship |
| `card_get_tags`       | GET    | `/{team_id}/tags`                                          | List available tags      |
| `card_add_tags`       | POST   | `/{team_id}/cards/{card_id}/tags`                          | Add tags to card         |
| `card_remove_tag`     | DELETE | `/{team_id}/cards/{card_id}/tags/{tag_id}`                 | Remove tag               |

### Notes

- **Archive functionality** is handled by `card_update` with `archived: true/false` parameter (no separate tool needed)
- See "Known API Limitations" section below for constraints on updating `content` and `members`

## Projects/Roadmap (8 tools)

### Implemented ✅

| Tool              | Method | Endpoint                     | Description               |
| ----------------- | ------ | ---------------------------- | ------------------------- |
| `project_get_all` | GET    | `/{team_id}/epics`           | List all roadmap projects |
| `project_get`     | GET    | `/{team_id}/epics/{epic_id}` | Get project details       |

### Planned ⏸️

| Tool                     | Method | Endpoint                             | Description            |
| ------------------------ | ------ | ------------------------------------ | ---------------------- |
| `project_create`         | POST   | `/{team_id}/epics`                   | Create roadmap project |
| `project_update`         | PATCH  | `/{team_id}/epics/{epic_id}`         | Update project         |
| `project_add_related`    | POST   | `/{team_id}/epics/{epic_id}/related` | Add related card       |
| `project_remove_related` | DELETE | `/{team_id}/epics/{epic_id}/related` | Remove related card    |
| `project_archive`        | PATCH  | `/{team_id}/epics/{epic_id}`         | Archive project        |
| `project_delete`         | DELETE | `/{team_id}/epics/{epic_id}`         | Delete project         |

## Boards (8 tools)

### Implemented ✅

| Tool                | Method | Endpoint                       | Description                 |
| ------------------- | ------ | ------------------------------ | --------------------------- |
| `board_get_all`     | GET    | `/{team_id}/boards`            | List all boards             |
| `board_get`         | GET    | `/{team_id}/boards/{board_id}` | Get board details           |
| `board_create`      | POST   | `/{team_id}/boards`            | Create new board            |
| `board_create_list` | POST   | `/{team_id}/lists`             | Create list/column on board |

### Planned ⏸️

| Tool                | Method | Endpoint                                 | Description             |
| ------------------- | ------ | ---------------------------------------- | ----------------------- |
| `board_update`      | PATCH  | `/{team_id}/boards/{board_id}`           | Update board properties |
| `board_update_list` | PATCH  | `/{team_id}/lists/{list_id}`             | Update list/column      |
| `board_duplicate`   | POST   | `/{team_id}/boards/{board_id}/duplicate` | Clone board             |
| `board_delete`      | DELETE | `/{team_id}/boards/{board_id}`           | Delete board            |

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

## Remaining Categories

The following categories (22 tools) are planned but not yet implemented:

- **Pages** (7 tools) - Documentation page management
- **Notes** (4 tools) - Meeting note management
- **Comments** (8 tools) - Comment and reply management
- **Search** (1 tool) - Global search across entities

These will be added incrementally as we refine implementation patterns.

## Known API Limitations

### Card Content Updates
**Issue:** The `content` field cannot be updated via the PATCH `/{team_id}/cards/{card_id}` endpoint.

**Reason:** Card content editing likely requires the WebSocket-based real-time collaboration API for concurrent editing support.

**Workaround:** Content can only be set during card creation via `card_create`. To update content, you must use the SuperThread UI or implement WebSocket collaboration protocol.

**Reference:** Official API documentation does not list `content` as an updatable field for the PATCH endpoint.

### Card Member Assignment
**Issue:** Members cannot be assigned to existing cards via the PATCH `/{team_id}/cards/{card_id}` endpoint.

**Reason:** Member assignment after card creation likely requires a separate dedicated endpoint (not yet discovered in API documentation).

**Workaround:** Members can only be assigned during card creation via `card_create` using the `members` parameter. To add members to existing cards, use the SuperThread UI.

**Status:** We have not yet found a working API endpoint for adding members to existing cards.

### Empty DELETE Responses
**Note:** DELETE endpoints (e.g., `card_delete`) return empty responses with no JSON body. Our API client handles this by returning `{success: true}` for empty 200/204 responses.
