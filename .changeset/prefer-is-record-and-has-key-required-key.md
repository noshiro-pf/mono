---
'eslint-rule-forge': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`prefer-is-record-and-has-key` only suggests rewriting `key in obj` as
`hasKey(obj, key)`, rather than fixing it, where `in` may narrow `obj` in a way
`hasKey` now does not: by one literal key where `obj`'s type is a union (`in`
keeps only the members that may have the key) or declares the key as required
(`in` rules the type out where it answers `false`), and by a `unique symbol`
key. Taking the fix there could make code after it stop compiling. A key of any
other type, such as a union of keys, and a literal key that one record type
declares as optional or does not declare, are still fixed on a plain record;
under `exactOptionalPropertyTypes`, where `in` also narrows `obj[key]` for an
optional key (it loses its `undefined` where `in` answers `true` and is
`undefined` where `in` answers `false`) and `hasKey` does neither, that fix can
still make code stop compiling.
