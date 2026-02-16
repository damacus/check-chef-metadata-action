# Implementation Plan: Streamlined Reporting & Rich Annotations

## Phase 1: Consolidated Reporting Logic
- [x] Task: Update `reportChecks` to handle multiple messages [fe41f9e]
    - [x] Refactor `src/reportChecks.ts` to accept an array of `Message` objects or a single aggregated result.
    - [x] Update it to create only one "Metadata Validation" check run.
- [x] Task: Refactor `main.ts` to aggregate all results before reporting [fe41f9e]
    - [x] Update the main loop to collect all `Message` objects.
    - [x] Call `reportChecks` and `reportPR` only once with the full collection.
- [x] Task: Improve inline annotation formatting [fe41f9e]
    - [x] Update `src/checkMetadata.ts` to use more descriptive titles and messages in `core.error` calls.
- [x] Task: Conductor - User Manual Verification 'Streamlined Reporting & Rich Annotations' (Protocol in workflow.md) [fe41f9e]
