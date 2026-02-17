# Check Chef Cookbook Metdata

<a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/damacus/check-chef-metadata-action/workflows/build-test/badge.svg"></a>

This GitHub Action checks the metdata.rb in the root directory by default.

We check for the following items:

|                  | Default                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| maintainer       | Sous Chefs                                                                    |
| maintainer_email | help@sous-chefs.org                                                           |
| license          | 'Apache-2.0'                                                                  |
| source_url       | `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}` |
| issues_url       | `${source_url}/issues`                                                        |
| version          | (Mandatory) Must be valid SemVer                                              |
| chef_version     | (Mandatory) Must be valid version constraint                                  |
| supports         | (Mandatory) Must have at least one valid platform entry                       |

Source URL and Issues URL are not configurable and are validated for accessibility (HTTP 200).

## Performance

The action processes multiple cookbooks in parallel (up to 10 concurrent checks) to ensure fast execution even in large repositories. URL accessibility checks are also performed with a 5-second timeout to prevent build hangs.

## Configuration

```yaml
  maintainer_email:
    description: 'Maintainer email'
    required: false
    default: help@sous-chefs.org
  maintainer:
    description: 'Desired name of the maintainer'
    required: false
    default: 'Sous Chefs'
  license:
    description: 'A SPDX licence'
    required: false
    default: 'Apache-2.0'
  file_path:
    description: 'Path to the metadata.rb file (supports glob patterns)'
    required: false
    default: 'metadata.rb'
  report_checks:
    description: 'Report the result as a check'
    required: false
    default: 'true'
  comment_on_pr:
    description: 'Comment on the PR with the result'
    required: false
    default: 'true'
  mandatory_fields:
    description: 'Comma-separated list of mandatory fields'
    required: false
    default: 'version,chef_version,supports'
```

## Outputs

| Output             | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `cookbooks`        | A JSON string representing an array of validated cookbook objects.          |
| `cookbook-name`    | The name of the cookbook (if exactly one cookbook was found).               |
| `cookbook-version` | The version of the cookbook (if exactly one cookbook was found).            |

### Example: Using outputs

```yaml
      - name: Check Metadata
        id: check
        uses: damacus/check-chef-metadata-action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Use Outputs
        run: |
          echo "Cookbook: ${{ steps.check.outputs.cookbook-name }}"
          echo "Version: ${{ steps.check.outputs.cookbook-version }}"
```

## Examples

### Checking multiple cookbooks (Glob pattern)

```yaml
      - uses: damacus/check-chef-metadata-action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          file_path: "cookbooks/*/metadata.rb"
```

### Customizing mandatory fields

```yaml
      - uses: damacus/check-chef-metadata-action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          mandatory_fields: "name,version,license"
```

## Changing the defaults

```yaml
jobs:
  checkmetadata:
    runs-on: ubuntu-latest
    permissions:
      checks: write # required for the status check
      pull-requests: write # required for the PR comment
      statuses: write # required for the status check
    steps:
      - uses: actions/checkout@v3
      - uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          maintainer_email: help@sous-chefs.org
          file_path: test/fixtures/metadata.incorrect.rb
```

## Permissions

```yaml
    permissions:
      checks: write # required for the status check
      pull-requests: write # required for the PR comment
      statuses: write # required for the status check
```
