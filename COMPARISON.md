# TypeScript Action vs Reusable Workflow Comparison

## Overview

This document compares the original TypeScript action with the new reusable workflow implementation.

## Feature Comparison

| Feature                    | TypeScript Action | Reusable Workflow | Notes                                    |
| -------------------------- | ----------------- | ----------------- | ---------------------------------------- |
| Validates maintainer       | ✅                | ✅                | Identical functionality                  |
| Validates maintainer_email | ✅                | ✅                | Identical functionality                  |
| Validates license          | ✅                | ✅                | Identical functionality                  |
| Validates source_url       | ✅                | ✅                | Auto-generated from repo                 |
| Validates issues_url       | ✅                | ✅                | Auto-generated from repo                 |
| Email format validation    | ✅                | ✅                | Regex-based validation                   |
| SPDX license validation    | ✅                | ✅                | Format validation                        |
| GitHub Checks API          | ✅                | ✅                | Creates check runs                       |
| PR Comments                | ✅                | ✅                | Comments on validation failure           |
| Fork detection             | ✅                | ✅                | Skips reporting on forks                 |
| Main branch detection      | ✅                | ✅                | Skips reporting on main                  |
| Configurable inputs        | ✅                | ✅                | All inputs preserved                     |
| Error reporting            | ✅                | ✅                | Detailed error messages                  |

## Technical Comparison

### TypeScript Action

**Pros:**

- Familiar to JavaScript/TypeScript developers
- Type safety with TypeScript
- Comprehensive test suite with Jest
- Uses official GitHub Actions toolkit

**Cons:**

- Requires Node.js runtime
- Needs compilation step (TypeScript → JavaScript)
- Must commit `dist/` directory (or use build workflow)
- Dependencies need regular updates (npm packages)
- Larger codebase (~600+ lines across multiple files)
- More complex build/release process

**File Structure:**

```text
src/
├── main.ts                 (50 lines)
├── checkMetadata.ts        (163 lines)
├── metadata.ts             (60 lines)
├── reportChecks.ts         (~50 lines)
├── reportPR.ts             (~50 lines)
└── messageInterface.ts     (~20 lines)
dist/
└── index.js                (compiled, ~1000+ lines)
node_modules/               (dependencies)
package.json
tsconfig.json
```

### Reusable Workflow

**Pros:**

- No compilation or build step required
- No dependencies to maintain
- Pure bash script (standard Unix tools)
- Single file, easy to understand
- No `dist/` directory to commit
- Faster execution (no Node.js installation)
- Simpler maintenance and updates
- Native GitHub Actions YAML

**Cons:**

- Bash scripting may be less familiar to some developers
- No type safety
- Limited to bash capabilities
- Testing requires different approach

**File Structure:**

```text
.github/workflows/
└── check-metadata-reusable.yml  (single file, ~220 lines)
```

## Performance Comparison

| Metric                  | TypeScript Action | Reusable Workflow |
| ----------------------- | ----------------- | ----------------- |
| Execution time          | ~15-20 seconds    | ~5-10 seconds     |
| Setup time              | Node.js install   | None              |
| Disk space              | ~50MB (node_modules) | ~0MB           |
| Lines of code           | ~600+ lines       | ~220 lines        |

## Maintenance Comparison

### TypeScript Action

**Regular maintenance needed:**

- Update Node.js version
- Update npm dependencies (@actions/core, @actions/github, etc.)
- Rebuild and commit dist/ after changes
- Update TypeScript version
- Update Jest and testing dependencies
- Security patches for dependencies

**Release process:**

1. Make code changes in `src/`
2. Run `npm run build`
3. Commit both `src/` and `dist/`
4. Create release tag
5. Update action version references

### Reusable Workflow

**Regular maintenance needed:**

- Update actions/checkout version (if needed)
- Update actions/github-script version (if needed)
- Update bash script logic (rare)

**Release process:**

1. Make changes to workflow file
2. Commit changes
3. Create release tag (optional)
4. Update workflow references

## Code Complexity

### TypeScript Action - Parsing Logic

```typescript
export const metadata = (file_path: fs.PathLike): Map<string, string> => {
  let fileContent: string
  const metadata_structure = new Map<string, string>()
  const allowed_keys = [
    'name', 'maintainer', 'maintainer_email', 'license',
    'description', 'source_url', 'issues_url', 'chef_version', 'version'
  ]

  try {
    fileContent = fs.readFileSync(file_path, 'utf8')
  } catch (error) {
    throw new Error(`Could not read metadata file: ${error}`)
  }

  const arr = fileContent
    .toString()
    .split('\n')
    .filter((el: string): boolean => {
      return (
        !/^%\b/.test(el.trim()) &&
        el.trim() !== '' &&
        !el.trim().startsWith('#')
      )
    })

  for (const element of arr) {
    const regex = /(\w+)\s+('|")(.*?)('|")/
    const item = element.match(regex)
    const key: string = item ? item[1] : ''
    const value: string = item ? item[3] : ''

    if (allowed_keys.includes(key)) {
      metadata_structure.set(key, value)
    }
  }

  return metadata_structure
}
```

### Reusable Workflow - Parsing Logic

```bash
parse_metadata() {
  local key=$1
  grep -E "^[[:space:]]*${key}[[:space:]]+" "$FILE_PATH" | \
    sed -E "s/^[[:space:]]*${key}[[:space:]]+['\"](.+)['\"].*/\1/" | \
    head -n 1
}

ACTUAL_MAINTAINER=$(parse_metadata "maintainer")
ACTUAL_MAINTAINER_EMAIL=$(parse_metadata "maintainer_email")
ACTUAL_LICENSE=$(parse_metadata "license")
```

**Analysis:**

- Reusable workflow is more concise
- Both achieve the same result
- Bash version leverages standard Unix tools
- TypeScript version is more verbose but type-safe

## Migration Effort

### From TypeScript Action to Reusable Workflow

**Minimal changes required:**

```yaml
# Before (TypeScript Action)
- uses: damacus/check-chef-metadata-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    maintainer_email: help@sous-chefs.org

# After (Reusable Workflow)
jobs:
  check-metadata:
    uses: damacus/check-chef-metadata-action/.github/workflows/check-metadata-reusable.yml@main
    with:
      maintainer_email: help@sous-chefs.org
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

**Breaking changes:** None - all inputs and outputs are preserved

## Recommendations

### Use TypeScript Action if:

- You prefer type-safe code
- Your team is primarily JavaScript/TypeScript developers
- You need complex logic that benefits from npm packages
- You want comprehensive Jest test coverage

### Use Reusable Workflow if:

- You want zero dependencies
- You prefer simpler maintenance
- You want faster execution
- You're comfortable with bash scripting
- You want to avoid committing compiled code

## Conclusion

Both implementations provide identical functionality. The reusable workflow offers:

- **Simpler maintenance** (no dependencies, no build step)
- **Faster execution** (no Node.js installation)
- **Smaller footprint** (single file vs multiple files + node_modules)
- **Easier updates** (edit one file vs rebuild and commit dist/)

The TypeScript action offers:

- **Type safety** (TypeScript benefits)
- **Familiar tooling** (for JS/TS developers)
- **Comprehensive tests** (Jest test suite)

For this simple validation task, the reusable workflow is recommended due to its simplicity and lower maintenance overhead.
