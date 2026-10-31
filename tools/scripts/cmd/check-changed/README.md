# `check-changed`

Runs the checks a diff needs, and only those, then says what ran, what failed
and what it rewrote:

```sh
pnpm run check-changed                       # the diff from origin/main
pnpm run check-changed --base feat/layer-a   # a stacked pull request
pnpm run check-changed --dry-run             # the plan, and what needs no run
pnpm run check-changed --no-coverage         # skip the changed-line coverage
```

The diff is the merge base with `--base` (default `origin/main`) against the
working tree, plus the untracked files. It needs what the checks need: a
`pnpm install` and a `pnpm run ws:build:deps`.

## What runs

`plan.mts` sorts the changed paths and builds the list; its tests say it case
by case. In order:

1. **Format** the diff (`z:format-diff-from <base>`), so that a generator's
   own `fix:fmt` is not later blamed for formatting a hand-edited file.
2. **Generators**: `gen` in every touched package, and `gen:deps-graph` for a
   manifest or the lockfile. **A generator that changes the tree fails the
   run**, naming itself and the files; that is the dirty tree CI's
   `assert-repo-is-clean` reports with no hint which generator wrote it. Only
   the run in which it writes fails: a later run cannot tell its output, left
   uncommitted, from a hand edit, so commit it before moving on.
3. **Fixers**: the codemod over the diff (`z:ts-codemod --diff-from`, plus
   `--uncommitted` when there are untracked files, which `--diff-from` cannot
   see), then `fix:lint` in every package whose code changed, so that what the
   codemod wrote is linted too.
4. **Checks**: per package `check:types`, `check:test` (with coverage turned
   on where the package has a `check:test:cov`) and `check:sumi`; the
   `check:root:*` guards in parallel for any change the code gate lets
   through, as CI runs them, and
   the root program's `check:root:types`, `lint` and `test` only for what the
   root `tsconfig.json` reads (`tools/`, the root configuration, any
   `configs/`, `eslint.config*.mts` or `vite.config.mts`); `strict-lib:*` for
   `strict-lib/`; `check:knip` and `check:published-deps` for manifests;
   `check:md` for prose; `check:prose` always; cspell over the changed files,
   and `check:cspell:changeset` for a changeset (the whole `check:cspell`
   instead when a `cspell.config.yaml` changed).
5. **Format** again, for what the fixers wrote (`fix:fmt:full` instead when
   `.prettierrc` or `.prettierignore` changed).

A path the code gate ignores (the `--paths-ignore` list of
`z:check-should-run:code-checks`, read from the root `package.json`) touches
its package's documents only: the generators run, the type check and tests do
not, as CI's would not. `experimental/` is outside everything.

Every step runs whatever failed before it, and every step is watched for what
it writes. What is still changed at the end is listed under the step that
wrote it (a generator's as a failure, a fixer's as a note to review and
commit); a write a later step undid, as the formatter undoes most of the
codemod's reprinting, is not.

## What is read rather than run

- **Commit messages** (`commit-messages.mts`), base to `HEAD`: Japanese text,
  with the pattern read from `lint-pull-request.yml` itself, and more than one
  commit fail as they would there. A tip subject that is not Conventional
  Commits, which `open-pr` would make the title, is a warning.
- **Changesets** (`changesets.mts`): a `libs/*` package or a Chrome extension
  whose `src/` changed with no changeset in the diff naming it is a warning.
  Only the author knows whether a change is user-visible.
- **Changed-line coverage** (`coverage.mts`): after a package's tests (and
  `check:root:test` for `tools/`), the added or changed lines from
  `git diff -U0` that the coverage report knows as executable and no test ran.
  A report, never a failure.

## What it leaves to CI

What depends on a changed package is not built or checked, so a stale
`dist/` in a dependent goes unnoticed; build first (`ws:build:deps`) after a
change other packages consume. Nor are the packages a change to
`tools/configs/` configures; the run says which `ws:*` commands to reach for.
Under `strict-lib/` only the tooling's type check, lint and oxfmt run; the
generators, which rewrite thousands of files, are `strict-lib-gen.yml`'s.
Browser tests, end-to-end tests and `ws:check:dist` are not run, nor is
`check:cspell` over the whole tree, so a `words` entry that the diff made dead
is not found.
