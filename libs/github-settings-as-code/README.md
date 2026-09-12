# GitHub Settings as Code

A CLI for managing a GitHub repository's settings as JSON files.

The settings files are read from `repo-settings/` at the repository root.

> **Breaking change in v3.0.0**: the settings directory moved from `github/` to
> `repo-settings/`. Migrate with `git mv github repo-settings`. The old name
> looked like an alias of `.github/` and suggested that workflows lived there
> too.

## Installation

```sh
npm install -D github-settings-as-code
```

## Usage

```sh
repo-settings <command> [target] [options]
```

| Command  | Description                                                      |
| -------- | ---------------------------------------------------------------- |
| `apply`  | Apply the local settings files to GitHub                         |
| `backup` | Save the current values on GitHub to the local `bk/` directories |

| Target          | Files                                             | `apply` | `backup` |
| --------------- | ------------------------------------------------- | ------- | -------- |
| `all` (default) | All of the below                                  | ✅      | ✅       |
| `repository`    | `repo-settings/repository-settings/settings.json` | ✅      | ✅       |
| `rulesets`      | `repo-settings/rulesets/*.json`                   | ✅      | ✅       |
| `variables`     | Repository variables                              | ✅      | —        |
| `actions`       | `repo-settings/actions-settings/settings.json`    | ✅      | ✅       |
| `pages`         | `repo-settings/pages/settings.json`               | ✅      | ✅       |

```sh
repo-settings apply
repo-settings apply rulesets
repo-settings backup
repo-settings apply --owner noshiro-pf --repo ts-repo-utils
```

Each `backup` is written to a `bk/` directory next to the settings file it
mirrors (for example `repo-settings/rulesets/bk/`). `apply` reads the values
back from GitHub afterwards and rewrites the local files with what was actually
applied.

## Resolving the target repository

The target is resolved in the following order. It is normally derived from
`git remote`, so neither option is usually needed.

1. The command-line options `--owner` / `--repo`
2. The environment variables `OWNER` / `REPO_NAME`
3. `git remote get-url origin`
4. The `name` field of `package.json` (repository name only)

## Authentication

The token is resolved in the following order. Locally, nothing needs to be
configured once you have run `gh auth login`.

1. The environment variables `GITHUB_APP_TOKEN` / `GH_TOKEN` /
   `PERSONAL_ACCESS_TOKEN`
2. `gh auth token` (the gh CLI's login)

`GITHUB_TOKEN` is deliberately not read. In GitHub Actions it may hold the
default token, which lacks the Administration permission.

In CI, pass a GitHub App installation token as `GH_TOKEN`. Changing repository
settings and rulesets requires the **Administration** permission, which the
default `GITHUB_TOKEN` cannot be granted (`administration` is not a valid key
under `permissions:`).

## Managed settings

| File                                              | Location on GitHub                      |
| ------------------------------------------------- | --------------------------------------- |
| `repo-settings/repository-settings/settings.json` | Settings > General                      |
| `repo-settings/rulesets/*.json`                   | Settings > Rules > Rulesets             |
| `repo-settings/actions-settings/settings.json`    | Settings > Actions > General            |
| `repo-settings/pages/settings.json`               | Settings > Pages > Build and deployment |

In a repository without `repo-settings/pages/settings.json`, Pages is left
untouched, so that a repository that does not use Pages never has it enabled by
mistake.
