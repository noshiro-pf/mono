---
'ts-fortress': major
---

**The array combinators' type parameters now follow their arguments.**

`minLengthArray` and its seven siblings declared `<A, N>` while both the
argument list and the result put the length first:

```ts
// before
export function minLengthArray<A, N extends SupportedLength>(
  minLength: N,
  elementType: Type<A>,
  ...
): Type<MinLengthArray<N, A>>;
```

The declaration was the only part out of step — an explicit type-argument list
read in the opposite order from the call it annotated, and from the
`MinLengthArray<N, A>` it produced. All eight now declare the length first:

| combinator                                  | before          | after           |
| :------------------------------------------ | :-------------- | :-------------- |
| `minLengthArray` / `minLengthTuple`         | `<A, N>`        | `<N, A>`        |
| `maxLengthArray` / `maxLengthTuple`         | `<A, N>`        | `<N, A>`        |
| `fixedLengthArray` / `fixedLengthTuple`     | `<A, N>`        | `<N, A>`        |
| `boundedLengthArray` / `boundedLengthTuple` | `<A, Min, Max>` | `<Min, Max, A>` |

This also lines the repository up with ts-data-forge, whose `Arr.is*` / `Arr.as*`
and `Str.is*` / `Str.as*` families follow the same rule, and with the
ts-type-forge types being produced, which are length-first throughout
(`MinLengthArray<MinLength, Elm>`, `BoundedLengthTuple<Min, Max, Elm>`).

BREAKING CHANGE: only call sites that pass explicit type arguments to these
eight combinators are affected — `t.minLengthArray<string, 3>(3, t.string)`
becomes `t.minLengthArray<3, string>(3, t.string)`. Both parameters are
inferred from the arguments in ordinary use, so a call written without explicit
type arguments needs no change.
