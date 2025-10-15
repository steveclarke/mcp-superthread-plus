# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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

[0.2.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.2.0
[0.1.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.1.0
