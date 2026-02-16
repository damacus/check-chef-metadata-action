# Implementation Plan: Export Parsed Metadata as Action Outputs

## Phase 1: Data Integration & Logic
- [x] Task: Update `Message` interface to include parsed data
    - [x] Add an optional `rawMetadata` property to the `Message` interface in `src/messageInterface.ts` to store the parsed fields.
- [x] Task: Update `checkMetadata` to return parsed fields
    - [x] Update `src/checkMetadata.ts` to populate the `rawMetadata` field in the returned object.
- [x] Task: Implement output formatting logic
    - [x] Write unit tests in `test/main.test.ts` for generating the JSON string and convenience outputs.
    - [x] Update `src/main.ts` to iterate through results, construct the aggregated JSON, and set the GitHub Action outputs.

## Phase 2: Configuration & Documentation
- [x] Task: Update `action.yml`
    - [x] Add `cookbooks`, `cookbook-name`, and `cookbook-version` to the `outputs` section.
- [x] Task: Update README and examples
    - [x] Add an "Outputs" section to `README.md` with a clear example of how to use the new outputs in a workflow.
- [x] Task: Conductor - User Manual Verification 'Export Parsed Metadata as Action Outputs' (Protocol in workflow.md)
