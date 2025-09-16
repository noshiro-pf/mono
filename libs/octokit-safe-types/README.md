# octokit-safe-types

A library of readonly versions of Octokit types and their corresponding validators.

## Repository Setup

1. Copy `.env.example` to `.env` and set Personal Access Token with `repo` access.
2. Run `npm run gh:apply-all` to update GitHub Repository Settings.
3. Set secrets on [GUI settings page](https://github.com/noshiro-pf/octokit-safe-types/settings/secrets/actions).
    - `NPM_TOKEN`
        - Open <https://www.npmjs.com/settings/{your-user-id}/tokens> -> Generate New Token -> Classic Token -> Select `Automation` and generate.
        - Required for semantic-release to run npm publish
    - `SEMANTIC_RELEASE_GIT_PERMISSION_BOT_PRIVATE_KEY`
        - <https://github.com/apps/semantic-release-git-permission> -> App settings -> Generate a private key
        - Required for `@semantic-release/git` to perform a git commit to the main branch
    - `DEPENDABOT_AUTO_MERGE_BOT_PRIVATE_KEY`
        - <https://github.com/apps/dependabot-auto-merge-permissions> -> App settings -> Generate a private key
