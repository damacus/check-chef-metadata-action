# Product Definition: Check Chef Cookbook Metadata Action

## Initial Concept
Check Chef cookbook metadata is correct.

## Target Audience
- Cookbook maintainers, specifically members of the Sous Chefs organization.

## Goals & Benefits
- **Ensure consistency:** Enforce unified metadata standards across a large number of managed cookbooks, ensuring quality control across the organization's portfolio.

## Core Features
- **Integrated Reporting:** Deeply integrate with GitHub Actions to provide high visibility into validation results through Check Runs and Pull Request comments.
- **Strict Validation:** By default, the action will fail the build when metadata validation errors are encountered, ensuring that only compliant cookbooks are merged.

## Non-Functional Requirements
- **Reliability:** Maintain comprehensive test coverage to prevent regressions in metadata parsing and reporting logic, ensuring the tool remains a trusted source of truth.
- **Performance:** Optimize for fast execution to minimize CI/CD wait times across many repositories.
- **Ease of Maintenance:** Adhere to strict TypeScript and coding standards to simplify long-term health and facilitate community contributions.
