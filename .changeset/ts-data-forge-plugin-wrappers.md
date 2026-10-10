---
'eslint-plugin-ts-data-forge': patch
---

Read through type wrappers, and keep the parentheses a fix needs. A
`satisfies`, `as`, `!` or `<T>` no longer hides a pattern or vouches for a
type the value does not have, and a fix no longer drops parentheses the
source wrote around an operand (a node's text never includes them).

Syntax is read through a wrapper, since a wrapper changes no value:
`xs.length > (0 as number)` compares with `0`. A conclusion drawn from a type
has to hold at every layer of wrappers, so an assertion only ever makes a
rule more cautious. A widening `as` is the author's word and is respected
(`isNull(x as string | null)` on a `string` is not folded to `false`); a
narrowing one (`x!`, `v as string` on an `unknown`) cannot vouch for the
value, whose own type still decides.

- `prefer-arr-scan`: a `?? fallback` is removed only when the seed and the
  appended value cannot be nullish under their wrappers either, so
  `[init!]` keeps it. An object literal or sequence element is written as
  `=> ({ … })` rather than a block body. A wrapped accumulator in
  `[...(acc as T[]), x]` or `Arr.toPushed(acc!, x)`, and a wrapped sliced
  array, are recognized.
- `prefer-canonical-array-slicing`: a receiver, spread or `concat` argument
  must be an array (or not one) at every layer of wrappers, so
  `xs.concat(v as number)` with `v: number | readonly number[]` and
  `[...(set as unknown as T[]), x]` are left alone. Counts and the filter
  index may be wrapped (`xs.slice(1 as number)`).
- `prefer-canonical-length-cast`: removing a length argument takes its
  parentheses with it and leaves those around the next one, instead of
  producing unbalanced output from `Arr.asMinLengthArray(1, (xs))`. A bound
  may be wrapped (`1 as const`).
- `no-unnecessary-type-guard`: a verdict (always true, always false, or a
  narrower guard) is reported only when it holds for the argument's type at
  every layer. `isNullish(x as string | undefined)` on a value that may be
  `null` is no longer rewritten to `isUndefined`, and `isNull(x as string | null)`
  on a `string` is left alone.
- `prefer-comparison-over-nullish-guard`: a call under `as`, `satisfies` or
  `<T>` is written `(x === null) satisfies boolean`, and a `|`, `^`, `&`,
  equality, `as` or `satisfies` argument is parenthesized on the left of the
  comparison. A guard reached through a wrapper (`(isNull as F)(x)`,
  `(tf as typeof tf).isNull(x)`) is recognized, here and in
  `no-unnecessary-type-guard`.
- `prefer-num-safe-parse-float`, `prefer-num-safe-parse-int`: the argument
  must be a string under its wrapper too, so `Number(v as string)` with an
  `unknown` `v` is left alone. A sequence argument keeps its parentheses. A
  wrapped radix `10 as const` is recognized.
- `prefer-arr-is-array`: `(Array.isArray)(u)` is rewritten to
  `(Arr.isArray)(u)` instead of unbalanced output, and
  `(Array as ArrayConstructor).isArray(u)` is recognized.
- `prefer-canonical-length-guard` and the length-comparison rules it folds
  in: the length, the bound and a guard's bound are read through wrappers
  (`(xs.length satisfies number) > 0`, a bound `0 as const`), the two halves
  of a bounded pair are compared through wrappers, and a sequence array
  keeps its parentheses. `xs[length] > 0`, which reads an
  index, is no longer rewritten to `Arr.isNonEmpty(xs)`.
- `prefer-as-int`: `<Int>n` is reported like `n as Int`, and a sequence
  operand keeps its parentheses.
- `prefer-is-non-null-object`: either check may wrap the value
  (`u! !== null`, `typeof (u satisfies unknown) === 'object'`).
- `prefer-range-for-loop`: the tested variable and a literal step may be
  wrapped, so `i += 0 as number` is no longer rewritten to a zero-step
  `range`. Sequence bounds and steps keep their parentheses.
- `prefer-arr-sum`: the initial value and the operands may be wrapped, the
  element type must be numeric under a cast of the array too, a computed
  `xs[reduce](…)` is left alone, and a sequence array keeps its parentheses.
- `prefer-arr-uniq`: `new Set(xs)` may be wrapped, and a result mutated
  through `!` or `satisfies` is only suggested, not fixed.
- `prefer-is-record-and-has-key`: `isRecord` is dropped only when the object
  is a record at every layer of wrappers, so an array cast to
  `Record<string, unknown>` keeps it.
