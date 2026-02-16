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

Source URL and Issues URL are not configurable.

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
    description: 'Path to the metadata.rb file'
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
