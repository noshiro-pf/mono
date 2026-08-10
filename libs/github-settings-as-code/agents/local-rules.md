# Repository Guidelines

In addition to the common instructions above (vendored into
`agents/common-rules.md` from the common-agent-config repository),
project-specific rules are shown below.

## Project Overview

`github-settings-as-code` is a CLI tool (exposed via `package.json` `bin`
entries such as `gh-apply-all` / `gh-backup-all`) that applies and backs up
GitHub repository settings, rulesets, and variables as code, using
`@octokit/core`. It is published to npm.

## Agent Config

`AGENTS.md` is generated (do not edit directly): it concatenates the vendored
shared rules (`agents/common-rules.md`) with `agents/local-rules.md`.
Regenerate with `pnpm run agents:gen`; refresh the vendored shared rules from
the common-agent-config repository with `pnpm run agents:sync`. Both also run
as part of the sync-agent-config workflow.

## Testing

Uses **Vitest** (co-located `*.test.mts`), with both compile-time type
assertions (`expectType`) and runtime assertions. Prefer `test()` over
`it()` and `.toStrictEqual()` over `.toEqual()`.
