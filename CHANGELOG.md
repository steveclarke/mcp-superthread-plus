# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-14

### Added
- Initial release of MCP Superthread Plus
- Comprehensive Superthread API integration with 58 tools across 10 categories
- **Card Management** (19 tools)
  - Create, update, retrieve, and delete cards
  - Card relationships (blocks, related, duplicates)
  - Tag management
  - Member assignment
  - Checklist management (create, update, delete checklists and items)
  - Get assigned cards by user
  - Duplicate cards
- **Roadmap Projects** (7 tools)
  - Create and manage roadmap projects (epics)
  - Link cards to projects
  - Project lifecycle management
- **Board Management** (8 tools)
  - Create and configure boards
  - List management (create, update status columns)
  - Duplicate boards
  - Board organization and structure
- **Page Management** (7 tools)
  - Create and maintain documentation pages
  - Page hierarchy and organization
  - Archive and duplicate pages
  - Full content management
- **Comments & Collaboration** (8 tools)
  - Threaded discussions on cards and pages
  - @mention support with `{{@Username}}` syntax
  - Reply management
  - Comment editing and deletion
- **AI Meeting Notes** (4 tools)
  - Create and manage transcribed meeting notes
  - Note retrieval and organization
- **Sprint Management** (2 tools)
  - List sprints for agile workflows
  - Retrieve sprint details with list IDs
- **Space Management** (2 tools)
  - Organizational containers for projects
  - Space discovery and details
- **User Management** (2 tools)
  - Account information and workspace discovery
  - Workspace member listing
- **Global Search** (1 tool)
  - Search across boards, cards, pages, and entities
  - Filter by type, status, and project

### Architecture
- Composition-based API client with resource classes
- Automatic terminology mapping (modern UI terms ↔ legacy API terms)
- Type-safe TypeScript implementation with proper interfaces
- Centralized error handling and authentication
- Environment-based configuration

### Documentation
- Comprehensive README with installation and usage examples
- Complete tool reference with descriptions
- API reference with 68 planned tools and implementation status
- Architecture documentation for contributors
- API quirks and limitations guide (NOTES.md)
- Terminology mapping reference (Workspace/Space/Project/Status)
- Release process documentation using np tool
- First release guide

### Developer Experience
- TypeScript with strict type checking
- ESLint and Prettier for code quality
- Vitest for unit and integration testing
- Husky for git hooks
- Automated release workflow with np
- pnpm workspace support

### Security
- Secure API key handling via environment variables
- Input validation using Zod schemas
- Path security for file operations

### Known Limitations
- Card content cannot be updated via REST API (requires TipTap collaboration protocol)
- Some endpoints discovered via network inspection are undocumented and may change
- Includes undocumented endpoints: card member assignment, checklist management, project-card relationships

[1.0.0]: https://github.com/steveclarke/mcp-superthread-plus/releases/tag/v1.0.0
