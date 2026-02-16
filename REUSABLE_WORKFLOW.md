# Check Chef Cookbook Metadata - Reusable Workflow

This is a GitHub reusable workflow that replaces the TypeScript action with a pure workflow-based solution.

## Purpose

Validates Chef cookbook `metadata.rb` files to ensure they contain correct:

- Maintainer name
- Maintainer email
- License (SPDX format)
- Source URL (auto-generated from repository)
- Issues URL (auto-generated from repository)

## Features

- ✅ **No dependencies**: Pure bash script, no Node.js or TypeScript compilation needed
- ✅ **Same functionality**: Validates all fields just like the original action
- ✅ **GitHub integration**: Creates check runs and PR comments
- ✅ **Fork-safe**: Automatically skips reporting on forks and main branch
- ✅ **Configurable**: All inputs match the original action

## Usage

### Basic Usage

Create a workflow file in your repository (e.g., `.github/workflows/check-metadata.yml`):

```yaml
---
name: Check Metadata

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check-metadata:
    uses: damacus/check-chef-metadata-action/.github/workflows/check-metadata-reusable.yml@main
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

### With Custom Configuration

```yaml
---
name: Check Metadata

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check-metadata:
    uses: damacus/check-chef-metadata-action/.github/workflows/check-metadata-reusable.yml@main
    with:
      maintainer: 'Your Organization'
      maintainer_email: 'help@example.com'
      license: 'MIT'
      file_path: 'metadata.rb'
      report_checks: true
      comment_on_pr: true
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input              | Description                          | Required | Default                  |
| ------------------ | ------------------------------------ | -------- | ------------------------ |
| `maintainer`       | Desired name of the maintainer       | No       | `Sous Chefs`             |
| `maintainer_email` | Maintainer email                     | No       | `help@sous-chefs.org`    |
| `license`          | A SPDX licence                       | No       | `Apache-2.0`             |
| `file_path`        | Path to the metadata.rb file         | No       | `metadata.rb`            |
| `report_checks`    | Report the result as a check         | No       | `true`                   |
| `comment_on_pr`    | Comment on the PR with the result    | No       | `true`                   |

## Secrets

| Secret         | Description                  | Required |
| -------------- | ---------------------------- | -------- |
| `github-token` | GitHub token for API access  | No       |

**Note**: If not provided, the workflow will use `secrets.GITHUB_TOKEN` automatically.

## Permissions

The calling workflow needs these permissions:

```yaml
permissions:
  checks: write        # Required for the status check
  pull-requests: write # Required for the PR comment
  statuses: write      # Required for the status check
  contents: read       # Required to checkout code
```

## Validation Rules

The workflow validates the following fields in your `metadata.rb`:

1. **maintainer**: Must match the configured value (default: `Sous Chefs`)
2. **maintainer_email**: Must match the configured value (default: `help@sous-chefs.org`)
3. **license**: Must match the configured value (default: `Apache-2.0`)
4. **source_url**: Must be `https://github.com/{owner}/{repo}`
5. **issues_url**: Must be `https://github.com/{owner}/{repo}/issues`

## Example metadata.rb

```ruby
name              'java'
maintainer        'Sous Chefs'
maintainer_email  'help@sous-chefs.org'
license           'Apache-2.0'
description       'Recipes and resources for installing Java'
source_url        'https://github.com/sous-chefs/java'
issues_url        'https://github.com/sous-chefs/java/issues'
chef_version      '>= 15.3'
version           '9.0.0'
```

## Advantages Over the TypeScript Action

1. **No build step**: No need to compile TypeScript or commit `dist/` directory
2. **Simpler maintenance**: Pure bash script is easier to understand and modify
3. **Faster execution**: No Node.js installation required
4. **Same functionality**: All features from the original action are preserved
5. **Better error messages**: Clear, formatted error output with emojis

## Migration from TypeScript Action

Replace this:

```yaml
- uses: damacus/check-chef-metadata-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    maintainer_email: help@sous-chefs.org
```

With this:

```yaml
jobs:
  check-metadata:
    uses: damacus/check-chef-metadata-action/.github/workflows/check-metadata-reusable.yml@main
    with:
      maintainer_email: help@sous-chefs.org
    secrets:
      github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Behavior on Forks and Main Branch

The workflow automatically detects:

- **Forks**: Skips check runs and PR comments (GitHub API limitations)
- **Main branch**: Skips check runs and PR comments (validation only)

This matches the behavior of the original TypeScript action.

## Troubleshooting

### Validation fails but metadata looks correct

Ensure there are no extra spaces or quotes in your `metadata.rb` file. The parser expects:

```ruby
maintainer        'Sous Chefs'  # Single or double quotes
```

### Check runs not appearing

Verify that:

1. The workflow has the required permissions
2. You're not running on a fork
3. You're not running on the main branch
4. `report_checks` input is set to `true` (default)

### PR comments not appearing

Verify that:

1. The workflow has `pull-requests: write` permission
2. You're running on a pull request event
3. `comment_on_pr` input is set to `true` (default)
4. The validation actually failed (comments only appear on failure)
