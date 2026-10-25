# @sumi-lang/oxlint-config

## 0.1.0

### Minor Changes

- 9d31620: `sumi check` now reports an `oxlint-disable`, `oxlint-disable-line` or `oxlint-disable-next-line` comment that silences a rule of the Sumi preset, and fails on it: one that names no rule, or names a rule whose last segment is a preset rule's name (oxlint matches by that segment alone, so `foo/no-throw` silences `sumi(no-throw)`). Such a comment answered a Sumi diagnostic without `@sumi-expect-error`, which is meant to be the only way to (D-60). A comment naming only other rules is left alone. `@sumi-lang/oxlint-config` exports the scan as `findSumiSilencingDirectives`.

### Patch Changes

- Updated dependencies [7f3e173]
    - ts-data-forge@14.10.0
    - eslint-rule-forge@0.3.0

## 0.0.8

### Patch Changes

- Updated dependencies [384b952]
    - eslint-rule-forge@0.3.0
    - ts-data-forge@14.9.0

## 0.0.7

### Patch Changes

- Updated dependencies [079cb28]
    - ts-data-forge@14.9.0
    - eslint-rule-forge@0.2.0

## 0.0.6

### Patch Changes

- d1ae3cf: `banned-syntax/no-constructor-call` and `banned-syntax/no-new-array` now see a constructor reached through the global object (`globalThis.Number(x)`, `globalThis['String'](x)`, `new globalThis.Array(3)`, and `window`, `self` and `global` alike) unless a user declaration shadows that name. `no-constructor-call` also reports a constructor used as a template tag (`` String`42` ``), and `no-new-array` now leaves alone a locally declared `Array`, as `no-constructor-call` already did.
- 26a1f5f: `@sumi-expect-error-file` now has to stand before the first code line (D-63): only comments, blank lines, a shebang and other markers may precede it. One placed below code is reported as an invalid marker and suppresses nothing, because it would read as covering only the lines after it.

    `sumi check` now reports every comment that looks like a marker but is not one — malformed, applying to nothing, or a misplaced file-scoped marker — and fails on it; it used to drop them silently, leaving the diagnostic they meant with no word about why. An unused file-scoped marker is reported on its own line instead of line 0. `parseMarkers` returns its `problems` as `{ line, message }` and gives a file-scoped marker its own `markerLine`.

- Updated dependencies [fba7527]
- Updated dependencies [f89dc57]
    - eslint-rule-forge@0.2.0
    - ts-data-forge@14.8.0

## 0.0.5

### Patch Changes

- 9cfb401: Read through parentheses and `as`, `satisfies`, `!` and `<T>` in the Sumi
  rules and in two transformers.

    A type wrapper hid a pattern from these rules, or vouched for a type the value
    did not have. Each now judges the expression underneath.

    `@sumi-lang/checker`:

    - The shared `unwrap` also skips `satisfies` and `<T>`, which it already did
      for parentheses, `as` and `!`.
    - `mutation/no-mutation-without-mut-prefix`: `(o.a satisfies number) = 2`,
      `(<number>o.a) = 3` and a `for … of` over such a target are reported. So are
      mutators called through a wrapped callee, as in `(xs.push)(1)` and
      `(xs.push satisfies F)(1)`. A method on a cast receiver, as in
      `(xs as { push: … }).push(1)`, is resolved on the type of the value rather
      than of the cast. `(mut_xs satisfies number[]).push(1)`,
      `([3, 1, 2] satisfies number[]).sort()` and
      `Object.assign({} satisfies object, x)` are no longer reported.
    - `mutation/no-tuple-mutating-method`: `(t.push)(3)` and
      `(t.push satisfies F)(3)` are reported, and so are `(t as X[]).push(3)` and
      `(<X[]>t).reverse()`, which still grow or reorder the tuple. An array cast
      to a tuple, as in `(xs as [number, number]).push(3)`, is no longer reported.
    - `boolean/strict-logical-assignment-operands`: an operand is judged by the
      type of its value. `mut_f! ||= true` and `mut_ok &&= n as unknown as boolean`
      are reported.

    `@sumi-lang/oxlint-config`:

    - `banned-syntax/no-constructor-call`: `(Number satisfies NumberConstructor)('1')`,
      `(Boolean as BooleanConstructor)(1)`, `(<StringConstructor>String)(42)` and
      `Boolean!(1)` are reported. A local binding of the same name is still left
      alone.
    - `banned-syntax/no-new-array`: `new (Array satisfies ArrayConstructor)(3)` and
      `new (Array as ArrayConstructor)(3)` are reported.
    - `modules/no-internal-module-import`: a dynamic import's specifier is judged
      under `satisfies` or `as`, and when it is a template literal with no
      substitutions.

    `@sumi-lang/conformance`: fixtures for each of the above.

    `ts-codemod-lib`:

    - `enable-no-unchecked-indexed-access` judged the position of an access
      without looking past the parentheses around it, and put `!` inside them
      where the position already tests for `undefined` or cannot take it:
      `(xs[0]) === undefined`, `(xs[0]) ?? 0`, `(xs[0])?.toFixed()`,
      `if ((xs[0]))`, `typeof (xs[0])`, `(xs[0])!`, `(xs[0]) as number`,
      `(mut_ys[0]) += 1` and `delete (rec['a'])`. It now leaves these alone. An
      access under `satisfies` still gets its `!` (`xs[0]! satisfies number`),
      which is what makes it compile under the option.
    - `append-as-const` removes a redundant `as const` from an argument for a
      `const` type parameter when the argument is parenthesized, as in
      `f(([1] as const))`.

- 0dd92aa: Enforce `import type` for type-only imports (D-59), the inline form for
  imports mixing values and types, and braces on every statement body (D-61).

    The preset now enables `typescript/no-import-type-side-effects` and
    `typescript/consistent-type-imports` (`prefer: "type-imports"`,
    `fixStyle: "inline-type-imports"`), both reported as
    `modules/require-import-type`: under `verbatimModuleSyntax`,
    `import { type X } from 'm'` is emitted as `import {} from 'm'`, the side-effect
    import the preset already bans. `import/no-duplicates` (`preferInline: true`,
    reported as `modules/no-duplicate-import`) keeps one statement per module, so a
    mixed import is `import { bar, type Foo }` rather than a separate
    `import type`. It also enables `curly: "all"` (`boolean/require-braces`), which
    keeps a statement `if` visibly apart from Sumi sugar's `if (c) a else b`
    expression.

    The ESLint off fragment turns off `curly`,
    `@typescript-eslint/no-import-type-side-effects` and `import-x/no-duplicates`.

- ts-data-forge@14.7.1

## 0.0.4

### Patch Changes

- be1da31: Stop `sumi check` from obeying ESLint's disable comments, and let
  `@sumi-expect-error` sit above one.

    oxlint reads `eslint-disable*` comments by default and matches them by rule
    name alone, so `// eslint-disable-next-line total-functions/no-unsafe-type-assertion`
    silenced `typescript/no-unsafe-type-assertion` as well. A comment written
    for ESLint went past the one guarantee `@sumi-expect-error` exists for: a
    marker nothing answers fails. The preset now sets
    `respectEslintDisableDirectives: false`.

    A line both engines report then needs both comments, and ESLint's applies
    only to the line right after it. A marker therefore skips over an
    `eslint-disable-next-line` or `oxlint-disable-next-line` line beneath it and
    applies to the code after that. Any other comment line is still the line a
    marker applies to, because a diagnostic can sit on a comment (`// @ts-ignore`).
    An unused marker is reported on its own line, which is no longer always the
    line above the code.

- ts-data-forge@14.7.1

## 0.0.3

### Patch Changes

- Updated dependencies [6e23aed]
    - ts-data-forge@14.7.1

## 0.0.2

### Patch Changes

- 003c848: Adopt `@sumi-expect-error` in `sumi check`, with `@ts-expect-error` semantics.

    The marker existed only inside the conformance corpus, where it states the
    diagnostic a fixture must produce. On user code `sumi check` did not read it
    at all: it suppressed nothing, and — the half that matters — it reported
    nothing when the diagnostic it names had stopped appearing. D-51 chose the
    spelling precisely so the two would behave alike, and left adopting it for
    user code open; this closes that.

    `sumi check` now suppresses the lint diagnostic a marker names on the line it
    applies to, and reports `unused @sumi-expect-error` (exit 1) for a marker
    nothing answered. That is what separates it from an `oxlint-disable` comment,
    which goes stale silently once the code around it is fixed.

    Both engines are covered in one pass — the oxlint preset and the type-aware
    checker (D-54) report into the same neutral vocabulary, and which of them
    answered a marker is not something the marker can say.

    Only lint diagnostics are covered. A compiler error already has
    `@ts-expect-error`, which TypeScript checks for staleness the same way, and
    two comments for one job would only raise the question of which one applies.

    The parser moves from `@sumi-lang/conformance` to `@sumi-lang/oxlint-config`
    so that the corpus and the CLI share one implementation — one spelling and one
    meaning cannot survive two parsers. The neutral-ID normalization (`toRuleId`)
    moves with it for the same reason; it was a private helper in the corpus test.

## 0.0.1

### Patch Changes

- Updated dependencies [9c21467]
    - ts-data-forge@14.7.0
