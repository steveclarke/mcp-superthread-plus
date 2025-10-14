# Path Traversal Vulnerability Fix

## Overview

Fixed a **critical path traversal vulnerability** where malicious MCP tool callers could supply IDs containing `..` or `/` characters to access unauthorized API endpoints using the user's bearer token.

## The Problem

All MCP tool input schemas accepted any string for IDs (workspace_id, card_id, etc.). Since these IDs were interpolated directly into API paths, an attacker could:

```javascript
// Attack example:
client.cards.get("../users", "me")
// Would become: GET https://api.superthread.com/v1/../users/cards/me
// Which normalizes to: GET https://api.superthread.com/users/me
```

This bypassed intended routing and exposed any endpoint the bearer token could access.

## The Solution

Implemented a **defense-in-depth** approach with three layers:

### Layer 1: Input Validation (Early Rejection)
Simple regex whitelist in `validatePathSegment()`:
```javascript
/^[a-zA-Z0-9_-]+$/
```
Rejects obviously malicious input before processing.

### Layer 2: URL Encoding (Safety Net)
`encodeURIComponent()` on every path segment in `buildSafePath()`:
- Handles edge cases that might bypass validation
- Web standard with battle-tested implementation
- Zero dependencies

### Layer 3: Bounds Checking (Final Defense)
In `client.request()`:
1. URL constructor normalizes the path
2. Verify constructed URL starts with base URL
3. Reject if URL escaped bounds

## Files Modified

### Core Implementation
- `src/utils.ts` - Validation and encoding helpers
- `src/api/client.ts` - URL construction with bounds checking

### Test Coverage
- `tests/unit/utils.test.ts` - 26 unit tests for validation logic
- `tests/integration/path-security.test.ts` - 54 integration tests covering:
  - All API resource methods
  - Real-world attack scenarios
  - Edge cases and encoding tricks

## Attack Scenarios Prevented

✅ **Directory Traversal**
```javascript
workspace_id = ".."           // Rejected by validation
workspace_id = "../users"     // Rejected by validation
card_id = "../../teams"       // Rejected by validation
```

✅ **Path Injection**
```javascript
workspace_id = "workspace/hack"   // Rejected by validation
card_id = "card/../users"         // Rejected by validation
```

✅ **URL Encoding Tricks**
```javascript
workspace_id = "%2e%2e"       // Rejected (% not in whitelist)
workspace_id = ".%2e"         // Rejected (% not in whitelist)
```

✅ **Special Characters**
```javascript
workspace_id = "workspace@hack"   // Rejected by validation
workspace_id = "workspace!hack"   // Rejected by validation
```

## Why This Approach

1. **Simple** - No external dependencies, easy to audit (~100 lines of code)
2. **Secure** - Three independent layers of defense
3. **Maintainable** - Clear, straightforward implementation
4. **Standards-based** - Uses web standards (URL constructor, encodeURIComponent)
5. **Well-tested** - 80+ tests covering security scenarios

## Verification

All tests pass:
```bash
npm test
✓ tests/unit/utils.test.ts (26 tests)
✓ tests/integration/path-security.test.ts (54 tests)
```

No linter errors in modified files.

## References

- Security finding: Path traversal on API paths via user-supplied IDs
- Pattern: Defense in depth (validation + encoding + bounds checking)
- Standards: URL constructor (WHATWG URL Standard), encodeURIComponent (RFC 3986)

