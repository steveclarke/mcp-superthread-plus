# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Smart card positioning with `SUPERTHREAD_LISTS_ADD_TO_TOP` configuration
  - Automatically position cards at top of configured lists (e.g., "Done", "Completed")
  - Supports wildcard patterns (e.g., "Done,Complet*,*finished,*archive*")
  - Works for both `card_create` and `card_update` operations
  - Explicit position parameter always takes precedence (LLM can override)

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

[0.2.1]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.2.1
[0.2.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.2.0
[0.1.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.1.0
