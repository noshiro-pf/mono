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
`pnpm install` and a `pnpm run ws:build:deps`. Every step runs with `CI=true`,
as GitHub Actions sets it, because some tools read it: with it typescript-estree
parses a linted file from disk rather than the text it was given, and Vitest
refuses `.only`, so a test can pass without it and fail in CI. It also runs with
`CODEMOD_DIFF_BASE` and `PROSE_DIFF_BASE` set to the base, so that the codemod
and the `check:prose` guards that read a diff read this one rather than the
merge base with `origin/main`, which on a stacked branch takes in the layer
below.

## What runs

`plan.mts` sorts the changed paths and builds the list; its tests say it case
by case. In order:

1. **Format** the diff (`z:format-diff-from <base>`), so that a generator's
   own `fix:fmt` is not later blamed for formatting a hand-edited file.
2. **Generators**: for the strict-lib converter or its output, first
   `strict-lib:gen:with-codemod-fixed` and `strict-lib:gen:version-diff` (see
   below), ahead of the other generators, some of which read what they write;
   `gen` in every touched package,
   `gen:deps-graph` for a manifest, the lockfile, its generator or its output,
   `gen:license-files` for a manifest, the lockfile, a `LICENSE` or its
   generator, and `gen:verify-npm-packages` for any change that is not prose
   alone, since its committed `local/` copies are written from `smoke/`, the
   manifests and the generator's own code (it also removes a gone package's
   project from `published/`). **A generator that changes the tree fails the
   run**, naming itself and the files; that is the dirty tree CI's
   `assert-repo-is-clean` reports with no hint which generator wrote it. Only
   the run in which it writes fails: a later run cannot tell its output, left
   uncommitted, from a hand edit, so commit it before moving on.
   After the touched packages' own, `gen` runs in every member that declares (in
   any dependency field) a package whose code changed, since a generator can
   read what its package declares: the synstate docs measure synstate's bundle
   and embed its JSDoc, the hooks packages re-export what it exports. Such a
   package is built first (`build`) when an import of it resolves to `dist/`, so
   that they read it rebuilt, and so is each changed package it is built against
   (named by a `workspace:` range in its `dependencies` or `peerDependencies`,
   directly or through an unchanged member), even when that package's imports
   resolve to its sources; a dependent the diff touches runs its generator again
   after the build. Then `gen` in every member whose generators import a changed
   file outside it — a shared module under `tools/configs/`, such as
   `gen-eslint-plugin-rule-types.mts` or `gen-css-module-types.mts` — found from
   the import graph of the scripts its `gen` runs (`generator-entries.mts`), not
   from a list.
3. **Fixers**: the codemod as CI runs it, `fix:codemod:affected` with
   `CODEMOD_DIFF_BASE` set to the base, for any change the code gate lets
   through: over the diff and the untracked files, or over everything when what
   decides its output changed (the lockfile, a script naming its transformers).
   Then the diff formatted again, and `fix:lint` in every package whose code
   changed, so that what the codemod wrote is linted too. The format in between
   takes off the parentheses the codemod adds when it reprints a type: CI lints
   only the formatted tree, and a lint rule judging them would fail on a line
   nobody changed. `fix:codemod:affected` formats too, but not when the codemod
   fails. A package's `fix:lint` loads from `dist/` what its
   `eslint.config*.mts` imports at run time, through the modules of the
   repository it imports too (as TypeScript resolves them), and what those run
   with. So when what a package emits changes (its `src/` less tests,
   `configs/tsconfig.build.json`, `scripts/cmd/build.mts` or manifest), what a
   config imports that runs with it is built first, as far as the diff changed
   it, and `fix:lint` then runs in every changed package and every member whose
   config imports one, and the root program's checks and strict-lib's lint run
   too.
   What runs with a changed package is followed through any member from an
   ESLint config, plugin or rule package (`eslint-config-*`, `eslint-plugin-*`,
   `eslint-rule-*`, scoped or not), and through the others alone from any other
   package, so that a change to `@sumi-lang/checker` lints what imports
   `@sumi-lang/cli` and one to `ts-data-forge` does not lint every package
   through `eslint-config-typed`. An extensionless or directory import is not
   followed (`resolveModule` in `packages.mts` says why).
4. **Checks**: per package `check:types`, `check:test` (with coverage turned on
   where the package has a `check:test:cov`) and `check:sumi`;
   `check:forgotten-exports` over each changed package it reads
   (`tools/scripts/lib/forgotten-exports-scope.mts`) and those alone, after
   building them and the changed packages they are built against, in build order
   and after the fixers, which can rewrite a declaration (CI reads every package
   after `ws:build`); `check:ext` in every touched package, a document change
   included; the `check:root:*`
   guards in parallel for any change the code gate lets through, as CI runs
   them, and the root program's `check:root:types`, `lint` and `test` only for
   what the root `tsconfig.json` reads (`tools/`, the root configuration, any
   `configs/`, `eslint.config*.mts` or `vite.config.mts`); the `strict-lib:`
   checks for `strict-lib/`; `check:knip` for any change the code gate lets
   through, as CI runs it, and `check:published-deps` for a manifest or for what
   it lints (a published package's `src/`, an `eslint.config.mts`); `check:md`
   for prose; `check:prose` always; cspell over the changed files, and
   `check:cspell:changeset` for a changeset (the whole `check:cspell` instead
   when a `cspell.config.yaml` changed).
5. **Format** again, for what the fixers wrote (`fix:fmt:full` instead when
   `.prettierrc` or `.prettierignore` changed).

A path the code gate ignores (the `code` list of
`tools/configs/gate-ignore-lists.json`, which `code-check.yml`'s gate reads,
less what its `!` exceptions take back) touches its package's documents only:
the generators run, the type check and tests do not, as CI's would not. A
Markdown page the gate excepts, under `apps/*/src/`, or a document a unit test
reads (the `!` entries `check:root:test-documents` holds), is code and still
gets `check:md`, which reads it unless `.markdownlint-cli2.mjs` leaves it out
(as it does every page under a `docs/` directory). `experimental/` is outside
everything.

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
  whose `src/` changed with no changeset in the diff naming it is a warning, and
  so is one that bundles a private package whose `src/` changed: one it reaches
  through `dependencies` or `peerDependencies`, passing through private packages
  only, since nobody releases a private one. Only the author knows whether a
  change is user-visible.
- **Exports under a `patch`** (`exports.mts`): for a published `libs/*` package
  the diff's changesets name at `patch` and no higher, the names its public
  entry (`src/entry-point.mts` or `src/index.mts`, through its barrels) exports
  at the merge base and now. A new name is a warning to make the changeset
  `minor`; a removed one is a warning that the change is breaking. Names only:
  a changed signature of an export that stays is not read.
- **Changed-line coverage** (`coverage.mts`): after a package's tests (and
  `check:root:test` for `tools/`), the added or changed lines from
  `git diff -U0` that the coverage report knows as executable and no test ran.
  A report, never a failure.

## What it leaves to CI

`CI_ONLY` in `reach.mts` lists, each with its reason, the commands CI runs that
no diff makes this run. `check:root:check-changed-reach`
(`../check-changed-reach.mts`) builds the plan for a sample path in each package
and each area, and fails on a command CI runs that no plan reaches and the list
does not name, and on an entry that names nothing CI still leaves to itself. So
a check, generator or fixer added to a workflow has to be planned here or
declared CI's alone. An entry whose script leaves committed output, which CI's
clean-tree check finds stale, names the generators that write it (`writtenBy`),
and the package has to define one and some plan run each it defines:
`verify:npm-packages` is CI's, `gen:verify-npm-packages` is not. Where several
entries name a command, the most specific applies, so a package whose output is
not committed (a `doc` that writes typedoc output alone) is exempted by an entry
naming its directory with no `writtenBy`; one exempting a package that defines a
listed generator fails. It asks whether some diff's plan runs a command, not
whether every diff that needs it does. That second question is answered after
the fact: a failed matrix job of `code-check.yml` or `style-check.yml` says in
its summary which of its commands this would have run for the diff
(`../check-changed-gap.mts`).

What depends on a changed package is not built or checked beyond its generators
and, for what an ESLint config imports, its `fix:lint`, so a stale `dist/` in a
dependent goes unnoticed; build first (`ws:build:deps`) after a change other
packages consume. Nor are the packages a change to `tools/configs/` configures;
the run says which `ws:*` commands to reach for.
`verify:npm-packages` (pack, install and run the smoke checks) does not run
either: a change to `verify-npm-packages/smoke/` is regenerated into its
`local/` copies, not run.
Under `strict-lib/` the tooling's type check, lint and oxfmt run, and
`gen:verify-npm-packages`, which copies the published bundles' manifests (a
manifest or `LICENSE` there runs the generators that read one, as anywhere). A
diff that reaches the converter or its output — `strict-lib/scripts-common/`,
`strict-lib/scripts/`, oxfmt's configuration there, or a harness
`strict-lib/v<X.Y>/` — also runs the generators as `strict-lib-gen.yml` does,
`strict-lib:gen:with-codemod-fixed` and then `strict-lib:gen:version-diff`
(about two and a half minutes), and fails when they change the tree. It does not
run a package's `gen` that reads what they write (the synstate-dom packages'
reflected keys, from the strict `lib.dom`) unless the diff touches that package
or changes the code of one it declares; CI's `ws:gen` finds that one stale. The
harnesses' own type checks (`ws:check:types:strict-lib`, each TypeScript minor
over its generated lib) are `strict-lib-gen.yml`'s.
Browser tests, end-to-end tests, the Firestore rules tests (`check:test:rules`,
which need Java; a diff touching a package's `firestore.rules`, `test/` or rules
config prints a note naming the command, `rules-tests.mts`) and `ws:check:dist`
are not run, nor is `check:forgotten-exports` over a package whose code the diff
does not change, nor `check:cspell` over the whole tree, so a `words` entry that
the diff made dead is not found.
