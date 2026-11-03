---
'eslint-rule-forge': patch
'eslint-plugin-ts-std-forge': patch
'eslint-plugin-ts-data-forge': patch
---

`prefer-is-record-and-has-key` no longer auto-fixes `key in obj` unless `obj` is typed as a plain record: `Record<string, …>`, or an object type literal or object literal with a string index signature, none of whose properties a class or an interface declares. On a class, an interface, a type parameter, a mapped type over a class (`Readonly<Bag>`) or anything else, always without type information, and for a literal key naming a member of `Object.prototype` (`'constructor' in rec`), it reports `inReadsPrototypeChain` and offers the rewrite as a suggestion. `hasKey` checks own properties where `in` walks the prototype chain, and `isRecord` rejects functions, so the fix turned `'then' in promise`, `'size' in map`, a class method check and `'name' in fn` from `true` to `false`. The fix on a plain record still turns a key read at run time that names an `Object.prototype` member from `true` to `false`.
