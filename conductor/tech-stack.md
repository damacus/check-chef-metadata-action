# Tech Stack: Check Chef Cookbook Metadata Action

## Core Technologies
- **Language:** TypeScript (Primary programming language for type safety and maintainability)
- **Runtime:** Node.js (v20+ as specified for GitHub Actions runner compatibility)

## GitHub Actions Integration
- **Toolkit:** `@actions/core` (For inputs, outputs, and logging)
- **GitHub API:** `@actions/github` (For interaction with the GitHub API and PR contexts)
- **Globbing:** `glob` (For resolving multi-cookbook file paths)

## Build & Distribution
- **Bundler:** `@vercel/ncc` (Compiles TypeScript and dependencies into a single file for fast execution)
- **Target:** `dist/index.js` (The main entry point for the action execution)

## Quality Assurance
- **Testing:** Jest with `ts-jest` (For unit and integration testing of metadata parsing logic)
- **Linting:** ESLint (Enforces code quality and standard TypeScript patterns)
- **Formatting:** Prettier (Ensures consistent code style across the project)
