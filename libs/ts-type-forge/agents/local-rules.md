# ts-type-forge Local Rules

Repository-specific rules for `ts-type-forge`. These complement (and where
noted, override) the shared agent instructions above.

## Project Overview

This is a **pure type-level TypeScript utility library with no runtime
code**. All modules in `src/` are `.mts` files containing only type
declarations (`export type`, `export namespace`). The build emits declaration
files (`.d.mts`) only — there is no JavaScript output.

This repository uses **pnpm** (see `packageManager` in package.json); do not
use npm or yarn.

## Deviations from the Shared Instructions

- **No Vitest / no runtime tests.** Ignore the Vitest-specific sections of
  the shared instructions. `pnpm run test` runs the type-level tests via
  `tsc --noEmit` (the `typescript-native` compiler); the `expectType` DSL
  described in the shared instructions applies as-is, but it is imported
  from the **`ts-data-forge` package** (not from a local helper file).
- **`ts-type-forge` globals**: this repository IS ts-type-forge, so its
  types are imported from relative paths within `src/` (via each
  directory's `index.mjs`), not used as ambient globals.

## Essential Development Commands

- `pnpm run build` - Full build pipeline: regenerates `src/**/index.mts`,
  `src/entry-point.mts`, `src/global.mts`, and `AGENTS.md`; type-checks;
  emits declarations to `dist/`; then type-checks the dist output through
  the real package `exports` map (`test/dist_/named` + `test/dist_/ambient`)
- `pnpm run test` (alias: `pnpm run tsc`) - Runs the type tests
  (`tsc --noEmit` over `src/**/*.test.mts`)
- `pnpm run check-all` - Comprehensive validation (spellcheck, lint, build,
  docs)
- `pnpm run doc:embed` / `pnpm run doc:embed:jsdoc` - Embed sample code from
  `samples/` into `README.md` / JSDoc `@example` blocks (see below)

## Architecture

### Module Organization

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

### Public API Surface (three entry points)

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

### Generated Files (never edit manually)

`src/**/index.mts`, `src/entry-point.mts`, `src/global.mts`, and the root
`AGENTS.md` are auto-generated. Regenerate with `pnpm run build` (or
`pnpm run gi` / `pnpm run agents:gen` individually). CI fails if they drift
from the committed state.

## Testing

- Tests are **type-level only**, co-located with the source as
  `src/**/*.test.mts`, using `expectType` imported from `ts-data-forge`
- `test/dist_/named/` and `test/dist_/ambient/` type-check the **built**
  `dist/` output through the real package.json `exports` map (run as part
  of `pnpm run build`; also run against multiple TypeScript versions in
  CI). They intentionally use separate tsconfigs: the named-import program
  asserts that ambient globals do NOT leak, which only holds when
  `ts-type-forge/global` is not loaded.
- Prefer `expectType<A, B>('=')`; avoid weaker relations (`'<='`, `'!='`)
  except when intended, and never assert a type against itself (a
  tautology). For instantiation-depth smoke tests, assert a boundary value
  or a derived property (e.g. `['length']`) instead.
- Cover `never` / `any` / `unknown` / union / empty-tuple / readonly /
  optional-key edge cases for new utilities.

## JSDoc `@example` Blocks and samples/

Every ` ```ts ` code block in `src/**/*.mts` JSDoc MUST be sourced from a
type-checked sample file:

1. Write the example as `samples/src/**/<type-name>-example.mts` (these are
   type-checked by `pnpm run test`)
2. Register it in `scripts/cmd/embed-examples-in-jsdoc-map.mts` (sample
   files must be listed in the order their `@example` blocks appear in the
   source file)
3. Run `pnpm run doc:embed:jsdoc` to embed it

`doc:embed:jsdoc` FAILS if a src file contains a ` ```ts ` block that is not
registered in the mapping. Do not hand-edit the embedded blocks in `src/`.

## Workflow

- After completing a series of code changes, run in this order:
    1. `pnpm run tsc` (type checking + type tests)
    2. `pnpm run lint:fix`
    3. `pnpm run fmt`
    4. `pnpm run doc:embed` and `pnpm run doc:embed:jsdoc` (embed samples;
       also verifies that every JSDoc example is sourced from `samples/`)
- `pnpm run build` additionally regenerates all generated files and
  validates the dist output; run it before finishing a task that touches
  `src/`

## Restrictions

In addition to the shared restrictions (no push, no `~/.ssh`):

- Do NOT `git commit` without explicit user instruction

## Configuration Notes

- **Dual TypeScript install**: `typescript` (6.x; JS compiler API for
  typescript-eslint / typedoc / prettier-plugin-organize-imports) and
  `typescript-native` (an npm alias of TypeScript 7). Type checking and
  builds MUST use the explicit path
  `node ./node_modules/typescript-native/bin/tsc` (the `node_modules/.bin/tsc`
  winner is not guaranteed). Dependabot is configured to ignore
  `typescript` major updates to protect this split.
- **TypeScript**: strict mode with `noUncheckedIndexedAccess: true`
- **Module resolution**: `NodeNext`; source files use `.mts` and import
  with `.mjs` extensions
- The published package is **types-only**: `exports` only maps `types`
  conditions to `.d.mts` files (`./dist/entry-point.d.mts` and
  `./dist/global.d.mts`)
