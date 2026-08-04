# octokit-safe-types

A library of readonly versions of Octokit types and their corresponding validators.

## Repository Setup

1. Copy `.env.example` to `.env` and set Personal Access Token with `repo` access.
2. Run `npm run gh:apply-all` to update GitHub Repository Settings.
3. Set Actions secrets on the GUI settings page (<https://github.com/{owner}/{repo}/settings/secrets/actions>).
    - `SEMANTIC_RELEASE_BOT_PRIVATE_KEY`
        - <https://github.com/apps/noshiro-semantic-release-bot> -> App settings -> Generate a private key
        - Required for `@semantic-release/git` to perform a git commit to the main branch
    - `PERSONAL_ACCESS_TOKEN`
        - The same value as `1.`
        - Required for `.github/workflows/backup-repository-settings.yml` to run
4. Set Dependabot secrets on the GUI settings page (<https://github.com/{owner}/{repo}/settings/secrets/dependabot>).
    - `DEPENDABOT_AUTO_MERGE_BOT_PRIVATE_KEY`
        - <https://github.com/apps/noshiro-dependabot-auto-merge-bot> -> App settings -> Generate a private key
    - `PERSONAL_ACCESS_TOKEN`
        - The same value as `1.`
        - Required for `.github/workflows/backup-repository-settings.yml` to run
