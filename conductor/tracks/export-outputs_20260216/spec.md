# Track Specification: Export Parsed Metadata as Action Outputs

## Overview
This track enables the action to export the validated cookbook metadata as GitHub Action outputs. This allows subsequent steps in a workflow to use information like the cookbook name and version for tasks like tagging, release creation, or automated reporting.

## Functional Requirements
- **Aggregated JSON Output:**
    - Export a single output named `cookbooks`.
    - The value will be a JSON string representing an array of objects.
    - Each object will contain `name`, `version`, and `path` (relative to the project root).
- **Convenience Outputs (Single Cookbook):**
    - If exactly one cookbook is identified and validated, export additional convenience outputs:
        - `cookbook-name`: The `name` field from the metadata.
        - `cookbook-version`: The `version` field from the metadata.
- **Consistency:** Ensure outputs are set even in multi-cookbook scenarios, aggregating all identified metadata.

## Non-Functional Requirements
- **JSON Safety:** Ensure the JSON output is correctly formatted and escaped for GitHub Actions.
- **Reliability:** Maintain >80% test coverage for the output generation logic.

## Acceptance Criteria
- [ ] A multi-cookbook repository correctly exports a JSON array in the `cookbooks` output.
- [ ] A single-cookbook repository exports the `cookbooks` JSON array (containing one item), as well as the `cookbook-name` and `cookbook-version` convenience outputs.
- [ ] The `path` field in the JSON contains the relative path to the `metadata.rb` file.
- [ ] `action.yml` is updated to include the new output definitions.

## Out of Scope
- Exporting non-identification fields (e.g., license, maintainer) as individual flat outputs.
