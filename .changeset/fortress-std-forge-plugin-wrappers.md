---
'eslint-plugin-ts-fortress': patch
'eslint-plugin-ts-std-forge': patch
---

Read through `as`, `satisfies`, `!` and `<T>`, and keep the parentheses the
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
