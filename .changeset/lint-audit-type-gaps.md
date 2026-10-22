---
'eslint-config-typed': patch
---

Close three gaps the lint rule audit left open:

- `no-hidden-type-assertions` now reports a call through a cast of a generic
  function whose type parameter only its return type uses, such as
  `(parse as (text: string) => Foo)(text)`. The cast picks `Foo` as surely as
  `parse<Foo>(text)` does, and `no-unsafe-type-assertion` does not report it,
  because the generic function is assignable to every instantiation of it. A
  cast to a function returning `unknown` or `never` is still accepted.
- `no-unnecessary-array-from` and `prefer-non-mutating-array-method` keep the
  `Array.from()` copy under a `satisfies` that the original array does not
  meet: `(Array.from(xs) satisfies number[])` with `xs: readonly number[]` was
  rewritten to `xs satisfies number[]`, which does not type-check.
- `prefer-assert-is-true-over-expect-true` and
  `prefer-assert-is-false-over-expect-false` treat `X` as a boolean only when
  the type at every type-wrapper layer is one, as the `ts-restrictions` rules
  do: `expect(v as boolean).toBe(true)` on an `unknown`, or `expect(flag!)` on
  a `boolean | undefined`, is no longer reported.
