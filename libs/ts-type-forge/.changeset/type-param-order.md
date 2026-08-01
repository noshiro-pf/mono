---
'ts-type-forge': major
---

**`MakeTuple` and `SetAt` now take their length / index first, like the rest of
the library.**

Every other length-parameterized array or tuple type here puts the length
first — `MinLengthArray<MinLength, Elm>`, `BoundedLengthTuple<Min, Max, Elm>`,
`FixedLengthTuple<N, Elm>` — and within `List` / `Tuple` the count-taking
operations do too: `Take<N, T>`, `Skip<N, T>`, `TakeLast<N, T>`,
`SkipLast<N, T>`, `Partition<N, T>`. Two members were out of step:

| type                              | before        | after                             |
| :-------------------------------- | :------------ | :-------------------------------- |
| `MakeTuple<Elm, N>`               | element first | `MakeTuple<N, Elm>`               |
| `List.SetAt<T, I, V>`             | array first   | `List.SetAt<I, V, T>`             |
| `Tuple.SetAt<T, I, V>`            | array first   | `Tuple.SetAt<I, V, T>`            |
| `ConstrainedList.SetAt<Ar, I, V>` | array first   | `ConstrainedList.SetAt<I, V, Ar>` |

`MakeTuple` was the more visible of the two, because the swap showed up in the
library's own source: `FixedLengthTuple<N, Elm> = MakeTuple<Elm, N>`. It now
reads `MakeTuple<N, Elm>`.

`SetAt` was the only count-taking `List` / `Tuple` operation that led with the
array, so `List.SetAt<[1, 2, 3], 1, 'x'>` sat next to `List.Take<2, [1, 2, 3]>`
with the array on the opposite side. It now reads `List.SetAt<1, 'x', [1, 2, 3]>`.

BREAKING CHANGE: `MakeTuple`, `List.SetAt`, `Tuple.SetAt` and
`ConstrainedList.SetAt` reorder their type parameters. Every use site must
swap its arguments — `MakeTuple<string, 3>` becomes `MakeTuple<3, string>`, and
`List.SetAt<T, I, V>` becomes `List.SetAt<I, V, T>`. These are types, so there
is no inference to fall back on: the compiler reports each site.

`List.Head<T, D>` is deliberately unchanged — `D` is a fallback rather than a
count, and it is defaulted, so leading with it would make the common
one-argument form impossible to write.
