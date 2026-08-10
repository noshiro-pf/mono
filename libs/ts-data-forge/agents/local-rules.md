# ts-data-forge Local Rules & Guidelines

In addition to the common instructions above (vendored into
`agents/common-rules.md` from the common-agent-config repository), the
project-specific rules below apply.

## Repository Layout (monorepo)

This repository is a **pnpm workspace** (`pnpm-workspace.yaml`,
`packages: packages/**`). The root `package.json` is private
(`ts-data-forge-monorepo`) and only holds repository-wide tooling; every
publishable artifact lives under `packages/`:

| Package                                | Description                                                     |
| :------------------------------------- | :-------------------------------------------------------------- |
| `packages/ts-data-forge`               | The utility library published as `ts-data-forge`.               |
| `packages/eslint-plugin-ts-data-forge` | ESLint rules that steer code toward ts-data-forge idioms.       |

Repository-wide files at the root: `configs/`, `scripts/` (workspace
orchestration: `ws-build-stages.mts`, `check-all.mts`, the `AGENTS.md`
generators), `.changeset/`, `agents/`, `github/`, and the linter / formatter /
spellcheck configs.

Within `packages/ts-data-forge`:

- `src/`: ESM TypeScript modules (`.mts`), organized by domain (`array/`,
  `number/`, `functional/`, `guard/`, `object/`, `string/`, ...). Tests are
  co-located as `*.test.mts`.
- `samples/`: type-checked usage examples; every JSDoc ` ```ts ` block is
  sourced from one (see below).
- `configs/`, `scripts/cmd/`, `dist/`, `docs/`, `coverage/` as usual —
  everything but `src`, `samples`, `configs` and `scripts` is generated.

Use **pnpm** (see `packageManager` in package.json); do not use npm or yarn.
Node.js >= 20.11, ESM (`type: module`).

## Essential Development Commands

Run from the repository root:

- `pnpm run ws:build` - Build every package in dependency order.
  `ws:build:min` skips the per-package checks.
- `pnpm run ws:tsc` / `ws:test` / `ws:test:cov` / `ws:test:browser` /
  `ws:lint:fix` / `ws:doc` / `ws:check:ext` / `ws:gi` - Run the corresponding
  script in every package that defines it.
- `pnpm run check:root` - Type-check and lint the root `scripts/` + `configs/`
  (these are outside every package's tsconfig).
- `pnpm run codemod:full` - `append-as-const` + `convert-to-readonly` over
  every package's `src` / `scripts` / `samples` / `test`.
- `pnpm run check-all` - Comprehensive validation.
- `pnpm run agents:gen` - Regenerate `AGENTS.md` from `agents/*.md`.
- `pnpm changeset` - Record a release note for the packages you changed.

Type checking and builds go through the **`typescript-native`** compiler at an
explicit path (`node ../../node_modules/typescript-native/bin/tsc` from inside
a package); `typescript` proper is kept alongside it for the JS compiler API
that typescript-eslint / typedoc / prettier-plugin-organize-imports need. Do
not assume `node_modules/.bin/tsc` resolves to the one you want.

## Workflow

- After completing a series of code changes, run in this order:
    1. `pnpm run ws:tsc` and `pnpm run ws:test`
    2. `pnpm run ws:lint:fix`
    3. `pnpm run codemod:full` — **before** any doc step, see below
    4. `pnpm run ws:doc:embed:jsdoc`, then `pnpm run ws:doc:embed`, then
       `pnpm run ws:doc`
    5. `pnpm run fmt:full`
    6. `pnpm run check:root` if you touched the root `scripts/` or `configs/`
    7. `pnpm run ws:build`
- **The codemod must run before the doc embeds.** `codemod:full`
  (`append-as-const` / `convert-to-readonly`) rewrites files under `samples/`,
  so running it *after* an embed leaves the copy inside the JSDoc block stale
  — which fails CI's `lint-and-build (ws:build)` and `style-check (ws:doc)`
  while everything passes locally. This bites whenever a task adds **new**
  sample files.
- Run the sequence a second time and confirm `git status` does not grow. These
  steps feed each other, so one pass is not proof of a fixed point.
- Add a changeset (`pnpm changeset`) for any user-visible change.

## Generated vs. Hand-Maintained Files

`pnpm run gi` regenerates `src/**/index.mts` — **except under `src/array/` and
`src/functional/`, which `scripts/cmd/gen-index.mts` explicitly excludes.**
Index files in those two trees are hand-maintained, so a new module there is
silently missing from the public API until you add the export by hand. `gi`
exiting cleanly is not evidence that it picked your file up.

`packages/eslint-plugin-ts-data-forge/src/rule-types.mts` is generated
(`pnpm run gen:rule-types`) and carries a `TypeEq` assertion that fails to
compile when it drifts from `rules.mts`. The root `AGENTS.md` is generated
from `agents/*.md`. CI fails if any generated file drifts from the committed
state.

## JSDoc `@example` Blocks and samples/

Every ` ```ts ` block in a JSDoc comment must be sourced from a type-checked
sample file registered in
`packages/ts-data-forge/scripts/cmd/embed-examples-in-jsdoc-map.mts`, then
embedded with `doc:embed:jsdoc`. Do not hand-edit the embedded blocks.

The mapping is **count-exact and order-sensitive per source file**: the samples
listed for a file must match its ` ```ts ` blocks one-for-one, in order.
Splitting or merging a source file therefore breaks the embed even though no
example changed — re-register both halves rather than dropping the orphaned
samples. Examples that were previously inline get type-checked for the first
time when you extract them, so expect to fix latent errors in them.

## The Length-Constrained Array / String API

`Arr.is*` / `Arr.as*` and `Str.is*` / `Str.as*` follow conventions that are
easy to break without noticing:

- **Length arguments come first**, matching the type-parameter order of the
  ts-type-forge types they narrow to (`BoundedLengthArray<Min, Max, Elm>`):
  `Arr.isBoundedLengthArray(1, 5, xs)`, not `(xs, 1, 5)`. The **type**
  parameters follow the same order — the container comes last — so an explicit
  type-argument list reads in the same order as the call.
- Length-first is what makes the **curried** overload plain partial
  application: `const hasThree = Arr.isMinLengthArray(3)` returns a real type
  predicate. Keep both forms in step when adding a guard.
- **A guard narrows to `Brand<…> & Xs`, on purpose** — `Arr.isMinLengthArray(3, xs)`
  on a five-tuple yields `MinLengthArray<3, E> & readonly [a, b, c, d, e]`,
  preserving the caller's own element types. This is the main source of
  "brand intersected with tuple" types across these repos; see the
  ts-type-forge notes for how such a type must be consumed.
- **A cast returns its input**, never a rebuilt value. Capture the length
  *before* the guard — the negative branch narrows the array away, so
  `array.length` is no longer readable in the error message:

    ```ts
    const actualLength = array.length;

    if (!isFixedLengthTuple(length, array)) {
      throw new TypeError(`... got an array of length ${actualLength}`);
    }

    return array;
    ```

- The `*Array` (branded) and `*Tuple` (structural) families are parallel and
  **rewrites stay inside a family**: `prefer-canonical-length-guard` /
  `prefer-canonical-length-cast` send `isFixedLengthArray(0, xs)` to
  `isEmpty`, and `isFixedLengthTuple(0, xs)` to `isEmptyTuple`. Crossing
  families would silently add or drop the brand; keeping each in its own lane
  makes every guard rewrite a pure rename.
- **Only propagate a lower bound or an exact length** into a return type. An
  upper-only bound unlocks no indexed access for callers while forcing an
  annotation at every `assert.deepStrictEqual` site — and, in practice,
  pushed `filter` over the instantiation-depth limit (TS2589), with the error
  surfacing in unrelated modules.
- `SizeType.ArgArr` only carries literals up to `SmallUint` (`0..39`). A
  function whose length argument is `SizeType.ArgArr` and which already
  expands `0..39` into an exact tuple (`Arr.zeros`, `Arr.seq`) has no case
  left for a brand to describe — adding a `SupportedLength` branch there is
  dead code. `Arr.create` does benefit, because its tuple branch stops at
  `StructuralPrefixLength` (`0..10`).

`ts-type-forge` types appear in this library's own public signatures, so its
major version is effectively part of ts-data-forge's public API — a bump is a
breaking change for consumers that also depend on it directly.

## Commit & PR Guidelines

- Use Conventional Commits. Example: `feat(array): add isNonEmpty`
- Releases are driven by
  [Changesets](https://github.com/changesets/changesets) (`.changeset/`), not
  semantic-release. Every user-visible change needs a changeset naming the
  affected packages and the bump level.
- For breaking changes, follow `BREAKING_CHANGE_GUIDE.md` and add a
  `BREAKING CHANGE:` footer.
- PRs must have a clear description, linked issues, updated tests/docs, and
  pass `pnpm run check-all`.
- Keep PRs small, focused, and within the module layout.
- Do not commit generated `dist/` or `coverage/`.

## Architecture & Patterns

- **Type-first**: Heavy use of TypeScript types for safety
- **Zero runtime dependencies**: Only dev tooling
- **Functional programming**: Immutability, Option/Result types
- **ESM modules**: `.mts` with NodeNext
- **Type guards**: Prefer type guard functions over assertions
- **Export strategy**: All exports via index files (generated, except the two
  trees noted above)
- **Documentation**: Auto-generated from TSDoc

## Code Style & Quality

- **NEVER** use `as any`, `as never`, or `@ts-ignore` (use `@ts-expect-error` only if necessary)
- **ALWAYS** use `assert.deepStrictEqual(A, B)` in Vitest tests — not
  `expect(A).toStrictEqual(B)` / `toEqual`, which
  `vitest-coding-style/no-expect-to-strict-equal` rejects
- **ALWAYS** use `test()` instead of `it()` in Vitest
- **ALWAYS** use named exports unless restricted
- **ALWAYS** use arrow functions
- **PREFER** readonly parameter types and type-safe operations
- **PREFER** ES modules and destructured imports
- **PREFER** running single tests for performance
- **AVOID** file-scope `/* eslint-disable */` and unnecessary `// eslint-disable-next-line`
- **RESTRICTIONS**: Never push to remotes or access sensitive directories without explicit instruction

## Testing Approach

- Use Vitest for both compile-time (`expectType`) and runtime assertions
- Co-locate tests with sources as `.test.mts`
- Example:

    ```typescript
    import { expectType } from '../expect-type.mjs';
    expectType<typeof result, readonly [0, 0, 0]>('=');
    assert.deepStrictEqual(result, [0, 0, 0]);
    ```

- A branded (intersection) type rarely satisfies `'='`, because the checker
  does not normalize intersection member order. Use `'~='` for those and keep
  `'='` for structural results — and assert `'='` on the unbranded cases in the
  same test file, so a regression that drops a brand still shows up.
- `assert.isTrue(x !== undefined)` **narrows** `x` for the rest of the block.
  A following `if (x !== undefined)` is then flagged by
  `@typescript-eslint/no-unnecessary-condition`; drop the `if` and keep the
  assertion.

## TDD Workflow

1. Write tests first
2. Confirm test failure
3. Implement minimal code to pass
4. Refactor with tests green
5. Repeat for new functionality

## Overloads

A type alias (or any declaration) placed **between the overload signatures and
the implementation** breaks the overload group with TS2391 "Function
implementation is missing or not immediately following the declaration". Put
helper types either above the first signature or below the implementation —
the latter reads better when the type is only about the return shape.

## Script Organization

- In `scripts/`, order functions by call hierarchy: main → direct callees → helpers → types/constants

## Checklist Before Commit

- [ ] `pnpm run ws:tsc` (type check)
- [ ] `pnpm run ws:test` (all tests)
- [ ] `pnpm run ws:lint:fix` (ESLint)
- [ ] `pnpm run fmt` (format)
- [ ] `pnpm run ws:build` (build)
