---
'ts-type-forge': major
---

Add **`IntRange<Start, End>`** and **`IntRangeInclusive<MinValue, MaxValue>`**
to `type-level-integer/`, the signed counterparts of `UintRange` and
`UintRangeInclusive`: unions of integer literals that also accept negative
bounds.

```ts
type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
type R4 = IntRange<3, -3>; // never

type RI1 = IntRangeInclusive<1, 5>; // 1 | 2 | 3 | 4 | 5
type RI2 = IntRangeInclusive<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2 | 3
type RI3 = IntRangeInclusive<-5, -1>; // -5 | -4 | -3 | -2 | -1
type RI4 = IntRangeInclusive<3, -3>; // never
```

`IntRange` is ported from `ts-fortress`, which now re-exports it from here
instead of declaring its own copy.

Also add **`Uint11`** (`0` to `2047`) and **`Int11`** (`-1024` to `1023`) to
`constants/`, extending the existing `Uint8` / `Uint9` / `Uint10` and `Int8` /
`Int9` / `Int10` family.

**BREAKING CHANGE**: the whole integer-range family now constrains its bounds,
matching how `Max` / `Min` already constrain theirs to `Uint10`:

- `UintRange<Start, End>`: `extends number` / `extends number` →
  `extends Uint11` / `extends Uint11 | 2048`
- `UintRangeInclusive<MinValue, MaxValue>`: `extends number` /
  `extends number` → `extends Uint11` / `extends Uint11`
- `IntRange<Start, End>` (new): `extends Int11` / `extends Int11 | 1024`
- `IntRangeInclusive<MinValue, MaxValue>` (new): `extends Int11` /
  `extends Int11`

The exclusive-end variants accept one value above the cap (`2048` / `1024`) so
that the full `Uint11` / `Int11` union stays expressible. A bound the union
cannot represent — a non-integer, a negative `Uint*` bound, a non-literal
`number`, or anything past the cap — is now a constraint error instead of
silently resolving to `never`.

Every range that already fit those bounds is unaffected. For a `0`-based range
beyond the `Uint11` cap, use `IndexInclusive<N>` directly:
`UintRangeInclusive<0, N>` and `IndexInclusive<N>` are the same type. The
library's own `SupportedLength` (`0 | ... | 2048`, whose inclusive `2048` is one
past `Uint11`) is now spelled that way.
