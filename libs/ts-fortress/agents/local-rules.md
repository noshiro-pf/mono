# ts-fortress Local Rules

Repository-specific rules for the `ts-fortress` monorepo (a runtime
type-validation / branded-type library and its ESLint plugin). These supplement
the shared instructions above (vendored into `agents/common-rules.md` from the
common-agent-config repository).

## Repository Layout (monorepo)

This repository is a **pnpm workspace** (`pnpm-workspace.yaml`,
`packages: packages/**`). The root `package.json` is private
(`ts-fortress-monorepo`) and only holds repository-wide tooling; every
publishable artifact lives under `packages/`:

| Package                              | Description                                                          |
| :----------------------------------- | :------------------------------------------------------------------- |
| `packages/ts-fortress`               | The schema validation library published as `ts-fortress`.            |
| `packages/eslint-plugin-ts-fortress` | ESLint rules that steer schema definitions toward ts-fortress idioms. |

Repository-wide files at the root: `configs/tsconfig/*` (shared tsconfig bases
every package extends), `scripts/` (workspace orchestration:
`ws-build-stages.mts`, `check-all.mts`, the `AGENTS.md` generators),
`.changeset/`, `agents/`, `github/`, and the linter / formatter / spellcheck
configs.

Use **pnpm** (see `packageManager` in package.json); do not use npm or yarn.

## Essential Development Commands

Run from the repository root:

- `pnpm run ws:build` - Build every package in dependency order
  (`ws:build:min` skips the per-package checks).
- `pnpm run ws:test` / `ws:test:cov` / `ws:test:browser` / `ws:lint:fix` /
  `ws:doc` / `ws:check:ext` / `ws:gi` - Run the corresponding script in every
  package that defines it.
- `pnpm run check:root` - Type-check and lint the root `scripts/` + `configs/`
  (these are outside every package's tsconfig).
- `pnpm run check-all` - Comprehensive validation (spellcheck, markdown,
  extensions, root checks, lint, build, tests, codemod, format).
- `pnpm run agents:gen` - Regenerate `AGENTS.md` from `agents/*.md`.
- `pnpm changeset` - Record a release note for the packages you changed
  (releases are driven by Changesets, not semantic-release).

Per package, use `pnpm --filter <name> run <script>` or run from its directory.

### `packages/eslint-plugin-ts-fortress`

- `src/rules/<rule-name>.mts` - one rule per file, exported as a plain
  `TSESLint.RuleModule` object (not `RuleCreator`), so read options from
  `context.options[0]` and apply defaults manually.
- `src/rules/rules.mts` - the rule registry; add new rules here.
- `src/rules/import-utils.mts` - shared import/callee helpers. ts-fortress is
  idiomatically consumed as `import * as t from 'ts-fortress'`, so every rule
  must handle both the namespace and the named-import (incl. aliased) form.
- `src/rule-types.mts` - **generated** (`pnpm run gen:rule-types`); contains a
  `TypeEq` assertion that fails to compile when it drifts from `rules.mts`.
- Every rule needs a co-located `*.test.mts` covering the `valid` and `invalid`
  (with `output`) sides, plus the cases the rule deliberately skips.

### Generated Files (never edit manually)

`packages/ts-fortress/src/**/index.mts`,
`packages/eslint-plugin-ts-fortress/src/rule-types.mts`, and the root
`AGENTS.md` are auto-generated. Regenerate with `pnpm run ws:build` (or
`pnpm run ws:gi` / `pnpm run agents:gen` individually). CI fails if they drift
from the committed state.

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
  — which fails CI's build and doc checks while everything passes locally.
  This bites whenever a task adds **new** sample files.
- Run the sequence a second time and confirm `git status` does not grow. These
  steps feed each other, so one pass is not proof of a fixed point.
- The JSDoc sample mapping
  (`packages/ts-fortress/scripts/cmd/embed-examples-in-jsdoc-map.mts`) is
  **count-exact and order-sensitive per source file**, so splitting or merging
  a source file breaks the embed even though no example changed.

## The Length-Constrained Array Combinators

`minLengthArray` / `maxLengthArray` / `boundedLengthArray` /
`fixedLengthArray` in `packages/ts-fortress/src/array/` return the **branded**
ts-type-forge types, while their `*Tuple` counterparts return the structural
ones. Two properties are worth knowing before touching them or the ESLint
rules that rewrite them:

- **The result is a *pure* brand.** These combinators produce
  `Type<MinLengthArray<N, A>>` and never intersect the brand with a tuple.
  That is the opposite of ts-data-forge's `Arr.is*` guards, which narrow to
  `Brand<…> & Xs` so as to keep the caller's own element types. If you are
  reasoning about "brand intersected with tuple" types, this repository is not
  a source of them.
- **Each combinator is an overload pair keyed on the bound.** A bound inside
  `SupportedLength` (`0..2048`) can be encoded in the brand; anything larger
  selects the fallback overload and the length constraint is dropped
  (`Type<readonly A[]>`). The structural `*Tuple` combinators have the tighter
  `StructuralPrefixLength` (`0..10`) limit, mirrored as
  `STRUCTURAL_PREFIX_CAP` in the plugin's `constants.mts`. A rewrite that
  carries a bound from one combinator to another is only valid while the bound
  is inside the target's range.

### Why canonical-form rewrites must be type-identical here

`prefer-canonical-length-constrained-type` only rewrites calls whose result is
the **very same** `Type<T>`, never one that is merely narrower. That is
stricter than the equivalent ts-data-forge rules, and the reason is variance:
`Type<A>` is **not covariant in `A`** (`prune` takes `<B extends A>`, putting
`A` in a constraint position — see the long note on `Type` in
`src/type.mts`). So a `Type<Narrower>` is *not* substitutable for a
`Type<Wider>`, and "strengthening" a combinator call can break assignability
at every use site.

A ts-data-forge `Arr.as*` cast has no such problem — it only ever *returns*
the narrowed value, so a strengthened result stays assignable everywhere the
old one was, and those rules do allow a few strengthening rewrites. Do not
port that latitude back here.

## Validation Error Handling

### Centralized Error Message Logic

All validation error messages must be centralized in `src/utils/validation-error.mts` to ensure consistency and maintainability.

#### Guidelines

1. **Define Error Details Types**: Add new error detail types to `ValidationErrorDetails` in `src/utils/validation-error.mts`
2. **Implement Message Logic**: Add corresponding message generation logic in the `createDetailsMessage` function
3. **Use Structured Details**: Always use the `details` field in `ValidationError` rather than custom error messages

#### Example

**❌ Don't do this:**
```typescript
// Creating custom error messages inline
const validate = (a: unknown) => {
  if (!isValid(a)) {
    return Result.err([
      createPrimitiveValidationError({
        actualValue: a,
        expectedType: 'MyType',
        typeName: 'MyType',
        details: { kind: 'custom', message: `Custom error for ${a}` },
      }),
    ]);
  }
  return Result.ok(a);
};
```

**✅ Do this instead:**

1. First, add to `ValidationErrorDetails`:
```typescript
// In src/utils/validation-error.mts
export type ValidationErrorDetails = Readonly<
  | {
      kind: 'template-literal';
      pattern?: string;
    }
  | // ... other types
>;
```

2. Then, add message logic:
```typescript
// In createDetailsMessage function
case 'template-literal':
  return error.details.pattern !== undefined
    ? `expected <${error.expectedType}> matching pattern "${error.details.pattern}" but <${actualTypeStr}> type value${actualValueStr} was passed.`
    : `expected <${error.expectedType}> but <${actualTypeStr}> type value${actualValueStr} was passed.`;
```

3. Finally, use in your validator:
```typescript
// In your type implementation
const validate = (a: unknown) => {
  if (!is(a)) {
    return Result.err([
      createPrimitiveValidationError({
        actualValue: a,
        expectedType: typeName,
        typeName,
        details: { kind: 'template-literal', pattern: options?.pattern },
      }),
    ]);
  }
  return Result.ok(a);
};
```

#### Benefits

- **Consistency**: All error messages follow the same format
- **Maintainability**: Update error messages in one place
- **Testability**: Easier to test error message generation
- **Type Safety**: TypeScript ensures all error kinds are handled
- **i18n Ready**: Centralized messages make internationalization easier

#### When to Use `kind: 'custom'`

The `custom` kind should only be used when:
- The error is truly one-off and doesn't fit any existing pattern
- Adding a new structured type would be overkill
- You're prototyping and plan to refactor later

In most cases, prefer adding a new structured error type to `ValidationErrorDetails`.
