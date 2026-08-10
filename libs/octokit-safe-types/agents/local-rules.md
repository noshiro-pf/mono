# octokit-safe-types Local Rules

Repository-specific rules for `octokit-safe-types`. These complement the
shared agent instructions above (vendored into `agents/common-rules.md` from
the common-agent-config repository — edit them there, not here).

## Project Overview

`octokit-safe-types` provides readonly / branded TypeScript types for the
Octokit GitHub API, together with corresponding runtime validators (built on
`ts-fortress`). It re-exports selected `@octokit/openapi-types` and
`@octokit/types` types in safer forms.

This repository uses **pnpm** (see `packageManager` in package.json); do not
use npm or yarn.

## Architecture

- Source lives under `src/` (`.mts`), organized by domain (e.g.
  `repository/`, `ruleset/`), each exposed through generated `index.mts`
  files and aggregated by `src/entry-point.mts`.
- The build (Rollup) emits `dist/` (`.mjs` + `.d.mts`); the package is
  published types-first via the `exports` map.
- `src/**/index.mts` and `AGENTS.md` are auto-generated — do not edit by
  hand. Regenerate with `pnpm run build` (or `pnpm run gi` /
  `pnpm run agents:gen`).

## Testing

- Tests are co-located as `src/**/*.test.mts` and use Vitest plus the
  `expectType` compile-time assertion utility.
- `test/dist/named/` type-checks the built `dist/` output through the real
  `package.json` `exports` map (run as part of `pnpm run build`, and against
  a range of TypeScript versions in CI).
- Prefer `expectType<A, B>('=')`; use `.toStrictEqual()` and `test()` (not
  `.toEqual()` / `it()`) in Vitest tests.

## Workflow

- After a series of code changes, run `pnpm run tsc`, `pnpm run lint:fix`,
  `pnpm run fmt`, then `pnpm run build`.
- Do NOT `git commit` or push without explicit instruction.
