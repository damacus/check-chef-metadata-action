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

Source URL and Issues URL are not configurable.

## Changing the defaults

```yaml
jobs:
  check-metadata:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Check Metadata
        uses: damacus/check-chef-metadata-action
        with:
          maintainer_email: bots@acme.org
          maintainer: 'Bob the great'
```
