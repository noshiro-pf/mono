# @sumi-lang/conformance

## 0.0.3

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

- Updated dependencies [9cfb401]
    - @sumi-lang/checker@0.0.2
    - ts-data-forge@14.7.1

## 0.0.2

### Patch Changes

- Updated dependencies [6e23aed]
    - ts-data-forge@14.7.1
    - @sumi-lang/checker@0.0.1

## 0.0.1

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
