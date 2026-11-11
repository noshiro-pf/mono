# `experimental/`

The pre-2026 monorepo plus standalone repositories imported before deletion.
The inventory is `docs/experimental-inventory.md`. Nothing here is installed,
built or checked, and a diff touching only this directory skips the check
workflows, so the rules below have no check behind them, save the one
`verify-lockfile.yml` holds: no `package.json` or lockfile.

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
`verify-lockfile.yml` fails a pull request that leaves one of the four here.

## Reviving

Rename `package.snapshot.json` back to `package.json`, move the package to
`libs/` or `apps/`, and migrate `@noshiro/ts-utils` → `ts-data-forge`,
`@noshiro/ts-type-utils` → `ts-type-forge`, `@noshiro/io-ts` → `ts-fortress`.

Do not move the package's own `.gitignore` with it, since the root one is the
only one under `libs/` and `apps/`; leave it here, where it still hides local
data in a checkout from before the revival. Copy the patterns the package still
needs to the root one, prefixed with the package's new path: after the `!` of a
negated pattern, and as `<new path>/` in place of the leading `/` of an
anchored one. A pattern with no slash other than a trailing one matched at any
depth below the package, so its root copy is `<new path>/**/<pattern>`. The
last matching pattern wins, so a negated one goes below every root pattern it
overrides. Prettier run from the package directory reads no root ignore file,
so the package's `fix:fmt:full` runs `tools/scripts/cmd/format-package.mts`,
which passes them; `check:root:format-scripts` names the exact command.
