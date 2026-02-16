# Track Specification: Streamlined Reporting & Rich Annotations

## Overview
This track refines the action's reporting mechanisms to reduce noise while providing high-quality, actionable feedback. We will transition from multiple individual check runs to a single consolidated check run per repository, while ensuring every error across all cookbooks is precisely annotated inline.

## Functional Requirements
- **Consolidated Check Run:** Create only one check run named "Metadata Validation" for the entire workflow execution, grouping all cookbook results.
- **Rich Inline Annotations:** Use `core.error` with file and line metadata to provide Rubocop-style inline annotations for every failure.
- **Improved Annotation Messages:** Formatting should be `${field}: expected ${expected}, got ${actual}` for consistency.
- **Concise PR Summary:** A single unified summary table in the PR comment showing the status of all checked cookbooks.

## Non-Functional Requirements
- **Reduced Noise:** Avoid multiple check runs and redundant PR comments.
- **Clarity:** Ensure every error is easily discoverable via annotations.

## Acceptance Criteria
- [ ] Only one GitHub Check Run is created regardless of the number of cookbooks.
- [ ] Every validation error results in a precise inline annotation.
- [ ] The PR comment is concise and aggregates results for all cookbooks.
