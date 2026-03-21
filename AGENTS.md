# Agent Guidelines

## Conventional Commits

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This is enforced and non-negotiable.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to use                                                       |
| ---------- | ----------------------------------------------------------------- |
| `feat`     | A new feature                                                     |
| `fix`      | A bug fix                                                         |
| `chore`    | Maintenance tasks, dependency updates, tooling changes            |
| `docs`     | Documentation only changes                                        |
| `style`    | Formatting, missing semicolons, etc. (no logic change)            |
| `refactor` | Code restructuring with no feature or bug-fix change              |
| `perf`     | Performance improvements                                          |
| `test`     | Adding or updating tests                                          |
| `build`    | Changes affecting the build system or external dependencies       |
| `ci`       | Changes to CI/CD configuration files and scripts                  |
| `revert`   | Revert a previous commit                                          |

### Rules

1. The `<type>` and `<description>` are **mandatory**.
2. The description must be in **lowercase** (sentence case is acceptable, title case is not).
3. Do **not** end the description with a period.
4. Breaking changes must append `!` after the type/scope (e.g. `feat!:`) and include a `BREAKING CHANGE:` footer.
5. Do **not** prefix commit messages with emojis — the type field conveys the intent.
6. Keep the subject line under **72 characters**.

### Examples

```
feat(validation): add SemVer check for cookbook version
fix: handle metadata.rb files with inline comments
chore(deps): update dependency undici to v7.24.5
perf: use HEAD requests for URL accessibility checks
ci: enable automerge for Renovate PRs
feat!: drop support for Node 18

BREAKING CHANGE: minimum required Node.js version is now 20
```

### Invalid Examples

```
# Missing type
Fix metadata parsing

# Emoji prefix instead of type
⚡ Bolt: Run URL accessibility checks concurrently

# Title case description
feat: Add Retry Logic

# Trailing period
fix: handle null pointer.
```

## Pull Requests

- PR titles must follow the same Conventional Commits format as commit messages.
- Each PR should represent a single logical change.
- Prefer squash merges so the PR title becomes the single merge commit.
