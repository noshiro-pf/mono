---
'ts-std-forge': minor
---

Add `SafeArray`: `create`, `isArray`, `isEmpty`, `isNonEmpty`.

`SafeArray.create(length, init)` is the D-15 / D-41 alternative to `Array(n)`,
which the mapping used to send to ts-data-forge's `Arr.newArray` — the wrong
direction since the D-49 inversion. It returns `Err<{ kind: 'invalid-length',
length }>` for the lengths `Array(n)` throws on. Writing the same thing as
`Array.from({ length })` does not throw at all: `ToLength` clamps `-1` to `0`
and truncates `1.5`, so a computed length silently produces the wrong array,
which is the sentinel this package replaces.

The three guards are copies of `Arr.isArray`, `Arr.isEmptyTuple` and
`Arr.isNonEmptyTuple`. They are here so that this package and its new ESLint
plugin stop pointing across at `Arr` for them; the `*Tuple` suffix is dropped
because there is no branded length family here to tell them apart from.

`SafeArray` is reachable only through the namespace — `Regex` already exports
`create` and `CreateError`, and `export *` reports the ambiguity rather than
picking one.
