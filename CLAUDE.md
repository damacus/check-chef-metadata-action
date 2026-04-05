# Claude Code Instructions

## Before Every Commit

The `check-dist` CI workflow will fail if any of the following are not satisfied.
Always run this sequence before committing:

```bash
npm run all
```

This runs: `build → format → lint → package → test`

Then verify the dist is in sync:

```bash
git diff dist/
```

If `dist/` has changes, stage and commit them alongside the source changes:

```bash
git add dist/index.js dist/index.js.map
```

**Never commit source changes in `src/` without also committing the rebuilt `dist/`.**

## What `check-dist` Checks

The CI workflow (`.github/workflows/check-dist.yml`) does the following in order:

1. `npm ci` — clean install from lockfile
2. `npm run format-check` — Prettier formatting check
3. `npm run lint` — ESLint
4. `npm run build && npm run package` — rebuilds `dist/index.js`
5. `npm run test` — Jest test suite
6. `git diff dist/` — fails if dist differs from committed version

## Key Notes

- Use `npm ci` (not `npm install`) to match what CI does.
- The `dist/index.js` and `dist/index.js.map` are the actual files GitHub Actions executes — they must stay in sync with `src/`.
- `npm run format` auto-fixes formatting; `npm run format-check` only validates.
