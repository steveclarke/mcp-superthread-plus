# First Release Guide

This guide covers the initial v0.1.0 pre-release of `mcp-superthread-plus` to npm. Good news: you can use `np` for your first release!

## Can I Use np for First Release?

**Yes!** The `np` tool works perfectly for initial releases. It will:
- Create the first git tag
- Publish to npm for the first time (with proper `--access public` flag)
- Create the first GitHub release

You don't need to do anything manually. Just follow the checklist below.

## Pre-Release Checklist

Complete these tasks before running `pnpm release`:

### 1. Documentation & Package Info

- [ ] **README.md** - Review and ensure it's complete and accurate
  - Installation instructions are clear
  - All 50+ tools are documented
  - Examples are helpful
  - Links work
- [ ] **CHANGELOG.md** - Add v0.1.0 entry with:
  - Release date
  - Major features list
  - Note that this is the initial pre-release
- [ ] **package.json** - Verify metadata:
  - `version` is set to `0.1.0` (np will publish as 0.1.0)
  - `description` is accurate
  - `keywords` are comprehensive
  - `repository` URL is correct
  - `bugs` URL is correct
  - `homepage` is correct
  - `author` is correct
  - `license` is MIT
- [ ] **LICENSE** file exists and is correct

### 2. Code Quality

- [ ] **All tests pass**: `pnpm test`
- [ ] **Build succeeds**: `pnpm run build`
- [ ] **Lint passes**: `pnpm run lint`
- [ ] **No uncommitted changes**: `git status` is clean
- [ ] Code is on `master` branch
- [ ] Local branch is up to date: `git pull`

### 3. npm Setup

- [ ] **Logged into npm**: Verify with `npm whoami`
- [ ] **Package name available**: Check https://www.npmjs.com/package/mcp-superthread-plus
  - If it shows 404, you're good to go!
  - If it exists, you need to choose a different name

### 4. Testing the Package

Before publishing, test that your package works as intended:

- [ ] **Test installation locally**:
  ```bash
  # Create a test tarball
  pnpm run pack:dist
  
  # In another directory, test install
  npm install -g ~/path/to/mcp-superthread-plus/tmp/mcp-superthread-plus-0.1.0.tgz
  
  # Verify it works
  mcp-superthread-plus --help  # or however you test it
  ```

- [ ] **Test in MCP client** (Claude Desktop/Cursor):
  - Configure with the local build
  - Verify a few tools work correctly
  - Check error handling

## Release Process

Once all checklist items are complete:

### Step 1: Dry Run (Preview)

Test the release process without actually publishing:

```bash
pnpm release --preview
```

This shows you exactly what will happen. Review the output carefully.

### Step 2: Choose Your Version

For the first pre-release, you'll publish `0.1.0` as-is:

When `np` prompts you, select: **patch** (keeps 0.1.0)

Or use the `--no-version-bump` flag to skip the version bump prompt

### Step 3: Execute Release

```bash
pnpm release
```

Then:
1. Select version bump: **skip** or keep as `0.1.0`
2. Confirm when prompted
3. Wait for all steps to complete:
   - ✅ Tests run
   - ✅ Build completes
   - ✅ Git tag created
   - ✅ Package published to npm
   - ✅ Changes pushed to GitHub
   - ✅ GitHub release created

### What np Does Automatically

For your first release, `np` will:
1. Run your test suite
2. Build the dist files
3. Keep `package.json` at v0.1.0
4. Create git commit: "0.1.0"
5. Create git tag: `v0.1.0`
6. Publish to npm with `--access public` (for first-time publish)
7. Push commit and tag to GitHub
8. Create GitHub release with link to npm

## After Release

### Immediate Verification

- [ ] **Check npm**: Visit https://www.npmjs.com/package/mcp-superthread-plus
  - Package should appear within 1-2 minutes
  - Verify README renders correctly
  - Check version is 0.1.0
  
- [ ] **Check GitHub**: Visit https://github.com/steveclarke/mcp-superthread-plus/releases
  - Release v0.1.0 should exist
  - Tag should be present
  
- [ ] **Test installation**: In a fresh environment:
  ```bash
  npx -y mcp-superthread-plus --version
  ```

### Post-Release Tasks

- [ ] **Update CHANGELOG.md** for next version:
  ```markdown
  ## [Unreleased]
  
  ### Added
  ### Changed
  ### Fixed
  ```

- [ ] **Announce the release**:
  - Social media
  - Relevant communities
  - Team members

- [ ] **Monitor issues**: Watch for installation or usage problems

## Troubleshooting First Release

### "Package name already taken"

If `mcp-superthread-plus` is already taken on npm:
1. Choose a new name
2. Update `package.json` → `name` field
3. Update README installation instructions
4. Re-run the release

### "You do not have permission to publish"

Make sure you're logged in:
```bash
npm whoami
npm login  # if needed
```

### "Git working directory not clean"

Commit or stash all changes:
```bash
git status
git add .
git commit -m "Prepare for v0.1.0 release"
```

### "Tests failed"

Fix the failing tests before releasing:
```bash
pnpm test
# Fix issues
```

Never skip tests for a production release.

### Build Errors

Ensure TypeScript compiles without errors:
```bash
pnpm run build
# Fix any compilation errors
```

## Quick Reference

**Full checklist in order:**

1. ✅ Documentation complete (README, CHANGELOG, package.json)
2. ✅ Tests pass (`pnpm test`)
3. ✅ Build works (`pnpm run build`)
4. ✅ Git is clean and up to date
5. ✅ Logged into npm (`npm whoami`)
6. ✅ Package name available
7. ✅ Dry run successful (`pnpm release --preview`)
8. 🚀 Execute release (`pnpm release`)
9. ✅ Verify on npm and GitHub
10. ✅ Test installation works

**Time estimate:** 30-45 minutes (including verification)

## Future Releases

After this first release, subsequent releases are even simpler:
- Update CHANGELOG.md
- Ensure tests pass
- Run `pnpm release`
- Choose patch/minor/major
- Done!

See [`release-process.md`](./release-process.md) for ongoing release workflows.

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [np Documentation](https://github.com/sindresorhus/np)

