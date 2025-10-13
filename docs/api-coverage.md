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

| Category | Total Tools | Implemented | Read-Only | Write | Status |
|----------|-------------|-------------|-----------|-------|--------|
| Users | 5 | 2 | 2 | 0 | 40% ✅ |
| Cards | 12 | 1 | 0 | 1 | 8% 🚧 |
| Projects (Roadmap) | 8 | 0 | 0 | 0 | 0% ⏸️ |
| Boards | 8 | 0 | 0 | 0 | 0% ⏸️ |
| Spaces | 7 | 0 | 0 | 0 | 0% ⏸️ |
| Pages | 7 | 0 | 0 | 0 | 0% ⏸️ |
| Notes | 4 | 0 | 0 | 0 | 0% ⏸️ |
| Comments | 8 | 0 | 0 | 0 | 0% ⏸️ |
| Search | 1 | 0 | 0 | 0 | 0% ⏸️ |
| **Total** | **60** | **3** | **2** | **1** | **5% implemented** |

**Legend:** ✅ Partial | 🚧 In Progress | ⏸️ Planned

## Users (5 tools)

### Implemented ✅

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `user_get_my_account` | GET | `/users/me` | Get current user account info |
| `user_get_members` | GET | `/{team_id}/members` | List workspace members |

### Planned ⏸️

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `user_update_my_account` | PATCH | `/users/me` | Update user profile |
| `user_update_member` | PATCH | `/{team_id}/members/{member_id}` | Update member role |
| `user_delete_member` | DELETE | `/{team_id}/members/{member_id}` | Remove member |

## Cards (12 tools)

### Implemented ✅

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `card_create` | POST | `/{team_id}/cards` | Create new card |

### Planned ⏸️

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `card_update` | PATCH | `/{team_id}/cards/{card_id}` | Update card properties |
| `card_get` | GET | `/{team_id}/cards/{card_id}` | Get card details |
| `card_duplicate` | POST | `/{team_id}/cards/{card_id}/duplicate` | Clone card |
| `card_get_assigned_to_user` | POST | `/{team_id}/cards/assigned` | Get user's assigned cards |
| `card_add_relation` | POST | `/{team_id}/cards/{card_id}/related` | Add card relationship |
| `card_remove_relation` | DELETE | `/{team_id}/cards/{card_id}/related` | Remove relationship |
| `card_archive` | PATCH | `/{team_id}/cards/{card_id}` | Archive card |
| `card_delete` | DELETE | `/{team_id}/cards/{card_id}` | Delete card |
| `card_get_tags` | GET | `/{team_id}/tags` | List available tags |
| `card_add_tags` | POST | `/{team_id}/cards/{card_id}/tags` | Add tags to card |
| `card_remove_tag` | DELETE | `/{team_id}/cards/{card_id}/tags/{tag_id}` | Remove tag |

## Remaining Tool Categories

The following categories (45 tools) are planned but not yet implemented. See `docs/tool-names.md` for the complete list:

- **Projects/Roadmap** (8 tools) - Managing roadmap projects/epics
- **Boards** (8 tools) - Board and status column management
- **Spaces** (7 tools) - Space/project container management
- **Pages** (7 tools) - Documentation page management
- **Notes** (4 tools) - Meeting note management
- **Comments** (8 tools) - Comment and reply management
- **Search** (1 tool) - Global search across entities

These will be added incrementally as we refine implementation patterns.
