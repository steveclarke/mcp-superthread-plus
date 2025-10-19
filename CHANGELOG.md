# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **BREAKING CHANGE:** Converted all write operations to batch operations with array-based parameters
  - Replaced singular tools with plural batch versions (e.g., `card_create` → `card_creates`, `page_create` → `page_creates`)
  - All tools now require array parameters, even for single operations
  - LLMs always use arrays for consistency (e.g., `cards: [{ workspace_id, card_id, title, ... }]`)
  - Enables efficient bulk operations (create/update/delete multiple items in one call)
  - Fully self-contained objects: each card/tag/space/board/list/comment/project/page/note includes all necessary parameters
  - Sequential processing ensures proper parent-child dependencies
  - Preserved smart positioning logic for all card creation/update operations

### Added
- Batch card operations (all new plural tools):
  - `card_creates` - Create multiple cards with full hierarchy support
  - `card_updates` - Update multiple cards (list moves, archiving, priority changes, etc.)
  - `card_gets` - Retrieve multiple cards in one call
  - `card_deletes` - Delete multiple cards
  - `card_duplicates` - Duplicate multiple cards
  - `card_add_relateds` - Create multiple card relationships (blocks, blocked_by, related, duplicates)
  - `card_remove_relateds` - Remove multiple card relationships
  - `card_add_members` - Bulk member assignments to cards
  - `card_remove_members` - Bulk member removals from cards
  - `card_create_checklists` - Create multiple checklists on cards
  - `card_update_checklists` - Update multiple checklist titles
  - `card_delete_checklists` - Delete multiple checklists
  - `card_add_checklist_items` - Add multiple items to checklists (now supports `checked` parameter)
  - `card_update_checklist_items` - Update multiple checklist items (check/uncheck, edit text)
  - `card_delete_checklist_items` - Delete multiple checklist items
- Batch tag operations (all new plural tools):
  - `tag_creates` - Create multiple tags in one call
  - `tag_updates` - Update multiple tags (name/color changes)
  - `tag_deletes` - Delete multiple tags permanently
- Batch space operations (all new plural tools):
  - `space_creates` - Create multiple spaces (organizational containers)
  - `space_updates` - Update multiple spaces
  - `space_deletes` - Delete multiple spaces
  - `space_add_members` - Add members to spaces in batch
  - `space_remove_members` - Remove members from spaces in batch
- Batch board operations (all new plural tools):
  - `board_creates` - Create multiple boards
  - `board_updates` - Update multiple boards
  - `board_deletes` - Delete multiple boards
  - `board_create_lists` - Create multiple lists (columns/statuses)
  - `board_update_lists` - Update multiple lists
  - `board_delete_lists` - Delete multiple lists
- Batch comment operations (all new plural tools):
  - `comment_creates` - Create multiple comments
  - `comment_updates` - Update multiple comments
  - `comment_deletes` - Delete multiple comments
  - `comment_replies` - Create multiple replies
  - `comment_update_replies` - Update multiple replies
  - `comment_delete_replies` - Delete multiple replies
- Batch project operations (all new plural tools):
  - `project_creates` - Create multiple roadmap projects (epics)
  - `project_updates` - Update multiple projects
  - `project_deletes` - Delete multiple projects
  - `project_add_relateds` - Link multiple cards to projects
  - `project_remove_relateds` - Remove multiple card-project links
- Batch page operations (all new plural tools):
  - `page_creates` - Create multiple pages
  - `page_updates` - Update multiple pages
  - `page_archives` - Archive multiple pages
  - `page_deletes` - Delete multiple pages
- Batch note operations (all new plural tools):
  - `note_creates` - Create multiple meeting notes
  - `note_deletes` - Delete multiple notes
- Enhanced card tag management:
  - `card_remove_tags` - Remove tags from cards in batch (replaces `card_remove_tag`)
- Batch read/get operations (all new plural tools):
  - `project_gets` - Get multiple projects in one call
  - `board_gets` - Get multiple boards in one call
  - `sprint_gets` - Get multiple sprints in one call
  - `space_gets` - Get multiple spaces in one call
  - `page_gets` - Get multiple pages in one call
  - `note_gets` - Get multiple notes in one call
  - `comment_gets` - Get multiple comments in one call
- Checklist item `checked` parameter support
  - Items can now be created as already checked via `card_add_checklist_items`
  - Eliminates need for separate update calls when creating pre-checked items

### Removed
- Singular card tools (replaced with batch versions):
  - `card_create`, `card_update`, `card_get`, `card_delete`, `card_duplicate`
  - `card_add_related`, `card_remove_related`
  - `card_add_member`, `card_remove_member`
  - `card_create_checklist`, `card_delete_checklist`, `card_update_checklist`
  - `card_add_checklist_item`, `card_update_checklist_item`, `card_delete_checklist_item`
- Singular tag tools (replaced with batch versions):
  - `tag_create`, `tag_update`, `tag_delete`
- Singular space tools (replaced with batch versions):
  - `space_create`, `space_update`, `space_delete`, `space_add_member`, `space_remove_member`
- Singular board tools (replaced with batch versions):
  - `board_create`, `board_update`, `board_delete`, `board_create_list`, `board_update_list`, `board_delete_list`
- Singular comment tools (replaced with batch versions):
  - `comment_create`, `comment_update`, `comment_delete`, `comment_reply`, `comment_update_reply`, `comment_delete_reply`
- Singular project tools (replaced with batch versions):
  - `project_create`, `project_update`, `project_delete`, `project_add_related`, `project_remove_related`
- Singular page tools (replaced with batch versions):
  - `page_create`, `page_update`, `page_archive`, `page_delete`
- Singular note tools (replaced with batch versions):
  - `note_create`, `note_delete`
- Singular card tag tool (replaced with batch version):
  - `card_remove_tag`
- Singular read/get tools (replaced with batch versions):
  - `project_get`, `board_get`, `sprint_get`, `space_get`, `page_get`, `note_get`, `comment_get`

### Performance Impact
- Reduces MCP tool calls by up to 80% for bulk operations
- Example: Creating 10 cards with checklists now takes 2 calls instead of 20+

## [0.3.1] - 2025-10-18

### Improved
- Card and project tool descriptions now clarify linking patterns for LLM comprehension
  - Added IMPORTANT LINKING RULES section to `card_create` tool description
  - Added HIERARCHY CREATION guidance with clear examples
  - Enhanced field descriptions for `parent_card_id` (hierarchy relationships) and `epic_id` (roadmap project links)
  - Updated `card_update` with LINKING GUIDANCE section
  - Enhanced `project_add_related` with WHEN TO USE and DO NOT USE FOR sections
  - Emphasizes that only top-level cards should use `epic_id` parameter
  - Documents automatic epic inheritance from parent to child cards

## [0.3.0] - 2025-01-19

### Added
- Smart card positioning with `SUPERTHREAD_LISTS_ADD_TO_TOP` configuration
  - Automatically position cards at top of configured lists (e.g., "Done", "Completed")
  - Supports wildcard patterns (e.g., "Done,Complet*,*finished,*archive*")
  - Supports backslash-escaped commas for list names containing commas
  - Works for both `card_create` and `card_update` operations
  - Explicit position parameter always takes precedence (LLM can override)
  - Performance optimized: skips API calls when feature is not configured

### Improved
- Sprint tool descriptions now clarify when `sprint_get` is optional vs required
  - Reduces unnecessary API calls by LLMs
  - `card_create` can work directly with `sprint_id` without fetching sprint details first

## [0.2.2] - 2025-01-19

### Added
- Checklist items now support @mentions using `{{@Username}}` syntax
  - Applied existing `formatMentions` utility to checklist item titles
  - Works for both `card_add_checklist_item` and `card_update_checklist_item` tools
  - User mentions are converted to proper HTML `<user-mention>` tags with user IDs

### Fixed
- Comment formatting issue where Markdown syntax wasn't rendering properly
  - Updated comment tool descriptions to clarify that HTML content is expected
  - Added HTML formatting documentation with supported tags

## [0.2.1] - 2025-10-17

### Added
- Board list deletion tool
  - New tool: `board_delete_list` for permanently deleting lists/columns from boards

## [0.2.0] - 2025-10-15

### Added
- Tag management tools
  - New tools: `tag_create`, `tag_update`, and `tag_delete`
  - Support for creating, updating, and deleting tags in workspaces
- Selective tool enabling
  - Configure which tool domains to enable via `SUPERTHREAD_ENABLED_TOOLS` environment variable
  - Reduce tool clutter by enabling only specific domains (e.g., `cards,boards`)


## [0.1.0] - 2025-10-14

### Added
- Initial pre-release of unofficial, community-maintained MCP Superthread Plus server
- 50+ tools for comprehensive Superthread API integration
- Card management (create, update, tags, checklists, relationships)
- Board and list management
- Page and documentation management
- Comments and threaded discussions with @mentions
- Roadmap projects (epics) and sprint management
- Space and workspace organization
- Meeting notes management
- Global search across all entities
- Comprehensive documentation and examples

### Known Limitations
- Card content updates not supported via REST API
- Some endpoints are undocumented and may change

[0.3.1]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.3.1
[0.3.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.3.0
[0.2.2]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.2.2
[0.2.1]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.2.1
[0.2.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.2.0
[0.1.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.1.0
