# Track Specification: Metadata Enhancement & Robust Reporting

## Overview
This track expands the validation capabilities of the Check Chef Cookbook Metadata Action to include `version`, `chef_version`, and `supports` fields as mandatory requirements. It also improves the developer feedback loop by aggregating all errors and providing more precise, line-level reporting.

## Functional Requirements
- **Mandatory Field Validation:**
    - Validate that the `version` field exists and follows Semantic Versioning (SemVer) standards.
    - Validate that the `chef_version` field exists and contains a valid version constraint (e.g., `>= 16.0`).
    - Validate that at least one `supports` field exists and specifies a valid platform name with an optional version constraint.
- **Robust Reporting:**
    - **Error Aggregation:** The action must continue validating all fields even after a failure is detected, reporting all found issues at the end of the run.
    - **Line-Level Precision:** Annotations must accurately point to the specific line in `metadata.rb` where the violation occurred, including for multi-line or repeated fields like `supports`.
    - **Enhanced PR Comments:** Improve the summary table in PR comments to provide a clearer, more descriptive breakdown of each failure and the required remediation.

## Non-Functional Requirements
- **Reliability:** Maintain >80% code coverage, specifically adding comprehensive test cases for valid/invalid SemVer, version constraints, and missing mandatory fields.
- **Performance:** Ensure that parsing multiple fields and aggregating errors does not significantly impact execution time.

## Acceptance Criteria
- [ ] The action fails if `version`, `chef_version`, or `supports` are missing from `metadata.rb`.
- [ ] The action fails if `version` is not a valid SemVer string.
- [ ] The action fails if `chef_version` is not a valid version constraint.
- [ ] The action fails if `supports` entries are malformed.
- [ ] Multiple errors in a single `metadata.rb` file are all reported in the same workflow run.
- [ ] GitHub Action Annotations correctly highlight the erroneous lines in the source file.

## Out of Scope
- Validating dependency fields (`depends`).
- Auto-fixing or formatting the `metadata.rb` file.
