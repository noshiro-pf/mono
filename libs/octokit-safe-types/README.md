# octokit-safe-types

A library of readonly versions of Octokit types and their corresponding validators.

## Repository Setup

1. Run `pnpm run repo-settings:apply` to update GitHub Repository Settings.
2. Set Actions secrets on the GUI settings page (<https://github.com/{owner}/{repo}/settings/secrets/actions>).
    - `REPO_AUTOMATION_BOT_PRIVATE_KEY`
        - <https://github.com/apps/noshiro-repo-automation-bot> -> App settings -> Generate a private key
        - Required for `@semantic-release/git` to perform a git commit to the main branch
