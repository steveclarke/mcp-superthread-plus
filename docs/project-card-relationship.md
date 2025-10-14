# Project-Card Relationship Discovery

## Summary

Projects (Epics) in SuperThread have a dual nature:
- They are treated **internally as cards** with card-like properties
- But they require **separate API endpoints** for relationship management

## Evidence

### 1. Projects Have Card Properties

When fetching project 214 (Unio), the response shows:

```json
{
  "epic": {
    "id": "214",
    "type": "epic",
    "linked_cards": [],           // ← Projects can have linked cards
    "list_id": "106",              // ← Card properties
    "list_color": "#498CF7",       // ← Card properties
    "status": "started",           // ← Card properties
    "tags": [],                    // ← Card properties
    "members": [],                 // ← Card properties
    "child_cards": [...]           // ← Projects have child cards
  }
}
```

### 2. Collaboration Token Reveals Card Nature

The JWT token in the response contains:
```json
{
  "resource_type": "card",    // ← Epic is treated as a card internally!
  "resource_id": "214"
}
```

### 3. But Card Endpoints Reject Epic IDs

When attempting to use the card relationship endpoint with an epic ID:

```bash
POST /{team_id}/cards/214/related   # Using epic 214 as card_id
```

**Result:** `400 Bad Request: "cannot link card to epic"`

This explicitly blocks using card-to-card relationship endpoints with epics.

## The Correct API Endpoints (DISCOVERED - UNDOCUMENTED!)

These endpoints are **NOT in SuperThread's public API documentation** but were discovered by inspecting browser network traffic.

### Add Related Card to Project
```
POST /{team_id}/epics/{epic_id}/cards/{card_id}
Body: (empty/no body)
Response: { "child_card": {...} }
```

### Remove Related Card from Project
```
DELETE /{team_id}/epics/{epic_id}/cards/{card_id}
Body: (empty/no body)
Response: (empty, 204 No Content or similar)
```

**Key Discovery:** The card ID is in the URL path, NOT in the request body!

## Documentation Confusion

The SuperThread documentation shows both:
1. **Projects section**: "Remove related card" → But shows the cards endpoint
2. **Cards section**: "Remove related card" → Same cards endpoint

Both URLs (`/docs/api-docs/projects/remove-related-project` and `/docs/api-docs/cards/remove-related-card`) show:
```
DELETE /{team_id}/cards/{card_id}/linked_cards/{linked_card_id}
```

However, based on our implementation card 292 metadata and API testing, the actual endpoints for projects are:
```
POST/DELETE /{team_id}/epics/{epic_id}/related
```

## Implementation

We've now implemented both tools:

### `project_add_related`
Links a card to a roadmap project (epic)

### `project_remove_related` 
Removes a card link from a roadmap project (epic)

These use the dedicated epic endpoints rather than the card relationship endpoints.

## Why This Matters

This design decision by SuperThread suggests:
1. **Epics are special cards** - They have elevated status in the hierarchy
2. **Prevents circular references** - Cards can't create epic relationships via normal means
3. **Maintains data model integrity** - Epic relationships are tracked separately

## Testing

To test after restarting the MCP server:

```typescript
// This should work now:
await project_add_related({
  workspace_id: "t4k7Wa2e",
  project_id: "214",      // Epic/Project ID
  card_id: "293"          // Regular card ID
})
```

## Testing Results ✅

**Successfully tested on 2025-01-14:**

1. **Removed card 293 from Unio project (214)**:
   - Called: `DELETE /t4k7Wa2e/epics/214/cards/293`
   - Result: Card's `epic` field removed
   - Status: ✅ SUCCESS

2. **Added card 293 back to Unio project (214)**:
   - Called: `POST /t4k7Wa2e/epics/214/cards/293`
   - Result: Card's `epic` field restored with `{"id": "214", "title": "Unio"}`
   - Response included `child_card` object
   - Status: ✅ SUCCESS

Both tools (`project_add_related` and `project_remove_related`) are fully functional!

## Conclusion

The card "Projects: Remove Related Card" on the SuperThread MCP board was indeed a separate feature from "Cards: Remove Related Card", despite the documentation confusion. Projects require dedicated endpoints for relationship management even though they share card-like properties internally.

**The real endpoints were undocumented** but discoverable through browser network inspection. The correct format uses the card ID in the URL path: `/{team_id}/epics/{epic_id}/cards/{card_id}` with no request body.

