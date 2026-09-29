---
'eslint-config-typed': patch
---

Read through `as`, `satisfies`, `!` and `<T>` in the `total-functions` and
`vitest-coding-style` rules, and fix a wrong fix for a parenthesized
sequence expression.

A type wrapper hid a call from these rules, or vouched for a type the value
did not have. Each now looks at the expression underneath:

- `total-functions/no-partial-array-reduce`: `xs.reduce!(f)`,
  `(xs.reduce satisfies unknown)(f)`, `xs['reduce' satisfies string](f)`,
  `xs[k!](f)` and a receiver cast to a type that is not an array are
  reported. A receiver is an array, and a key is `reduce`, if the type at
  any wrapper says so; a cast to a non-empty tuple does not prove the array
  non-empty.
- `total-functions/no-partial-string-normalize`: the same for the callee,
  the receiver and the key. `s.normalize('NFC' satisfies string)` is
  accepted, and `s.normalize(form as 'NFC')` is still reported.
- `total-functions/no-partial-url-constructor`:
  `new (URL as new (url: string) => URL)(input)` is reported, and a literal
  argument is recognized through its wrappers.
- `total-functions/no-premature-fp-ts-effects`: `(effect as () => void)()`
  is reported. The callee is an effect if the type at any wrapper says so.
- `total-functions/no-unsafe-mutable-readonly-assignment` and
  `total-functions/no-unsafe-readonly-mutable-assignment`: a type assertion
  is checked as an assignment of its operand to the asserted type, so
  `func(mutable as ReadonlyA)` and `readonly as unknown as MutableA` are
  reported. `as const` is left to the position it stands in.
- `vitest-coding-style/*`: `(assert as typeof assert).deepEqual(a, b)`,
  `assert!.ok(x)`, `assert.notOk!(x)` and `(expect as typeof expect)(x)`
  are recognized, and the fix keeps the wrapper.
  `vitest-coding-style/prefer-assert-is-true-over-assert` reports
  `(assert as typeof assert)(x)` without a fix.
- `vitest-coding-style/no-expect-to-strict-equal`: `expect(x)!.toStrictEqual(y)`
  and a wrapped `expect` are reported.
- `vitest-coding-style/prefer-assert-is-false-over-assert-negation` and
  `vitest-coding-style/prefer-assert-is-true-over-assert-negated-is-false`:
  `assert.isTrue(!flag as boolean)` is `assert.isFalse(flag)`.
- `vitest-coding-style/prefer-assert-is-true-over-expect-true` and
  `vitest-coding-style/prefer-assert-is-false-over-expect-false`:
  `expect(flag).toBe(true as const)` is reported.

`no-expect-to-strict-equal`, the two negation rules and the two
`expect(…).toBe(…)` rules dropped the parentheses around a sequence
expression: `expect((setup(), x)).toStrictEqual(y)` became
`assert.deepStrictEqual(setup(), x, y)`, which passes three arguments. The
sequence is now kept in parentheses.
