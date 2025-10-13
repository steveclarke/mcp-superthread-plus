# API Coverage

Complete list of all 60 tools, their SuperThread API endpoints, and implementation status.

## Tool Organization

Tools are organized into 9 categories matching SuperThread's domain model.

## Coverage Summary

| Category | Tools | Read-Only | Write | Status |
|----------|-------|-----------|-------|--------|
| User & Team | 5 | 2 | 3 | Scaffold only |
| Cards | 12 | 3 | 9 | Scaffold only |
| Projects (Roadmap) | 8 | 2 | 6 | Scaffold only |
| Boards & Lists | 8 | 2 | 6 | Scaffold only |
| Spaces | 7 | 2 | 5 | Scaffold only |
| Pages | 7 | 2 | 5 | Scaffold only |
| Notes | 4 | 2 | 2 | Scaffold only |
| Comments | 8 | 2 | 6 | Scaffold only |
| Search | 1 | 1 | 0 | Scaffold only |
| **Total** | **60** | **18** | **42** | **0% implemented** |

## User & Team Management (5 tools)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_my_account` | GET | `/users/me` | Get current user account info |
| `get_team_members` | GET | `/teams/{team_id}/members` | List workspace members |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `update_my_account` | PATCH | `/users/me` | Update user profile |
| `update_team_member` | PATCH | `/teams/{team_id}/members/{member_id}` | Update member role |
| `delete_team_member` | DELETE | `/teams/{team_id}/members/{member_id}` | Remove team member |

## Cards/Tasks (12 tools)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_card` | GET | `/{team_id}/cards/{card_id}` | Get card details |
| `get_cards_assigned_to_user` | POST | `/{team_id}/cards/assigned` | Get user's assigned cards |
| `get_tags` | GET | `/{team_id}/tags` | List available tags |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `create_card` | POST | `/{team_id}/cards` | Create new card |
| `update_card` | PATCH | `/{team_id}/cards/{card_id}` | Update card |
| `duplicate_card` | POST | `/{team_id}/cards/{card_id}/duplicate` | Clone card |
| `archive_card` | PATCH | `/{team_id}/cards/{card_id}` | Archive card (sets archived: true) |
| `delete_card` | DELETE | `/{team_id}/cards/{card_id}` | Permanently delete card |
| `add_related_card` | POST | `/{team_id}/cards/{card_id}/related` | Link cards |
| `remove_related_card` | DELETE | `/{team_id}/cards/{card_id}/related` | Unlink cards |
| `add_tags_to_card` | POST | `/{team_id}/cards/{card_id}/tags` | Add tags to card |
| `remove_tag_from_card` | DELETE | `/{team_id}/cards/{card_id}/tags/{tag_id}` | Remove tag |

## Projects/Roadmap (8 tools)

**API Note**: Roadmap projects use `/epics` endpoint

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_project` | GET | `/{team_id}/epics/{epic_id}` | Get project details |
| `get_projects` | GET | `/{team_id}/epics` | List all projects |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `create_project` | POST | `/{team_id}/epics` | Create roadmap project |
| `update_project` | PATCH | `/{team_id}/epics/{epic_id}` | Update project |
| `archive_project` | PATCH | `/{team_id}/epics/{epic_id}` | Archive project |
| `delete_project` | DELETE | `/{team_id}/epics/{epic_id}` | Delete project |
| `add_related_card` | POST | `/{team_id}/epics/{epic_id}/related` | Link card to project |
| `remove_related_card` | DELETE | `/{team_id}/epics/{epic_id}/related/{card_id}` | Unlink card |

## Boards & Lists (8 tools)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_board` | GET | `/{team_id}/boards/{board_id}` | Get board details |
| `get_boards` | GET | `/{team_id}/boards` | List boards |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `create_board` | POST | `/{team_id}/boards` | Create new board |
| `update_board` | PATCH | `/{team_id}/boards/{board_id}` | Update board |
| `duplicate_board` | POST | `/{team_id}/boards/{board_id}/duplicate` | Clone board |
| `delete_board` | DELETE | `/{team_id}/boards/{board_id}` | Delete board |
| `create_list` | POST | `/{team_id}/boards/{board_id}/lists` | Create status column |
| `update_list` | PATCH | `/{team_id}/boards/{board_id}/lists/{list_id}` | Update status column |

## Spaces (7 tools)

**API Note**: Spaces use `/projects` endpoint (not to be confused with Roadmap projects which use `/epics`)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_space` | GET | `/{team_id}/projects/{project_id}` | Get space details |
| `get_spaces` | GET | `/{team_id}/projects` | List spaces |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `create_space` | POST | `/{team_id}/projects` | Create space |
| `update_space` | PATCH | `/{team_id}/projects/{project_id}` | Update space |
| `delete_space` | DELETE | `/{team_id}/projects/{project_id}` | Delete space |
| `add_member_to_space` | POST | `/{team_id}/projects/{project_id}/members` | Add member |
| `remove_member_from_space` | DELETE | `/{team_id}/projects/{project_id}/members/{user_id}` | Remove member |

## Pages/Docs (7 tools)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_page` | GET | `/{team_id}/pages/{page_id}` | Get page content |
| `get_pages` | GET | `/{team_id}/pages` | List pages |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `create_page` | POST | `/{team_id}/pages` | Create page |
| `update_page` | PATCH | `/{team_id}/pages/{page_id}` | Update page |
| `duplicate_page` | POST | `/{team_id}/pages/{page_id}/duplicate` | Clone page |
| `archive_page` | PUT | `/{team_id}/pages/{page_id}/archive` | Archive page |
| `delete_page` | DELETE | `/{team_id}/pages/{page_id}` | Delete page |

## Notes (4 tools)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_note` | GET | `/{team_id}/notes/{note_id}` | Get note details |
| `get_notes` | GET | `/{team_id}/notes` | List notes |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `create_note` | POST | `/{team_id}/notes` | Create note |
| `delete_note` | DELETE | `/{team_id}/notes/{note_id}` | Delete note |

## Comments (8 tools)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_comment` | GET | `/{team_id}/comments/{comment_id}` | Get comment |
| `get_all_replies_to_comment` | GET | `/{team_id}/comments/{comment_id}/replies` | Get replies |

### Write Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `create_comment` | POST | `/{team_id}/comments` | Create comment |
| `edit_comment` | PATCH | `/{team_id}/comments/{comment_id}` | Edit comment |
| `delete_comment` | DELETE | `/{team_id}/comments/{comment_id}` | Delete comment |
| `reply_to_comment` | POST | `/{team_id}/comments/{comment_id}/replies` | Reply to comment |
| `edit_reply` | PATCH | `/{team_id}/comments/{comment_id}/replies/{reply_id}` | Edit reply |
| `delete_reply` | DELETE | `/{team_id}/comments/{comment_id}/replies/{reply_id}` | Delete reply |

## Search (1 tool)

### Read-Only Operations

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `get_search_results` | GET | `/{team_id}/search` | Global search |

## Known API Limitations

_(To be documented as we implement and test)_

### Pagination
- Most list endpoints likely support pagination
- Need to implement cursor or offset-based pagination
- Default page size unknown

### Rate Limiting
- Rate limits unknown
- Need to implement exponential backoff
- Consider request throttling

### Webhook Support
- Not implemented in MCP server
- Could be future enhancement

### Batch Operations
- No batch endpoints discovered yet
- Multiple operations require multiple API calls

## Implementation Priority

Suggested implementation order:

1. **Phase 1 - Core Operations** (Highest Value)
   - `get_my_account` - Essential for getting workspace_id
   - `get_spaces` - Discover organizational structure
   - `get_boards` - List boards
   - `get_board` - Get board with lists for card creation
   - `create_card` - Core task creation
   - `get_card` - View task details

2. **Phase 2 - Task Management**
   - `update_card` - Modify tasks
   - `get_cards_assigned_to_user` - View assignments
   - `add_related_card`, `remove_related_card` - Task dependencies
   - `get_tags`, `add_tags_to_card` - Task categorization

3. **Phase 3 - Organization**
   - `create_space`, `create_board` - Workspace setup
   - `create_list` - Board configuration
   - `get_team_members` - Team awareness

4. **Phase 4 - Advanced Features**
   - Documentation (pages)
   - Projects (roadmap)
   - Comments
   - Search

5. **Phase 5 - Management**
   - Delete operations
   - Archive operations
   - Team member management

## Testing Strategy

For each implemented tool:
1. ✅ Unit test with mocked API client
2. ✅ Integration test with real API (test workspace)
3. ✅ Error handling tests
4. ✅ Parameter validation tests
5. ✅ Documentation with examples

## Future Enhancements

- **Response Caching**: Cache user account, team members
- **Batch Operations**: Group multiple operations when possible
- **Webhooks**: Real-time updates from SuperThread
- **File Attachments**: Handle file uploads to cards/pages
- **Custom Fields**: Support SuperThread custom fields

