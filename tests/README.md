# Tests

Testing structure for MCP Superthread Plus server.

## Directory Structure

```
tests/
├── unit/            # Unit tests (fast, isolated)
├── integration/     # Integration tests (real API)
├── fixtures/        # Test data and fixtures
└── tmp/             # Temporary files (gitignored)
```

## Running Tests

```bash
# Run all tests
pnpm run test

# Run only unit tests
pnpm run test:unit

# Run only integration tests
pnpm run test:integration

# Watch mode (unit tests)
pnpm run test:watch

# Coverage report
pnpm run test:coverage

# UI mode (interactive)
pnpm run test:ui
```

## Unit Tests

Unit tests are fast, isolated tests that mock external dependencies.

**Location**: `tests/unit/`

**What to test**:
- Configuration loading
- Utility functions
- Parameter validation
- Error handling
- Data transformations

**Example**:
```typescript
import { describe, it, expect } from 'vitest'
import { config } from '../../src/config.js'

describe('Configuration', () => {
  it('loads API key from environment', () => {
    expect(config.apiKey).toBeDefined()
  })
})
```

## Integration Tests

Integration tests use the real Superthread API (requires test workspace).

**Location**: `tests/integration/`

**Setup Required**:
- Test Superthread workspace
- API key with full permissions
- Environment variables set

**What to test**:
- API client request/response
- Tool end-to-end functionality
- Error handling with real API responses
- Authentication flows

**Example**:
```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '../../src/api/client.js'

describe('Card API', () => {
  it('creates and retrieves a card', async () => {
    const client = createClient()
    const card = await client.cards.create(workspaceId, {
      title: 'Test Card',
      list_id: testListId
    })
    
    expect(card.id).toBeDefined()
    
    const retrieved = await client.cards.get(workspaceId, card.id)
    expect(retrieved.title).toBe('Test Card')
  })
})
```

## Test Fixtures

Reusable test data and mock responses.

**Location**: `tests/fixtures/`

**Examples**:
- Mock API responses
- Sample card/board/space objects
- Test workspace configuration

## Temporary Files

Test-generated temporary files.

**Location**: `tests/tmp/` (gitignored)

**Usage**:
- Temporary test outputs
- Downloaded resources
- Generated test data

## Best Practices

### Unit Tests
1. ✅ Fast (< 10ms each)
2. ✅ No external dependencies
3. ✅ Mock API client
4. ✅ Test one thing at a time
5. ✅ Clear test names

### Integration Tests
1. ✅ Use dedicated test workspace
2. ✅ Clean up created resources
3. ✅ Handle rate limits
4. ✅ Test error scenarios
5. ✅ Longer timeout (30s)

### General
1. ✅ Descriptive test names
2. ✅ Arrange-Act-Assert pattern
3. ✅ Test error cases
4. ✅ Avoid test interdependence
5. ✅ Use meaningful assertions

## Environment Variables for Testing

```bash
# Required for integration tests
export SUPERTHREAD_API_KEY="stp-test-xxxxx"
export SUPERTHREAD_WORKSPACE_ID="test_workspace_id"
export SUPERTHREAD_TEST_BOARD_ID="test_board_id"
export SUPERTHREAD_TEST_LIST_ID="test_list_id"
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Cover all implemented tools
- **Error Paths**: Test all error scenarios

## Writing New Tests

When implementing a new tool:

1. **Write unit test first** (TDD)
   ```typescript
   // tests/unit/tools/cards.test.ts
   describe('create_card tool', () => {
     it('validates required parameters', () => {
       // Test parameter validation
     })
     
     it('calls API client correctly', async () => {
       // Mock client, verify call
     })
   })
   ```

2. **Implement the tool**
   ```typescript
   // src/tools/cards.ts
   // Implementation
   ```

3. **Write integration test**
   ```typescript
   // tests/integration/cards.test.ts
   describe('Cards Integration', () => {
     it('creates card via MCP tool', async () => {
       // Test with real API
     })
   })
   ```

## Debugging Tests

```bash
# Run specific test file
pnpm run test tests/unit/config.test.ts

# Run tests matching pattern
pnpm run test -- --grep "card"

# Run with debugging
NODE_OPTIONS='--inspect-brk' pnpm run test

# Verbose output
pnpm run test -- --reporter=verbose
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Pre-commit hooks (unit tests only)

**GitHub Actions** (when added):
```yaml
- name: Run tests
  run: |
    pnpm run test:unit
    # Integration tests only on main branch
    if [ "$GITHUB_REF" == "refs/heads/main" ]; then
      pnpm run test:integration
    fi
```

## Future Testing Enhancements

- [ ] E2E tests with MCP client simulation
- [ ] Performance benchmarks
- [ ] Load testing for rate limits
- [ ] Snapshot testing for responses
- [ ] Visual regression tests (if applicable)

