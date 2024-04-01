# Create a JavaScript Action

[![GitHub Super-Linter](https://github.com/karpikpl/sample-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/karpikpl/sample-action/actions/workflows/ci.yml/badge.svg)

GitHub action that lists all Python (.py) files changed (were added, modified)
in the provided pull request.

## Usage

### Basic

You need to add permissions for this tool.

```yaml
permissions:
  contents: read
```

```yaml
uses: karpikpl/sample-action@v1
```

## Inputs

### `pull_number`

**Required** ID of the pull request.

### `repo-owner`

**Optional** Another repository owner, If not set, the current repository owner
is used by default. Note that when you trying changing a repository, be aware
that `GITHUB_TOKEN` should also have permission for that repository.

### `repo-name`

**Optional** Another repository name. Of limited use on GitHub enterprise. If
not set, the current repository is used by default. Note that when you trying
changing a repository, be aware that `GITHUB_TOKEN` should also have permission
for that repository.

### `repo-token`

**Optional**, You can set
[PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
here. If not set, this will use `${{ github.token }}`.

## Outputs

### `changed_files`

Space separated list of Python (\*.py) files changed (added, modified) in the
pull request.
