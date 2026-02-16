# Product Guidelines: Check Chef Cookbook Metadata Action

## Communication Style
- **Direct and Technical:** Automated communications, such as Pull Request comments and check summaries, must be clear, concise, and focused on providing actionable technical data for maintainers and developers.

## Visual Identity & Presentation
- **Inline Annotations:** Validation errors should be reported using GitHub Action Annotations to point directly to the specific lines and fields in the `metadata.rb` file, providing immediate context for fixes.

## Configuration & Naming Conventions
- **Self-Documenting & Kebab-case:** Action inputs must use descriptive kebab-case names (e.g., `maintainer-email`, `report-checks`) that are consistent with GitHub Actions ecosystem standards.

## Documentation Standards
- **Example-Driven:** Public documentation must prioritize clear, copy-pasteable YAML snippets for common use cases and configuration overrides to facilitate quick adoption.

## Error Handling & Reporting
- **Actionable Error Messages:** Every error message must include:
    - **Remediation:** Explicitly state the expected value or format to guide the user to a resolution.
    - **Contextual Awareness:** Clearly identify the specific file and field being validated.
