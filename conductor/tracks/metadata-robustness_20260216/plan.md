# Implementation Plan: Metadata Enhancement & Robust Reporting

## Phase 1: Validation Logic Expansion
- [x] Task: Add SemVer validation for the `version` field [ff29db7]
    - [x] Write unit tests for valid and invalid Semantic Versioning strings in `test/metadata.test.ts`
    - [x] Implement SemVer validation logic in `src/metadata.ts` using a robust regex or library
- [ ] Task: Add version constraint validation for the `chef_version` field
    - [ ] Write unit tests for various `chef_version` constraint formats in `test/metadata.test.ts`
    - [ ] Implement constraint validation logic in `src/metadata.ts`
- [ ] Task: Add validation for the `supports` field
    - [ ] Write unit tests for `supports` field parsing (platform + version) in `test/metadata.test.ts`
    - [ ] Implement `supports` validation logic in `src/metadata.ts`, ensuring it handles multiple entries
- [ ] Task: Conductor - User Manual Verification 'Validation Logic Expansion' (Protocol in workflow.md)

## Phase 2: Reporting Robustness & Error Aggregation
- [ ] Task: Implement error aggregation in the core validator
    - [ ] Write tests to verify that multiple metadata violations return a collection of errors
    - [ ] Update `checkMetadata` logic to continue validation after the first error and aggregate all results
- [ ] Task: Refine Line-Level Annotation Precision
    - [ ] Write tests for precise line detection of repeated fields (like `supports`)
    - [ ] Update reporting logic to ensure annotations point to the exact source lines for all aggregated errors
- [ ] Task: Enhance PR Comment Summary Table
    - [ ] Write tests for the refined markdown table generator
    - [ ] Update `src/reportPR.ts` to use the more descriptive and actionable table format
- [ ] Task: Conductor - User Manual Verification 'Reporting Robustness & Error Aggregation' (Protocol in workflow.md)

## Phase 3: Integration & Finalization
- [ ] Task: Update mandatory field enforcement
    - [ ] Write integration tests to ensure the action fails when any of the new mandatory fields are missing
    - [ ] Update the main action loop in `src/main.ts` to enforce the new mandatory requirements
- [ ] Task: Update documentation and configuration
    - [ ] Update `README.md` with examples including the new mandatory fields
    - [ ] Ensure all public methods are documented with JSDoc
- [ ] Task: Conductor - User Manual Verification 'Integration & Finalization' (Protocol in workflow.md)
