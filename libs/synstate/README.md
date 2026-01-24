# typescript-monorepo-template

<!--
[![npm version](https://img.shields.io/npm/v/typescript-monorepo-template.svg)](https://www.npmjs.com/package/typescript-monorepo-template)
[![npm downloads](https://img.shields.io/npm/dm/typescript-monorepo-template.svg)](https://www.npmjs.com/package/typescript-monorepo-template)
[![License](https://img.shields.io/npm/l/typescript-monorepo-template.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/typescript-monorepo-template/branch/main/graph/badge.svg?token=********)](https://codecov.io/gh/noshiro-pf/typescript-monorepo-template)
 -->

Template Repository for TypeScript Monorepo

## Key Features

- 🛡️ Strict ESLint setup via [eslint-config-typed](https://github.com/noshiro-pf/eslint-config-typed), with `jiti` enabling a TypeScript `eslint.config.mts`.
- 📝 Built-in spelling and formatting checks with cspell / markdownlint / Prettier.
- 🧪 Vitest for unit testing with coverage; workflows included to upload results to [codecov.io](https://about.codecov.io/).
- 🔄 CI runs lint / type-check / test, enforces no post-Prettier diffs, and sends coverage to Codecov.
- 🏗️ `build` generates per-directory `index.mts`, removes unused runtime code with Rollup, and runs type checking.
- 🚀 [Changeset](https://github.com/changesets/changesets) triggers on merges to `main`, handling versioning, changelog updates, npm publish, and GitHub Releases.
- 📚 [TypeDoc](https://typedoc.org/index.html) generates docs.
- 📦 `pnpm` provides strict dependency management (`pnpm-lock.yaml` included).
- 📦 Dependabot auto-creates PRs for npm dependencies and GitHub Actions updates.
- 🔐 [github-settings-as-code](https://github.com/noshiro-pf/github-settings-as-code) tracks repository settings and rulesets as code, detecting changes via diffs.
- 🔄 `AGENTS.md` is shared via submodule to sync operational rules across repositories.

## Local Setup

```sh
git clone https://github.com/{owner}/{repo}.git
git submodule update --init --recursive
pnpm i
```

- Rename the part that says "typescript-monorepo-template".
- Remove `publishConfig` field from `packages/{package}/package.json` if you want to publish to the npm registry.
- Update README.md
- Run `pnpm run check-all` and fix errors if exist.

## GitHub Setup

1. Copy `.env.example` to `.env` and set Personal Access Token with `repo` access.
2. Run `pnpm run gh:apply-all` to update GitHub Repository Settings.
3. Set Actions secrets on the GUI settings page (<https://github.com/{owner}/{repo}/settings/secrets/actions>).
    - `NPM_TOKEN`
        - Open <https://www.npmjs.com/settings/{your-user-id}/tokens> -> Generate New Token -> Classic Token -> Select `Automation` and generate.
        - Required for semantic-release to run npm publish
    - `SEMANTIC_RELEASE_GIT_PERMISSION_BOT_PRIVATE_KEY`
        - <https://github.com/apps/semantic-release-git-permission> -> App settings -> Generate a private key
        - Required for `@semantic-release/git` to perform a git commit to the main branch
    - `PERSONAL_ACCESS_TOKEN`
        - The same value as `1.`
        - Required for `.github/workflows/backup-repository-settings.yml` to run
4. Set Dependabot secrets on the GUI settings page (<https://github.com/{owner}/{repo}/settings/secrets/dependabot>).
    - `DEPENDABOT_AUTO_MERGE_BOT_PRIVATE_KEY`
        - <https://github.com/apps/dependabot-auto-merge-permissions> -> App settings -> Generate a private key
    - `PERSONAL_ACCESS_TOKEN`
        - The same value as `1.`
        - Required for `.github/workflows/backup-repository-settings.yml` to run

## Syncing AGENTS.md Updates

1. Update `AGENTS.md` in the common repository (`common-agent-config`)
2. Update the submodule in each project

```bash
git submodule update --remote --merge
git add agents/common
git commit -m "Update AGENTS.md"
```
