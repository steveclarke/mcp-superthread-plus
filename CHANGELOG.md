# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **BREAKING CHANGE:** Renamed all batch tools from plural to singular for better grammar
  - Changed tool names to singular while keeping plural array parameters (e.g., `card_creates` → `card_create`, `page_creates` → `page_create`)
  - All tools still require array parameters, even for single operations
  - LLMs always use arrays for consistency (e.g., `card_create({ cards: [{ workspace_id, card_id, title, ... }] })`)
  - Follows industry best practices (Stripe, GitHub APIs use singular names for batch operations)
  - Three layers prevent LLM confusion: singular tool name + plural parameter name (`cards:`) + array schema
  - Enables efficient bulk operations (create/update/delete multiple items in one call)
  - Fully self-contained objects: each card/tag/space/board/list/comment/project/page/note includes all necessary parameters
  - Sequential processing ensures proper parent-child dependencies
  - Preserved smart positioning logic for all card creation/update operations

### Added
- Batch card operations (singular tool names with array parameters):
  - `card_create` - Create multiple cards with full hierarchy support
  - `card_update` - Update multiple cards (list moves, archiving, priority changes, etc.)
  - `card_get` - Retrieve multiple cards in one call
  - `card_delete` - Delete multiple cards
  - `card_duplicate` - Duplicate multiple cards
  - `card_add_related` - Create multiple card relationships (blocks, blocked_by, related, duplicates)
  - `card_remove_related` - Remove multiple card relationships
  - `card_add_member` - Bulk member assignments to cards
  - `card_remove_member` - Bulk member removals from cards
  - `card_create_checklist` - Create multiple checklists on cards
  - `card_update_checklist` - Update multiple checklist titles
  - `card_delete_checklist` - Delete multiple checklists
  - `card_add_checklist_item` - Add multiple items to checklists (now supports `checked` parameter)
  - `card_update_checklist_item` - Update multiple checklist items (check/uncheck, edit text)
  - `card_delete_checklist_item` - Delete multiple checklist items
- Batch tag operations (singular tool names with array parameters):
  - `tag_create` - Create multiple tags in one call
  - `tag_update` - Update multiple tags (name/color changes)
  - `tag_delete` - Delete multiple tags permanently
- Batch space operations (singular tool names with array parameters):
  - `space_create` - Create multiple spaces (organizational containers)
  - `space_update` - Update multiple spaces
  - `space_delete` - Delete multiple spaces
  - `space_add_member` - Add members to spaces in batch
  - `space_remove_member` - Remove members from spaces in batch
- Batch board operations (singular tool names with array parameters):
  - `board_create` - Create multiple boards
  - `board_update` - Update multiple boards
  - `board_delete` - Delete multiple boards
  - `board_create_list` - Create multiple lists (columns/statuses)
  - `board_update_list` - Update multiple lists
  - `board_delete_list` - Delete multiple lists
- Batch comment operations (singular tool names with array parameters):
  - `comment_create` - Create multiple comments
  - `comment_update` - Update multiple comments
  - `comment_delete` - Delete multiple comments
  - `comment_reply` - Create multiple replies
  - `comment_update_reply` - Update multiple replies
  - `comment_delete_reply` - Delete multiple replies
- Batch project operations (singular tool names with array parameters):
  - `project_create` - Create multiple roadmap projects (epics)
  - `project_update` - Update multiple projects
  - `project_delete` - Delete multiple projects
  - `project_add_related` - Link multiple cards to projects
  - `project_remove_related` - Remove multiple card-project links
- Batch page operations (singular tool names with array parameters):
  - `page_create` - Create multiple pages
  - `page_update` - Update multiple pages
  - `page_archive` - Archive multiple pages
  - `page_delete` - Delete multiple pages
- Batch note operations (singular tool names with array parameters):
  - `note_create` - Create multiple meeting notes
  - `note_delete` - Delete multiple notes
- Enhanced card tag management:
  - `card_remove_tag` - Remove tags from cards in batch
- Batch read/get operations (singular tool names with array parameters):
  - `project_get` - Get multiple projects in one call
  - `board_get` - Get multiple boards in one call
  - `sprint_get` - Get multiple sprints in one call
  - `space_get` - Get multiple spaces in one call
  - `page_get` - Get multiple pages in one call
  - `note_get` - Get multiple notes in one call
  - `comment_get` - Get multiple comments in one call
- Checklist item `checked` parameter support
  - Items can now be created as already checked via `card_add_checklist_item`
  - Eliminates need for separate update calls when creating pre-checked items

### Removed
- Plural card tools (renamed to singular):
  - `card_creates`, `card_updates`, `card_gets`, `card_deletes`, `card_duplicates`
  - `card_add_relateds`, `card_remove_relateds`
  - `card_add_members`, `card_remove_members`
  - `card_create_checklists`, `card_delete_checklists`, `card_update_checklists`
  - `card_add_checklist_items`, `card_update_checklist_items`, `card_delete_checklist_items`
- Plural tag tools (renamed to singular):
  - `tag_creates`, `tag_updates`, `tag_deletes`
- Plural space tools (renamed to singular):
  - `space_creates`, `space_updates`, `space_deletes`, `space_add_members`, `space_remove_members`
- Plural board tools (renamed to singular):
  - `board_creates`, `board_updates`, `board_deletes`, `board_create_lists`, `board_update_lists`, `board_delete_lists`
- Plural comment tools (renamed to singular):
  - `comment_creates`, `comment_updates`, `comment_deletes`, `comment_replies`, `comment_update_replies`, `comment_delete_replies`
- Plural project tools (renamed to singular):
  - `project_creates`, `project_updates`, `project_deletes`, `project_add_relateds`, `project_remove_relateds`
- Plural page tools (renamed to singular):
  - `page_creates`, `page_updates`, `page_archives`, `page_deletes`
- Plural note tools (renamed to singular):
  - `note_creates`, `note_deletes`
- Plural card tag tool (renamed to singular):
  - `card_remove_tags`
- Plural read/get tools (renamed to singular):
  - `project_gets`, `board_gets`, `sprint_gets`, `space_gets`, `page_gets`, `note_gets`, `comment_gets`

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
