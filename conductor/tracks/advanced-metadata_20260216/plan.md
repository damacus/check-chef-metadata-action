# Implementation Plan: Advanced Metadata Validation & Multi-Cookbook Support

## Phase 1: Multi-Cookbook Support
- [x] Task: Implement glob pattern matching for `file_path`
    - [x] Write unit tests for glob pattern resolution in a mock file system
    - [x] Update `src/main.ts` to use a globbing library (e.g., `@actions/glob`) to identify all metadata files
- [x] Task: Refactor reporting to support multiple Check Runs
    - [x] Update `src/reportChecks.ts` to accept specific cookbook names and paths for the Check Run title/context
    - [x] Update the main action loop in `src/main.ts` to iterate over found cookbooks and trigger individual checks/reports
- [x] Task: Conductor - User Manual Verification 'Multi-Cookbook Support' (Protocol in workflow.md)

## Phase 2: Robust Parsing & Dependencies
- [x] Task: Enhance parser for Ruby symbols
    - [x] Write unit tests for fields using symbol syntax (e.g., `license :apache2`) in `test/metadata.test.ts`
    - [x] Update regex in `src/metadata.ts` to support optional leading colons and unquoted symbol values
- [x] Task: Implement `depends` field validation
    - [x] Write unit tests for valid/invalid `depends` entries in `test/metadata.test.ts`
    - [x] Add `depends` validation logic to `src/checkMetadata.ts` and ensure it's aggregated
- [x] Task: Conductor - User Manual Verification 'Robust Parsing & Dependencies' (Protocol in workflow.md)

## Phase 3: URL Validation & Configurable Strictness
- [ ] Task: Implement live URL verification
    - [ ] Write tests using a mocking library (e.g., `nock`) to simulate successful and failed HTTP requests
    - [ ] Implement async URL checking logic in `src/checkMetadata.ts` using `undici` or `node-fetch`
- [ ] Task: Implement `mandatory_fields` configuration
    - [ ] Write tests for various `mandatory_fields` input strings
    - [ ] Update `src/checkMetadata.ts` to dynamically enforce fields based on the new input
- [ ] Task: Update documentation and action configuration
    - [ ] Update `action.yml` with the new `mandatory_fields` input
    - [ ] Update `README.md` with multi-cookbook and strictness examples
- [ ] Task: Conductor - User Manual Verification 'URL Validation & Configurable Strictness' (Protocol in workflow.md)
