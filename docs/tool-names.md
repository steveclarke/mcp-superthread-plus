# Superthread MCP Tool Names

This document contains the complete mapping of all planned MCP tools with their entity-prefixed naming convention.

## Naming Convention

Format: `{entity}_{action}`

All tool names use Superthread's UI terminology (not legacy API terms):
- Workspace (not "team")
- Space (not API "project")
- Project (not API "epic")
- Status (not API "list")

## Complete Tool Mapping (60 Tools)

### Users (5 tools)

| Tool Name                | API Method                       | Description           | Status        |
| ------------------------ | -------------------------------- | --------------------- | ------------- |
| `user_get_my_account`    | `UserResource.getMyAccount()`    | Get current user info | ✅ Implemented |
| `user_update_my_account` | `UserResource.updateMyAccount()` | Update current user   | ⏸️ Planned     |
| `user_get_members`       | `UserResource.getMembers()`      | Get workspace members | 🚧 In Progress |
| `user_update_member`     | `UserResource.updateMember()`    | Update member role    | ⏸️ Planned     |
| `user_delete_member`     | `UserResource.deleteMember()`    | Remove member         | ⏸️ Planned     |

### Cards (12 tools)

| Tool Name                   | API Method                         | Description              | Status        |
| --------------------------- | ---------------------------------- | ------------------------ | ------------- |
| `card_create`               | `CardResource.create()`            | Create new card          | 🚧 In Progress |
| `card_update`               | `CardResource.update()`            | Update card              | ⏸️ Planned     |
| `card_get`                  | `CardResource.get()`               | Get card details         | ⏸️ Planned     |
| `card_duplicate`            | `CardResource.duplicate()`         | Duplicate card           | ⏸️ Planned     |
| `card_get_assigned_to_user` | `CardResource.getAssignedToUser()` | Get user's cards         | ⏸️ Planned     |
| `card_add_relation`         | `CardResource.addRelation()`       | Add card relationship    | ⏸️ Planned     |
| `card_remove_relation`      | `CardResource.removeRelation()`    | Remove card relationship | ⏸️ Planned     |
| `card_archive`              | `CardResource.archive()`           | Archive card             | ⏸️ Planned     |
| `card_delete`               | `CardResource.delete()`            | Delete card              | ⏸️ Planned     |
| `card_get_tags`             | `CardResource.getTags()`           | Get all tags             | ⏸️ Planned     |
| `card_add_tags`             | `CardResource.addTags()`           | Add tags to card         | ⏸️ Planned     |
| `card_remove_tag`           | `CardResource.removeTag()`         | Remove tag from card     | ⏸️ Planned     |

### Projects (8 tools - Roadmap)

| Tool Name             | API Method                     | Description              | Status    |
| --------------------- | ------------------------------ | ------------------------ | --------- |
| `project_create`      | `ProjectResource.create()`     | Create roadmap project   | ⏸️ Planned |
| `project_update`      | `ProjectResource.update()`     | Update project           | ⏸️ Planned |
| `project_get`         | `ProjectResource.get()`        | Get project details      | ⏸️ Planned |
| `project_get_all`     | `ProjectResource.list()`       | List all projects        | ⏸️ Planned |
| `project_add_card`    | `ProjectResource.addCard()`    | Add card to project      | ⏸️ Planned |
| `project_remove_card` | `ProjectResource.removeCard()` | Remove card from project | ⏸️ Planned |
| `project_archive`     | `ProjectResource.archive()`    | Archive project          | ⏸️ Planned |
| `project_delete`      | `ProjectResource.delete()`     | Delete project           | ⏸️ Planned |

### Boards (8 tools)

| Tool Name             | API Method                     | Description          | Status    |
| --------------------- | ------------------------------ | -------------------- | --------- |
| `board_create`        | `BoardResource.create()`       | Create board         | ⏸️ Planned |
| `board_update`        | `BoardResource.update()`       | Update board         | ⏸️ Planned |
| `board_create_status` | `BoardResource.createStatus()` | Create status column | ⏸️ Planned |
| `board_update_status` | `BoardResource.updateStatus()` | Update status column | ⏸️ Planned |
| `board_duplicate`     | `BoardResource.duplicate()`    | Duplicate board      | ⏸️ Planned |
| `board_get`           | `BoardResource.get()`          | Get board details    | ⏸️ Planned |
| `board_get_all`       | `BoardResource.list()`         | List all boards      | ⏸️ Planned |
| `board_delete`        | `BoardResource.delete()`       | Delete board         | ⏸️ Planned |

### Spaces (7 tools)

| Tool Name             | API Method                     | Description              | Status    |
| --------------------- | ------------------------------ | ------------------------ | --------- |
| `space_create`        | `SpaceResource.create()`       | Create space             | ⏸️ Planned |
| `space_update`        | `SpaceResource.update()`       | Update space             | ⏸️ Planned |
| `space_get`           | `SpaceResource.get()`          | Get space details        | ⏸️ Planned |
| `space_get_all`       | `SpaceResource.list()`         | List all spaces          | ⏸️ Planned |
| `space_add_member`    | `SpaceResource.addMember()`    | Add member to space      | ⏸️ Planned |
| `space_remove_member` | `SpaceResource.removeMember()` | Remove member from space | ⏸️ Planned |
| `space_delete`        | `SpaceResource.delete()`       | Delete space             | ⏸️ Planned |

### Pages (7 tools)

| Tool Name        | API Method                 | Description      | Status    |
| ---------------- | -------------------------- | ---------------- | --------- |
| `page_create`    | `PageResource.create()`    | Create page      | ⏸️ Planned |
| `page_update`    | `PageResource.update()`    | Update page      | ⏸️ Planned |
| `page_get`       | `PageResource.get()`       | Get page details | ⏸️ Planned |
| `page_duplicate` | `PageResource.duplicate()` | Duplicate page   | ⏸️ Planned |
| `page_get_all`   | `PageResource.list()`      | List all pages   | ⏸️ Planned |
| `page_archive`   | `PageResource.archive()`   | Archive page     | ⏸️ Planned |
| `page_delete`    | `PageResource.delete()`    | Delete page      | ⏸️ Planned |

### Notes (4 tools)

| Tool Name      | API Method              | Description      | Status    |
| -------------- | ----------------------- | ---------------- | --------- |
| `note_create`  | `NoteResource.create()` | Create note      | ⏸️ Planned |
| `note_get`     | `NoteResource.get()`    | Get note details | ⏸️ Planned |
| `note_get_all` | `NoteResource.list()`   | List all notes   | ⏸️ Planned |
| `note_delete`  | `NoteResource.delete()` | Delete note      | ⏸️ Planned |

### Comments (8 tools)

| Tool Name              | API Method                      | Description         | Status    |
| ---------------------- | ------------------------------- | ------------------- | --------- |
| `comment_create`       | `CommentResource.create()`      | Create comment      | ⏸️ Planned |
| `comment_update`       | `CommentResource.update()`      | Update comment      | ⏸️ Planned |
| `comment_get`          | `CommentResource.get()`         | Get comment details | ⏸️ Planned |
| `comment_get_replies`  | `CommentResource.getReplies()`  | Get all replies     | ⏸️ Planned |
| `comment_create_reply` | `CommentResource.createReply()` | Reply to comment    | ⏸️ Planned |
| `comment_update_reply` | `CommentResource.updateReply()` | Update reply        | ⏸️ Planned |
| `comment_delete_reply` | `CommentResource.deleteReply()` | Delete reply        | ⏸️ Planned |
| `comment_delete`       | `CommentResource.delete()`      | Delete comment      | ⏸️ Planned |

### Search (1 tool)

| Tool Name | API Method                | Description   | Status    |
| --------- | ------------------------- | ------------- | --------- |
| `search`  | `SearchResource.search()` | Global search | ⏸️ Planned |

## Status Legend

- ✅ **Implemented** - Fully working with real API calls
- 🚧 **In Progress** - Currently being implemented
- ⏸️ **Planned** - Documented but not yet implemented

## Implementation Strategy

We're implementing tools incrementally:

1. **Phase 1** (Current): `user_get_my_account`, `user_get_members`, `card_create`
2. **Phase 2**: Add 2-3 more commonly used tools
3. **Phase 3+**: Continue adding tools based on usage needs

This allows us to:
- Establish solid patterns before scaling
- Refine error handling and validation
- Minimize refactoring when patterns change
- Test thoroughly with small set

## Adding New Tools

When implementing a new tool:

1. Update status in this file to 🚧
2. Implement API resource method in `src/api/*.ts`
3. Add tool registration in `src/tools/*.ts`
4. Add error handling and validation
5. Test thoroughly
6. Update status to ✅
7. Document in README.md examples

