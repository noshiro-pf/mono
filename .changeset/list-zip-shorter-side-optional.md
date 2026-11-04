---
'ts-type-forge': patch
'ts-data-forge': patch
---

`List.Zip` no longer claims pairs that the shorter input cannot supply. When
only one side's length is known, it used to keep that side's whole length:
`List.Zip<[1, 2], readonly string[]>` was `readonly [[1, string], [2, string]]`,
although zipping stops at the shorter input and the array may be empty. A pair
is now required only while both inputs have a leading required element, and
optional where only one does:

```ts
type A = List.Zip<[1, 2], readonly string[]>;
// before: readonly [readonly [1, string], readonly [2, string]]
// after:  readonly [(readonly [1, string])?, (readonly [2, string])?]

type B = List.Zip<[1, 2], readonly [string, ...string[]]>;
// before: readonly [readonly [1, string], readonly [2, string]]
// after:  readonly [readonly [1, string], (readonly [2, string])?]
```

The same applies past the fixed prefix of a minimum-length tuple:
`List.Zip<readonly [string, ...string[]], readonly [number, number, number]>`
now makes its second and third pairs optional.

`Arr.zip` in ts-data-forge returns `ConstrainedList.Zip`, which uses `List.Zip`
for inputs without a length-constraint brand, so it is typed this way too:

```ts
const ys: readonly number[] = [];
const z = Arr.zip([1] as const, ys);
// before: readonly [readonly [1, number]], so z[0][1] type-checked and threw
// after:  readonly [(readonly [1, number])?], so z[0] needs a check first
```

Code that indexed such a result without a check now gets a compile error where
it used to fail at run time. Zipping two tuples of fixed length, two plain
arrays, or arrays with a length-constraint brand is unchanged.

Only leading required elements are counted. A tuple with optional elements, or
with elements after a rest, is treated as possibly empty from that point on, so
`List.Zip<[1, 2], readonly [string, ...string[], number]>` now makes its second
pair optional, although that input always has at least two elements, and
`List.Zip<[1, 2?], readonly string[]>` ends in an unsized rest, although its
first input has at most two elements. The result is less precise than it could
be, but it never claims a pair that may be missing.
