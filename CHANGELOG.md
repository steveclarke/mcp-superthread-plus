# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Tag management tools: `tag_create`, `tag_update`, and `tag_delete`
- Support for creating, updating, and deleting tags in workspaces
- Tags can be associated with specific projects/spaces
- Selective tool enabling by domain via `SUPERTHREAD_ENABLED_TOOLS` environment variable
- Support for enabling only specific tool domains (e.g., `cards,boards`) to reduce tool clutter

### Changed
- Extended API client with `TagResource` class for tag operations

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

[0.1.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v0.1.0
