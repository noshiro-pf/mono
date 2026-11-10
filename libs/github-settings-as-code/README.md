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

| Command  | Description                                                            |
| -------- | ---------------------------------------------------------------------- |
| `apply`  | Apply the local settings files to GitHub                               |
| `backup` | Re-snapshot the local settings files from the current values on GitHub |

| Target                 | Files                                              | `apply` | `backup` |
| ---------------------- | -------------------------------------------------- | ------- | -------- |
| `all` (default)        | All of the below                                   | ✅      | ✅       |
| `repository`           | `repo-settings/repository-settings/settings.json`  | ✅      | ✅       |
| `rulesets`             | `repo-settings/rulesets/*.json`                    | ✅      | ✅       |
| `variables`            | `repo-settings/variables/settings.json`            | ✅      | ✅       |
| `actions`              | `repo-settings/actions-settings/settings.json`     | ✅      | ✅       |
| `pages`                | `repo-settings/pages/settings.json`                | ✅      | ✅       |
| `environments`         | `repo-settings/environments/*.json`                | ✅      | ✅       |
| `vulnerability-alerts` | `repo-settings/vulnerability-alerts/settings.json` | ✅      | ✅       |

```sh
repo-settings apply
repo-settings apply rulesets
repo-settings backup
repo-settings apply --owner noshiro-pf --repo ts-repo-utils
```

`backup` rewrites the settings files themselves from what GitHub currently has —
there is one copy of each resource, not a declaration and a mirror of it.
`apply` reads the values back from GitHub afterwards and rewrites the files with
what was actually applied, so a value GitHub canonicalized or refused shows up
as a diff; `variables` writes nothing back. For rulesets and environments, only
the ones a declaration file names are rewritten (a ruleset by its id, or by the
id GitHub gave it when created; an environment by its name, compared without
case as GitHub compares it), each in the file it was read from, so renaming one
does not leave a second file. A ruleset is written back as soon as it is sent,
so the id of one just created reaches its file even if a later step fails. One
that exists only on GitHub stays undeclared, so the drift check keeps reporting
it; importing it is an explicit `backup`.

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

| File                                               | Location on GitHub                                     |
| -------------------------------------------------- | ------------------------------------------------------ |
| `repo-settings/repository-settings/settings.json`  | Settings > General                                     |
| `repo-settings/rulesets/*.json`                    | Settings > Rules > Rulesets                            |
| `repo-settings/actions-settings/settings.json`     | Settings > Actions > General                           |
| `repo-settings/pages/settings.json`                | Settings > Pages > Build and deployment                |
| `repo-settings/variables/settings.json`            | Settings > Secrets and variables > Actions > Variables |
| `repo-settings/environments/*.json`                | Settings > Environments                                |
| `repo-settings/vulnerability-alerts/settings.json` | Settings > Advanced Security > Dependabot alerts       |

Every target `apply`s only what is declared. Without its file, or for `rulesets`
and `environments` without its directory (or with no `*.json` in it), `apply`
leaves that target untouched and goes on to the next, so a repository may
declare only some of `repo-settings/`. In particular, in a repository without
`repo-settings/pages/settings.json`, `apply` leaves Pages untouched, so that a
repository that does not use Pages never has it enabled by mistake. Without
`repo-settings/vulnerability-alerts/settings.json`, `apply` likewise leaves
Dependabot alerts as they are, rather than read the absence as "disable".
`backup` always writes that file, even when the alerts are off, and from then on
`apply` enforces it.
