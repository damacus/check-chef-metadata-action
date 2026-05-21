# Claude Code Instructions

## Before Every Commit

Always run the full check suite before committing:

```bash
npm run all
```

This runs: `build → format → lint → package → test`

Then verify the generated action bundle is in sync:

```bash
git diff -- dist/
```

If `dist/` has changes, stage and commit them alongside the source changes:

```bash
git add dist/index.js dist/index.js.map dist/licenses.txt dist/sourcemap-register.js
```

**Never commit source changes in `src/` without also committing the rebuilt `dist/`.**

## What CI Checks

**On pull requests and pushes to `main`** (`.github/workflows/ci.yml`):

1. `npm ci` — clean install from lockfile
2. `npm run format-check` — Prettier formatting check
3. `npm run lint` — ESLint
4. `npm run build && npm run package` — rebuilds `dist/index.js`
5. `npm run test` — Jest test suite
6. `git diff dist/` — fails if the committed action bundle is out of sync

## Key Notes

- Use `npm ci` (not `npm install`) to match what CI does.
- The `dist/index.js` and `dist/index.js.map` files are the actual files GitHub Actions executes, so they must stay in sync with `src/`.
- `npm run format` auto-fixes formatting; `npm run format-check` only validates.
