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

## Cross-package dependencies

- Runtime dependencies between packages in this repository use the `workspace:`
  protocol. Match the protocol to the range you intend to publish:
  `^x.y.z` → `workspace:^`, `~x.y.z` → `workspace:~`, an exact pin →
  `workspace:*`. Using `workspace:*` where `workspace:^` was meant narrows the
  published range to an exact version.
- **A package under `libs/` must not devDepend on a sibling.** `ws:build`
  derives its topological order from `dependencies` + `devDependencies` +
  `peerDependencies` merged, so a devDependency on the toolchain
  (`eslint-config-typed` → `ts-data-forge` → …) makes the order unsolvable.
  The repository's own toolchain lives in the **root** `package.json`, which is
  not a workspace member and therefore not part of that graph.
- In the root `package.json`, a workspace package may be `workspace:*` **only
  if nothing that runs before `pnpm run ws:build` needs it.** `ts-data-forge`,
  `ts-repo-utils`, `ts-type-forge`, `ts-codemod-lib` and
  `github-settings-as-code` are executed by the build itself or by CI steps
  that precede it, so they stay pinned to published npm versions. The lint
  toolchain (`eslint-config-typed`, `eslint-plugin-ts-*`) is used only after
  `dist/` exists and is workspace-linked.
- **Do not add `eslint.config.mts` to a package's `tsconfig.json` `include`.**
  It imports the workspace-linked lint toolchain, which has no `dist/` while
  the package is being built. The root `tsconfig.json` type-checks
  `./**/eslint.config*.mts` after the build instead.
- `linkWorkspacePackages` is left at its default (`false`). Only an explicit
  `workspace:` specifier links locally.
- `pnpm run docs:deps` regenerates `docs/package-dependencies.md`, which holds
  the current graph, the build stages and the reasoning above.
