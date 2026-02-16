# Implementation Plan: Streamlined Reporting & Rich Annotations

## Phase 1: Consolidated Reporting Logic
- [ ] Task: Update `reportChecks` to handle multiple messages
    - [ ] Refactor `src/reportChecks.ts` to accept an array of `Message` objects or a single aggregated result.
    - [ ] Update it to create only one "Metadata Validation" check run.
- [ ] Task: Refactor `main.ts` to aggregate all results before reporting
    - [ ] Update the main loop to collect all `Message` objects.
    - [ ] Call `reportChecks` and `reportPR` only once with the full collection.
- [ ] Task: Improve inline annotation formatting
    - [ ] Update `src/checkMetadata.ts` to use more descriptive titles and messages in `core.error` calls.
- [ ] Task: Conductor - User Manual Verification 'Streamlined Reporting & Rich Annotations' (Protocol in workflow.md)
