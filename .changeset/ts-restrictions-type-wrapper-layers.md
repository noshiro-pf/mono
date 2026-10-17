---
'eslint-config-typed': patch
---

The type-aware `ts-restrictions` rules now draw a conclusion from a type only
when it holds at every type-wrapper layer (`as`, `satisfies`, `!`, `<T>`),
instead of asking only the innermost expression. A cast widening a value is
taken as the author saying it may hold more, so these are no longer reported
or fixed:

- `(b as boolean | number) ? true : c` in `prefer-logical-over-boolean-ternary`,
  and a `(b as boolean | number)` operand in `jsx-boolean-logical-operands`;
- `!((v as number) < 1)` on a `ValidNumber` in `no-negated-comparison`, which
  now offers the inversion as a suggestion;
- a strict check on `(x as B | null | undefined)` in
  `prefer-optional-chain-over-ternary`;
- `(a as string | undefined) || 'x'` on an `'a' | undefined` in
  `prefer-nullish-coalescing-when-safe`, and `(x as T | null) ?? undefined` in
  `no-unnecessary-coalesce-undefined`;
- `Array.from(xs as Iterable<T>)` in `no-unnecessary-array-from` and
  `prefer-non-mutating-array-method`;
- a callee widened to take more arguments in `prefer-curried-call`;
- a property a cast leaves out (`props as Pick<Props, 'a'>`) in
  `check-destructuring-completeness`.
