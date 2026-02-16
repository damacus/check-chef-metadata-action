# Implementation Plan: Export Parsed Metadata as Action Outputs

## Phase 1: Data Integration & Logic
- [ ] Task: Update `Message` interface to include parsed data
    - [ ] Add an optional `rawMetadata` property to the `Message` interface in `src/messageInterface.ts` to store the parsed fields.
- [ ] Task: Update `checkMetadata` to return parsed fields
    - [ ] Update `src/checkMetadata.ts` to populate the `rawMetadata` field in the returned object.
- [ ] Task: Implement output formatting logic
    - [ ] Write unit tests in `test/main.test.ts` for generating the JSON string and convenience outputs.
    - [ ] Update `src/main.ts` to iterate through results, construct the aggregated JSON, and set the GitHub Action outputs.

## Phase 2: Configuration & Documentation
- [ ] Task: Update `action.yml`
    - [ ] Add `cookbooks`, `cookbook-name`, and `cookbook-version` to the `outputs` section.
- [ ] Task: Update README and examples
    - [ ] Add an "Outputs" section to `README.md` with a clear example of how to use the new outputs in a workflow.
- [ ] Task: Conductor - User Manual Verification 'Export Parsed Metadata as Action Outputs' (Protocol in workflow.md)
