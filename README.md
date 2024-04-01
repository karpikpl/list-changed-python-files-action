# Create a JavaScript Action

[![GitHub Super-Linter](https://github.com/karpikpl/sample-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/karpikpl/sample-action/actions/workflows/ci.yml/badge.svg)

GitHub action that lists all Python (.py) files changed (were added, modified)
between two provided commits.

## Usage

### Basic

You need to add permissions for this tool.

```yaml
permissions: TBD
```

```yaml
uses: karpikpl/sample-action@v1
with:
  base_sha: efc309992637771023dea36dfe811ca2cb0623b1
  head_sha: 021ee60b6d79e3344ace3816ebcb2de6560ba265
```

## Inputs

### `base_sha`

**Required** Base sha commit id.

### `head_sha`

**Required** Head sha commit id.

### `repo-owner`

**Optional** Another repository owner, If not set, the current repository owner
is used by default. Note that when you trying changing a repo, be aware that
`GITHUB_TOKEN` should also have permission for that repository.

### `repo-name`

**Optional** Another repository name. Of limited use on GitHub enterprise. If
not set, the current repository is used by default. Note that when you trying
changing a repo, be aware that `GITHUB_TOKEN` should also have permission for
that repository.

### `repo-token`

**Optional**, You can set
[PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
here. If not set, this will use `${{ github.token }}`.

## Outputs

### `changed_files`

Space separated list of Python (\*.py) files changed (added, modified) between
base and head sha commit ids.
