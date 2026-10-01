# `experimental/`

The pre-2026 monorepo plus standalone repositories imported before deletion.
The inventory is `docs/experimental-inventory.md`. Nothing here is installed,
built or checked, and a diff touching only this directory skips every
workflow, so the rules below have no check behind them.

## Importing

An import is a snapshot: take the branch the work is on (check every branch,
say which), take only what a still-existing template does not provide, and
record source, commit and omissions in a `README.md` at its top.

**No `package.json` or lockfile stays here.** GitHub's dependency graph reads
every `package.json`, `yarn.lock`, `package-lock.json` and `pnpm-lock.yaml` in
the repository, Dependabot raises alerts on what they declare, and neither
`dependabot.yml` nor any repository setting excludes a directory from alerts.
So an import renames each `package.json` to `package.snapshot.json` and drops
its lockfile; the dependency list stays readable and nothing is alerted on.

## Reviving

Rename `package.snapshot.json` back to `package.json`, move the package to
`libs/` or `apps/`, and migrate `@noshiro/ts-utils` → `ts-data-forge`,
`@noshiro/ts-type-utils` → `ts-type-forge`, `@noshiro/io-ts` → `ts-fortress`.
