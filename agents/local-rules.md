# Repository Guidelines

In addition to the common instructions above (vendored into `agents/common-rules.md` from the common-agent-config repository), project-specific rules are shown below.

## Repository Layout

- `libs/*` — published npm packages, one directory per package.
- `apps/*` — applications.
- `tools/` — repository-level tooling. Not published.
    - `tools/configs/` — shared TypeScript / Vite config used by the root and by packages.
    - `tools/scripts/cmd/` — repository-level `tsx` commands (`check-all`, `ws-build-stages`, agent config sync, …).
- `github/` — declarative GitHub repository settings, applied via `github-settings-as-code`.
- `articles/` — Zenn articles. **See "Zenn" below.**
- `books/` — Zenn books. **See "Zenn" below.**
- `docs/` — loose prose notes. Not linted, not part of the build.
- `experimental/` — legacy code. **See "experimental/" below.**

**There is one `.gitignore`, at the repository root** (`experimental/` keeps its
own, being outside the workspace). Do not add one to a package: Prettier reads
`.gitignore` and `.prettierignore` from the root and nowhere else, so a pattern
in a package-level file would keep git quiet while `fmt:full` went on
reformatting the generated files anyway. Generated TypeDoc output is listed at
the root per package, because `libs/eslint-config-typed/docs` and
`libs/synstate/docs` hold hand-written prose and must stay tracked.

Only `libs/*`, `apps/*` and `tools/*` are pnpm workspace globs
(`pnpm-workspace.yaml`), and a directory only becomes a member if it has a
`package.json`. `tools/configs/` and `tools/scripts/` deliberately have none —
they are plain directories consumed by relative path, not packages.

## Zenn

`articles/` and `books/` are published to <https://zenn.dev> by Zenn's own GitHub
integration, configured on zenn.dev — **not** by any workflow in this repository.
That integration reads `articles/` and `books/` from the repository root, and
the paths are fixed by Zenn's convention.

Consequently:

- **Never move, rename or nest `articles/` or `books/`.** Doing so silently
  breaks publishing, with no failing CI to warn you.
- Both directories are excluded from Prettier, ESLint, cspell and markdownlint.
  Do not re-enable those checks: a formatter version bump would rewrite already
  published articles, and the prose is Japanese, so cspell can only produce
  noise.
- `zenn-cli` is a root devDependency for local preview (`pnpm exec zenn preview`).

## `experimental/`

`experimental/` holds the contents of the pre-2026 monorepo (the old `packages/`,
`configs/` and `scripts/`). It is deliberately **outside** the pnpm workspace
globs, so nothing in it is installed, built, linted or type-checked, and
dependency updates cannot break it.

- Do not add `experimental/` to `pnpm-workspace.yaml`.
- Do not "fix" code in `experimental/` as part of unrelated work.
- To revive something, move that one package to `libs/` or `apps/`, migrate its
  dependencies to the current libraries (`@noshiro/ts-utils` → `ts-data-forge`,
  `@noshiro/ts-type-utils` → `ts-type-forge`, `@noshiro/io-ts` → `ts-fortress`),
  and bring it up to the conventions in this document.

## Releases

Releases are managed by **changesets** only. `semantic-release` was removed
during the monorepo consolidation; do not reintroduce `release.config.js`.

- Add a changeset with `pnpm changeset` for any user-visible change to a package
  under `libs/`.
- `.changeset/` at the repository root is the single source of truth. Never
  create a nested `.changeset/` directory inside a package.
- Tags for releases published from this repository are `<package-name>@<version>`.
  Tags prefixed with a repository name (`eslint-config-typed/v5.8.4`,
  `ts-data-forge/ts-data-forge@14.1.0`, …) are imported history from the
  standalone repositories that were merged in; never create new tags in that form.

## Dependencies

- **Every package declares what it imports.** `packageDirs` in a package's
  `eslint.config.mts` lists only that package's own directory, so
  `import-x/no-extraneous-dependencies` fails on anything not declared there.
  Do not add the repository root back to `packageDirs`, and do not turn that
  rule off for `scripts/**` or `configs/**`.
    - The one file this cannot check is `eslint.config.mts` itself, which
      `eslint-config-typed` ignores by default. Declare the packages it imports
      (`eslint-config-typed`, `eslint-plugin-ts-*`) by hand.
- **`pnpm run knip` covers the other direction: a declared dependency nothing
  imports.** It also sees imports ESLint does not, such as the ones in
  `samples/`. Configuration is in `knip.jsonc`; the CI gate is scoped to
  `dependencies,unlisted,binaries`. Run `pnpm exec knip` without arguments for
  the wider report (unused files and exports), which is not enforced.
    - knip executes each package's vitest config, which imports workspace
      siblings through their `exports` map, so it needs `pnpm run ws:build`
      first.
    - A dependency named as a *string* in a config file rather than imported is
      invisible to knip. The Prettier plugins are the case here: each package
      runs `fmt` with its own directory as cwd and resolves them from there,
      even though only the root `.prettierrc` names them. Add such a dependency
      to `ignoreDependencies` with the reason rather than deleting it — dropping
      the Prettier plugins silently stopped import sorting in generated files.
- **Versions of shared devDependencies live in the `catalog:` block of
  `pnpm-workspace.yaml`.** Write `"eslint": "catalog:"` in the package. A
  published package's `dependencies` and `peerDependencies` are its own API, so
  their ranges stay literal and are not catalogued.
- Dependencies between packages in this repository always use the `workspace:`
  protocol — there is no dependency on a published copy of our own packages
  anywhere. For `dependencies` and `peerDependencies`, match the protocol to
  the range you intend to publish: `^x.y.z` → `workspace:^`,
  `~x.y.z` → `workspace:~`, an exact pin → `workspace:*`. `devDependencies` use
  `workspace:*`.
- `linkWorkspacePackages` is left at its default (`false`). Only an explicit
  `workspace:` specifier links locally.

## Building from a clean checkout

`pnpm install && pnpm run ws:build` works with no `dist/` anywhere. Three rules
keep it that way; breaking any one of them reintroduces a cycle.

- **Run `tsx` with `--tsconfig <root>/tools/configs/tsconfig.tsx.json.`** That
  config maps our package names to their sources, so a build script can import
  `ts-repo-utils` before anything is built. Every `tsx` invocation in a
  `package.json` script uses it. Our own CLIs are invoked the same way, through
  their source under `libs/*/src/cmd/`, not through `node_modules/.bin` — CI
  steps such as `check-should-run-type-checks` run before the build.
- **A package's `build` only type-checks what it publishes.** Declaration emit
  (`configs/tsconfig.build.json`) covers `src/`. Tests, `scripts/`, `configs/`
  and `eslint.config.mts` import the toolchain, which is built later, so they
  are checked afterwards by `pnpm run ws:type-check`. Do not add a full-scope
  `tsc --noEmit` back into `build`, and do not add `eslint.config.mts` to a
  package's `tsconfig.json` `include`.
- **Build order comes from `dependencies` + `peerDependencies` only**, via the
  `dependencyFields` option of `runCmdInStagesAcrossWorkspaces`. Packages
  devDepend on the toolchain and the toolchain depends back on them, so
  including `devDependencies` leaves no valid order. A consequence: anything a
  package needs *in order to build* — an app bundling a workspace library, for
  example — belongs in `dependencies`, not `devDependencies`.

`docs/package-dependencies.md` holds the current graph and stage tables;
regenerate it with `pnpm run docs:deps`.
