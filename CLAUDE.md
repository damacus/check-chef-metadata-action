# Claude Code Instructions

## Before Every Commit

Always run the full check suite before committing:

```bash
npm run all
```

This runs: `build → format → lint → package → test`

**Do not commit `dist/`** — it is gitignored and automatically rebuilt by CI when changes are merged to `main`.

## What CI Checks

**On pull requests** (`.github/workflows/check-dist.yml`):

1. `npm ci` — clean install from lockfile
2. `npm run format-check` — Prettier formatting check
3. `npm run lint` — ESLint
4. `npm run build && npm run package` — ensures the build succeeds
5. `npm run test` — Jest test suite

**On merge to main** (`.github/workflows/update-dist.yml`):

Automatically rebuilds `dist/index.js` and commits it if changed. This is the file GitHub Actions executes when the action is used with `uses: damacus/check-chef-metadata-action@main`.

## Key Notes

- Use `npm ci` (not `npm install`) to match what CI does.
- `npm run format` auto-fixes formatting; `npm run format-check` only validates.
