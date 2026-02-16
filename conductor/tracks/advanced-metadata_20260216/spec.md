# Track Specification: Advanced Metadata Validation & Multi-Cookbook Support

## Overview
This track significantly enhances the Check Chef Cookbook Metadata Action by adding support for repositories with multiple cookbooks, improving Ruby parsing robustness (specifically for symbols), adding dependency format validation, performing live URL checks, and introducing configurable strictness.

## Functional Requirements
- **Multi-Cookbook Support:**
    - Support glob patterns for the `file_path` input (e.g., `cookbooks/*/metadata.rb`).
    - Create a separate GitHub Check Run for every identified cookbook to provide granular visibility into validation status.
- **Dependency Validation:**
    - Validate that `depends` entries follow the standard format: `'cookbook_name', 'version_constraint'`.
- **Robust Ruby Parsing:**
    - Enhance the parser to support Ruby symbol syntax for both keys and values (e.g., `license :apache2`).
- **URL & Compliance Verification:**
    - Perform live network requests to ensure that `source_url` and `issues_url` are reachable (HTTP 200).
- **Configurable Strictness:**
    - Introduce a `mandatory_fields` input that accepts a comma-separated list of fields that MUST exist in `metadata.rb`.

## Non-Functional Requirements
- **Reliability:** Maintain >80% test coverage for new parsing and URL validation logic.
- **Performance:** Optimize multi-cookbook scanning to ensure acceptable runtimes even in large repositories.
- **Error Handling:** Gracefully handle network timeouts during URL validation.

## Acceptance Criteria
- [ ] The action correctly identifies and validates all cookbooks matching a glob pattern.
- [ ] Each cookbook found results in its own GitHub Check Run.
- [ ] The action correctly parses metadata fields using Ruby symbol syntax.
- [ ] The action fails if a `depends` entry is malformed.
- [ ] The action fails if `source_url` or `issues_url` return a non-200 status code.
- [ ] Users can successfully customize mandatory fields via the `mandatory_fields` input.

## Out of Scope
- Full Ruby script evaluation (still using regex/string parsing for speed and safety).
- Validating the content of internal cookbook dependencies.
