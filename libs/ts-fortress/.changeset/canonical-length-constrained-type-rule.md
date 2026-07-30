---
'eslint-plugin-ts-fortress': minor
---

**`prefer-non-empty-array` is replaced by
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
