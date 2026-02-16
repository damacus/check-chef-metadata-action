# Implementation Plan: Metadata Enhancement & Robust Reporting

## Phase 1: Validation Logic Expansion
- [x] Task: Add SemVer validation for the `version` field [ff29db7]
    - [x] Write unit tests for valid and invalid Semantic Versioning strings in `test/metadata.test.ts`
    - [x] Implement SemVer validation logic in `src/metadata.ts` using a robust regex or library
- [x] Task: Add version constraint validation for the `chef_version` field [4932c3b]
    - [x] Write unit tests for various `chef_version` constraint formats in `test/metadata.test.ts`
    - [x] Implement constraint validation logic in `src/metadata.ts`
- [x] Task: Add validation for the `supports` field [dc6908c]
    - [x] Write unit tests for `supports` field parsing (platform + version) in `test/metadata.test.ts`
    - [x] Implement `supports` validation logic in `src/metadata.ts`, ensuring it handles multiple entries
- [x] Task: Conductor - User Manual Verification 'Validation Logic Expansion' (Protocol in workflow.md) [0dcd3cd]

## Phase 2: Reporting Robustness & Error Aggregation
- [x] Task: Implement error aggregation in the core validator [46005aa]
    - [x] Write tests to verify that multiple metadata violations return a collection of errors
    - [x] Update `checkMetadata` logic to continue validation after the first error and aggregate all results
- [x] Task: Refine Line-Level Annotation Precision [46005aa]
    - [x] Write tests for precise line detection of repeated fields (like `supports`)
    - [x] Update reporting logic to ensure annotations point to the exact source lines for all aggregated errors
- [x] Task: Enhance PR Comment Summary Table [46005aa]
    - [x] Write tests for the refined markdown table generator
    - [x] Update `src/reportPR.ts` to use the more descriptive and actionable table format
- [x] Task: Conductor - User Manual Verification 'Reporting Robustness & Error Aggregation' (Protocol in workflow.md) [6e696f0]

## Phase 3: Integration & Finalization
- [x] Task: Update mandatory field enforcement [6e696f0]
    - [x] Write integration tests to ensure the action fails when any of the new mandatory fields are missing
    - [x] Update the main action loop in `src/main.ts` to enforce the new mandatory requirements
- [x] Task: Update documentation and configuration [d72dbb3]
    - [x] Update `README.md` with examples including the new mandatory fields
    - [x] Ensure all public methods are documented with JSDoc
- [x] Task: Conductor - User Manual Verification 'Integration & Finalization' (Protocol in workflow.md) [0dcd3cd]
