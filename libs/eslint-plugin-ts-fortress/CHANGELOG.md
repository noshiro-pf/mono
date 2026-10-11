# eslint-plugin-ts-fortress

## 1.3.0

### Minor Changes

- 19b99b7: Turn on `no-type-only-codec` in `recommended` at `error`, and read a package's
  entry points from its `package.json` instead of requiring them as an option.

    The entry points are what `exports` publishes — every subpath and condition —
    and the legacy `main`, `module`, `types` and `typings` fields, traced back to
    the source files they are built from: `./dist/index.mjs` becomes
    `src/index.mts`, using the TypeScript project's `outDir` and `rootDir` when set.
    A subpath counts as traced when any of its conditions is, so a `types` file a
    build writes on its own needs no source. When some subpath cannot be traced,
    the package's exported codecs are left alone rather than reported as unused
    public API; `entryPoints` still names them for such a layout, and replaces what
    `package.json` says.

    Without type information the rule no longer fails: it checks the codecs that
    are not exported, which need nothing but their own file, and leaves the
    exported ones alone.

- 8dd8d0f: Add `no-type-only-codec`, which reports a codec paired with
  `type Y = t.TypeOf<typeof X>` whose value nothing reads — no value reference in
  its own file, only `import type` elsewhere in the TypeScript project, and no
  configured entry point re-exporting it — so that `Y` is declared as a plain type
  instead. The rule is type-aware and takes the package's `entryPoints` as an
  option, so it is opt-in and not part of `recommended`.

### Patch Changes

- 8dbc056: Read through `as`, `satisfies`, `!` and `<T>`, and keep the parentheses the
  source writes around an operand when a fix moves or removes it.

    eslint-plugin-ts-fortress:

    - `ts-fortress/prefer-canonical-length-constrained-type`: a parenthesized
      bound, or a parenthesized argument after a dropped bound, made the fix
      unparsable: `t.minLengthArray((1), t.string())` became
      `t.nonEmptyArray((t.string());`. The fix now removes the dropped bound with
      its own parentheses and leaves those of the next argument alone. A bound
      written `1 satisfies number` or `1 as const` is read as `1`; `1 as number`
      is still left alone, because it widens the length the call infers.
    - `ts-fortress/prefer-schema-over-guard-chain`: a guard on `(x as R).a`,
      `x satisfies T`, `<T>x` or `x!` counts towards `x`, and so does a guard call
      or a link of the chain that is itself wrapped.

    eslint-plugin-ts-std-forge:

    - `ts-std-forge/prefer-safe-number-parse` and
      `ts-std-forge/prefer-safe-number-parse-integer`: the argument is judged by
      the type of its value, not of a cast. `Number(b as unknown as string)` on a
      boolean was rewritten to `SafeNumber.parse`, turning 1 into `NaN`, and is
      now left alone. A radix written `10 as const` counts as 10, and a
      sequence argument `(a, s)` keeps its parentheses in the fix.
    - `ts-std-forge/prefer-safe-array-is-array`: the fix of `(Array.isArray)(x)`
      cut the call at the wrong place and left unparsable code. It now replaces
      the callee together with its parentheses. `(Array as ArrayConstructor).isArray(x)` and
      `Array!.isArray(x)` are reported.
    - `ts-std-forge/prefer-is-record-and-has-key`: `isRecord` is dropped only when
      the value, not a cast, is already a record. An array cast to
      `Record<string, unknown>` used to lose the check, which `isRecord` fails
      for an array, so the result could turn from `false` to `true`. A sequence
      object or key keeps its parentheses, so `'k' in (a, o)` no longer becomes
      `hasKey(a, o, 'k')`. `(Object as ObjectConstructor).hasOwn(o, k)` is
      reported.
    - `ts-std-forge/prefer-is-non-null-object`: finds
      `typeof (u satisfies unknown) === 'object' && u! !== null` and the other
      wrapped spellings of the check.
    - `ts-std-forge/prefer-safe-array-length-guard`: finds `xs.length > (0 as const)`,
      `(xs.length as number) > 0` and `xs.length! > 0`. The array is judged by the
      type of its value, so a string cast to an array is left alone, and a
      sequence `(a, xs)` keeps its parentheses in the fix.

## 1.2.4

### Patch Changes

- 6e76d33: Update dependencies

## 1.2.3

### Patch Changes

- fe4a4d2: Update dependencies

## 1.2.2

### Patch Changes

- Updated dependencies [9c21467]
    - ts-data-forge@14.7.0

## 1.2.1

### Patch Changes

- 89e14c8: Update dependencies

## 1.2.0

### Minor Changes

- 9156612: Add `prefer-schema-over-guard-chain`, in `recommended` at `error`: report a hand-written chain of type guards on one value once it is long enough to be a schema.

    ```ts
    // reported at the default threshold of 5
    isRecord(project) &&
        hasKey(project, 'name') &&
        isString(project.name) &&
        hasKey(project, 'path') &&
        isString(project.path);
    ```

    The length is the least of it. What the chain cannot do is say what was wrong: it returns `false`, so a caller filtering on it drops the value silently, with nothing left of which field was missing or what type it turned out to be. The shape is declared and checked in the same breath, so it cannot be named, reused, or read on its own — where `t.record({ name: t.string(), path: t.string() })` can be, and `validate` returns structured `ValidationError`s ready for `validationErrorsToMessages`.

    The rule reports; there is no fix. Writing the schema is the work, and it is not mechanical: the chain says what the value must _have_, never what it _is_, so an optional member, a union and a member that is simply never checked are indistinguishable from the guards alone.

    Counted within one `&&` chain — or one `||` chain of negated guards, the early-return spelling of the same check — grouped by the identifier the guards' first argument is rooted at, so guards on two different values do not add up. A whole function body is deliberately not the unit: the same value checked once per field across a `fill`-style function is a series of defaults rather than a shape check.

    Two options: `threshold` (default `5`) and `guards` (default: the `ts-data-forge` narrowing helpers), both documented in the README along with the distribution the default threshold was chosen from.

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.

- Updated dependencies [30de8fa]
    - ts-data-forge@14.6.3

## 1.1.0

### Minor Changes

- 71a69a3: Add `prefer-namespace-import`, which requires `ts-fortress` to be reached
  through a namespace — `import * as t from 'ts-fortress';`, or
  `import type * as t from 'ts-fortress';` — rather than through named or default
  imports. Its exports are short, generic names (`string`, `record`, `Type`) that
  collide with globals and local declarations as soon as they are pulled into a
  file's scope. A bare `import 'ts-fortress';` is reported and deleted: it binds
  no name, and the package declares `sideEffects: false`.

    The autofix rewrites the import and every reference to it: aliases resolve back
    to the canonical export, shorthand properties are expanded, and several
    `ts-fortress` imports in one file collapse into a single namespace import,
    merging into the one the file already has when there is one. It is withheld —
    the violation is still reported — when the namespace name is bound to something
    else at the import or at a reference, when a binding is re-exported by name,
    when a value import would have to merge into a type-only namespace, or when a
    declaration mixes a namespace specifier with a named one.

    The name the fix introduces defaults to `t` and is configurable with the
    `namespaceName` option. Being part of the `recommended` preset, the rule is on
    for anyone using it.

## 1.0.7

### Patch Changes

- e69fe64: Update dependencies

## 1.0.6

### Patch Changes

- Updated dependencies [d6124a5]
    - ts-data-forge@14.6.0

## 1.0.5

### Patch Changes

- Updated dependencies [4a69cc8]
    - ts-data-forge@14.5.0

## 1.0.4

### Patch Changes

- 332fd6b: Update dependencies
- Updated dependencies [1fe0b59]
    - ts-data-forge@14.4.0

## 1.0.3

### Patch Changes

- Updated dependencies [9810036]
    - ts-data-forge@14.3.0

## 1.0.2

### Patch Changes

- 4f8d4e3: Update dependencies

## 1.0.1

### Patch Changes

- 3d6bca7: Fix the links in the README. They were relative, and npm rewrites a relative
  link against the repository root without regard for `repository.directory`, so
  publishing from the monorepo would have pointed them at paths that do not
  exist — `synstate`'s logo among them. They are absolute now. The links that
  still named one of the repositories this package was merged from now name
  `mono`, and a handful that had gone stale independently (a file that moved, one
  that was renamed, three documents that became pages on the docs site) point
  where those things actually are.
- Updated dependencies [3d6bca7]
    - ts-data-forge@14.2.1
    - ts-type-forge@9.2.1

## 1.0.0

### Major Changes

- 8d8ad2e: Upgrade to `ts-data-forge` 14 and `ts-type-forge` 9.

    Both are dependencies whose types appear in this package's public
    signatures, so consumers that also depend on them directly have to upgrade in
    step. Internally this means the length-constrained guards are now called
    length-first (`Arr.isFixedLengthTuple(1, xs)`), matching ts-data-forge 14.

    BREAKING CHANGE: requires `ts-data-forge` >= 14 and `ts-type-forge` >= 9.

## 0.4.0

### Minor Changes

- f7ecaee: Ship a `recommended` config preset. `eslintPluginTsFortress.configs.recommended`
  is a flat-config object that registers the plugin and enables every rule at
  `error`, so consuming projects can start from:

    ```ts
    export default [eslintPluginTsFortress.configs.recommended];
    ```

    The preset registers the exported plugin object itself, so listing the plugin in
    your own `plugins` record alongside the preset does not trigger ESLint's
    `Cannot redefine plugin` error.

    Also exports the `ESLintFlatConfig` type alongside the existing `ESLintPlugin`.

## 0.3.0

### Minor Changes

- ef6f011: **`prefer-non-empty-array` is replaced by
  `prefer-canonical-length-constrained-type`**, which normalizes every
  length-constrained array combinator whose bounds are degenerate, not just
  `minLengthArray(1, …)`.

    | ❌ written as                 | ✅ canonical form        |
    | :---------------------------- | :----------------------- |
    | `minLengthArray(1, x)`        | `nonEmptyArray(x)`       |
    | `minLengthTuple(0, x)`        | `array(x)`               |
    | `maxLengthTuple(0, x)`        | `fixedLengthTuple(0, x)` |
    | `boundedLengthTuple(n, n, x)` | `fixedLengthTuple(n, x)` |
    | `boundedLengthTuple(0, n, x)` | `maxLengthTuple(n, x)`   |

    Every rewrite is type-identical (verified against the ts-type-forge
    definitions) and preserves the accepted values, the `defaultValue`, and the
    options object; only the default `typeName` — and the `details.kind` of the
    length error derived from it — changes to the one that names the constraint
    being checked. The branded `*Array` family is deliberately left alone, because
    `BoundedLengthArray<Min, Max, A>` intersects both bounds' brands and
    `FixedLengthArray<N, A>` adds an exact tuple for `N <= 10`, so the analogous
    rewrites would widen or narrow the type.

    The autofix also resolves the target name through scope analysis instead of
    scanning the top-level statements, so a binding that merely shadows the
    ts-fortress one around the call site now blocks the fix as well.

    BREAKING CHANGE: the rule name `ts-fortress/prefer-non-empty-array` no longer
    exists. Replace it with
    `ts-fortress/prefer-canonical-length-constrained-type` in your flat config;
    everything the old rule reported is still reported by the new one.

## 0.2.0

### Minor Changes

- f2da41d: Add `eslint-plugin-ts-fortress`, an ESLint plugin whose rules steer schema
  definitions toward ts-fortress idioms.

    Its first rule, `prefer-non-empty-array`, reports `minLengthArray(1, …)` and
    auto-fixes it to the equivalent `nonEmptyArray(…)`.
