# ts-type-forge Local Rules

Repository-specific rules for the `ts-type-forge` monorepo. These complement
(and where noted, override) the shared agent instructions above.

## Repository Layout (monorepo)

This repository is a **pnpm workspace** (`pnpm-workspace.yaml`,
`packages: packages/**`). The root `package.json` is private
(`ts-type-forge-monorepo`) and only holds repository-wide tooling; every
publishable artifact lives under `packages/`:

| Package                                | Description                                                            |
| :------------------------------------- | :--------------------------------------------------------------------- |
| `packages/ts-type-forge`               | The type-level utility library published as `ts-type-forge`.           |
| `packages/eslint-plugin-ts-type-forge` | ESLint rules that steer type declarations toward ts-type-forge idioms. |

Repository-wide files at the root: `configs/tsconfig/*` (shared tsconfig
bases every package extends), `scripts/` (workspace orchestration:
`ws-build-stages.mts`, `check-all.mts`, the `AGENTS.md` generators),
`.changeset/`, `agents/`, `github/`, and the linter / formatter / spellcheck
configs.

Use **pnpm** (see `packageManager` in package.json); do not use npm or yarn.

## Deviations from the Shared Instructions

- **`packages/ts-type-forge` has no Vitest / no runtime tests.** It is a
  **pure type-level TypeScript library with no runtime code**: all modules in
  its `src/` are `.mts` files containing only type declarations
  (`export type`, `export namespace`), and the build emits declaration files
  (`.d.mts`) only. Its `pnpm run test` runs the type-level tests via
  `tsc --noEmit` (the `typescript-native` compiler); the `expectType` DSL
  described in the shared instructions applies as-is, but it is imported from
  the **`ts-data-forge` package** (not from a local helper file).
- **`packages/eslint-plugin-ts-type-forge` does use Vitest** (rule tests via
  `@typescript-eslint/rule-tester`), so the Vitest sections of the shared
  instructions apply there.
- **`ts-type-forge` globals**: `packages/ts-type-forge` IS ts-type-forge, so
  its types are imported from relative paths within `src/` (via each
  directory's `index.mjs`), not used as ambient globals. The ESLint plugin
  imports them from the `ts-type-forge` package (a `workspace:*` dependency).

## Essential Development Commands

Run from the repository root:

- `pnpm run ws:build` - Build every package in dependency order
  (`ts-type-forge` first, then the ESLint plugin). `ws:build:min` skips the
  per-package checks.
- `pnpm run ws:test` / `ws:lint:fix` / `ws:doc` / `ws:check:ext` / `ws:gi` -
  Run the corresponding script in every package that defines it.
- `pnpm run check:root` - Type-check and lint the root `scripts/` + `configs/`
  (these are outside every package's tsconfig).
- `pnpm run check-all` - Comprehensive validation (spellcheck, markdown,
  extensions, root checks, lint, build, tests, codemod, docs, format).
- `pnpm run agents:gen` - Regenerate `AGENTS.md` from `agents/*.md`.
- `pnpm changeset` - Record a release note for the packages you changed
  (required for anything user-visible; releases are driven by Changesets, not
  semantic-release).

Per package (`pnpm --filter <name> run <script>`, or from its directory):

- `packages/ts-type-forge`
    - `build` - Regenerates `src/**/index.mts`, `src/entry-point.mts`, and
      `src/global.mts`; type-checks; emits declarations to `dist/`; then
      type-checks the dist output through the real package `exports` map
      (`test/dist_/named` + `test/dist_/ambient`)
    - `test` (alias: `tsc`) - Runs the type tests (`tsc --noEmit` over
      `src/**/*.test.mts`)
    - `doc:embed` / `doc:embed:jsdoc` - Embed sample code from `samples/`
      into `README.md` / JSDoc `@example` blocks (see below)
- `packages/eslint-plugin-ts-type-forge`
    - `build` - Regenerates `src/rule-types.mts`, type-checks, bundles with
      Rollup, emits declarations
    - `test` - Vitest rule tests
    - `gen:rule-types` - Regenerate `src/rule-types.mts` only

## Architecture

### `packages/ts-type-forge`

#### Module Organization

Types are organized into logical categories under `src/`:

- **condition/**: Type predicates (IsNever, IsAny, IsUnknown, IsUnion,
  TypeEq, ...)
- **constants/**: Common type constants (Primitive, FalsyValue, int enums)
- **record/**: Object type utilities (DeepReadonly, StrictOmit, ...)
- **tuple-and-list/**: Array/tuple operations (List / Tuple namespaces)
- **type-level-integer/**: Numeric type operations (UintRange, Increment,
  Max, ...)
- **others/**: Miscellaneous utilities (JsonValue, Mutable, ...)
- **branded-types/**: Nominal typing utilities (Brand, predefined number /
  string / array brands)

#### Public API Surface (three entry points)

1. `src/index.mts` - internal aggregation of ALL exports (including
   internals); referenced by `global.mts`
2. `src/entry-point.mts` - the **public** entry point
   (`import { X } from 'ts-type-forge'`); excludes internals
3. `src/global.mts` - ambient global declarations
   (`/// <reference types="ts-type-forge/global" />`)

Internal helper types use the `TSTypeForgeInternals_` name prefix; the
generators exclude them from `entry-point.mts` and `global.mts`. Keep
module-local helpers unexported where possible; use the prefix (optionally
via a small exported shim) only when a test needs to reach them.

### `packages/eslint-plugin-ts-type-forge`

- `src/rules/<rule-name>.mts` - one rule per file, exported as a plain
  `TSESLint.RuleModule` object (not `RuleCreator`), so read options from
  `context.options[0]` and apply defaults manually.
- `src/rules/rules.mts` - the rule registry; add new rules here.
- `src/rules/ast-utils.mts` / `import-utils.mts` - shared AST + import
  helpers.
- `src/rule-types.mts` - **generated** (`pnpm run gen:rule-types`) typed rule
  entries for consumers' flat configs; contains a `TypeEq` assertion that
  fails to compile when it drifts from `rules.mts`.
- Every rule needs a co-located `*.test.mts` covering both the `valid` and
  `invalid` (with `output`) sides, plus the cases the rule deliberately
  skips.

### Generated Files (never edit manually)

`packages/ts-type-forge/src/**/index.mts`, `src/entry-point.mts`,
`src/global.mts`, `packages/eslint-plugin-ts-type-forge/src/rule-types.mts`,
and the root `AGENTS.md` are auto-generated. Regenerate with
`pnpm run ws:build` (or `pnpm run ws:gi` / `pnpm run agents:gen`
individually). CI fails if they drift from the committed state.

## Testing

- `packages/ts-type-forge` tests are **type-level only**, co-located with the
  source as `src/**/*.test.mts`, using `expectType` imported from
  `ts-data-forge`
- `packages/ts-type-forge/test/dist_/named/` and `.../ambient/` type-check the
  **built** `dist/` output through the real package.json `exports` map (run as
  part of that package's `build`; also run against multiple TypeScript
  versions in CI). They intentionally use separate tsconfigs: the named-import
  program asserts that ambient globals do NOT leak, which only holds when
  `ts-type-forge/global` is not loaded.
- Prefer `expectType<A, B>('=')`; avoid weaker relations (`'<='`, `'!='`)
  except when intended, and never assert a type against itself (a
  tautology). For instantiation-depth smoke tests, assert a boundary value
  or a derived property (e.g. `['length']`) instead.
- Cover `never` / `any` / `unknown` / union / empty-tuple / readonly /
  optional-key edge cases for new utilities.

## JSDoc `@example` Blocks and samples/

Every ` ```ts ` code block in `packages/ts-type-forge/src/**/*.mts` JSDoc MUST
be sourced from a type-checked sample file:

1. Write the example as `samples/src/**/<type-name>-example.mts` (these are
   type-checked by that package's `pnpm run test`)
2. Register it in `scripts/cmd/embed-examples-in-jsdoc-map.mts` (sample
   files must be listed in the order their `@example` blocks appear in the
   source file)
3. Run `pnpm run doc:embed:jsdoc` to embed it

`doc:embed:jsdoc` FAILS if a src file contains a ` ```ts ` block that is not
registered in the mapping. Do not hand-edit the embedded blocks in `src/`.

## Workflow

- After completing a series of code changes, run in this order:
    1. `pnpm run ws:tsc` (type checking + type tests) and `pnpm run ws:test`
    2. `pnpm run ws:lint:fix`
    3. `pnpm run fmt`
    4. `pnpm run ws:doc:embed` and `pnpm run ws:doc:embed:jsdoc` (embed
       samples; also verifies that every JSDoc example is sourced from
       `samples/`)
    5. `pnpm run check:root` if you touched the root `scripts/` or `configs/`
- `pnpm run ws:build` additionally regenerates all generated files and
  validates the dist output; run it before finishing a task that touches any
  package's `src/`
- Add a changeset (`pnpm changeset`) for any user-visible change

## Restrictions

In addition to the shared restrictions (no push, no `~/.ssh`):

- Do NOT `git commit` without explicit user instruction

## Configuration Notes

- **Dual TypeScript install**: `typescript` (6.x; JS compiler API for
  typescript-eslint / typedoc / prettier-plugin-organize-imports) and
  `typescript-native` (an npm alias of TypeScript 7). Type checking and
  builds MUST use the explicit path
  `node ./node_modules/typescript-native/bin/tsc` from the repository root
  (`../../node_modules/...` from inside a package) - the
  `node_modules/.bin/tsc` winner is not guaranteed. Dependabot is configured
  to ignore `typescript` major updates to protect this split.
- **TypeScript**: strict mode with `noUncheckedIndexedAccess: true`
- **Shared tsconfig bases** live in `configs/tsconfig/`
  (`tsconfig.type-check.json`, `tsconfig.build.json`, `tsconfig.vite.json`);
  each package's `tsconfig.json` extends them with relative paths.
- **Module resolution**: `NodeNext`; source files use `.mts` and import
  with `.mjs` extensions
- The published `ts-type-forge` package is **types-only**: `exports` only
  maps `types` conditions to `.d.mts` files (`./dist/entry-point.d.mts` and
  `./dist/global.d.mts`)
- **Releases** are driven by
  [Changesets](https://github.com/changesets/changesets) (`.changeset/`,
  `.github/workflows/release.yml`), not semantic-release
