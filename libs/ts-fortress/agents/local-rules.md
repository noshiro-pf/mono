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
