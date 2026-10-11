# @sumi-lang/checker

## 0.0.2

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

- ts-data-forge@14.7.1

## 0.0.1

### Patch Changes

- Updated dependencies [6e23aed]
    - ts-data-forge@14.7.1
