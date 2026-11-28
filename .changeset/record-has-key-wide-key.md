---
'eslint-rule-forge': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-std-forge': patch
---

`prefer-is-record-and-has-key` suggests, rather than fixes, where the fix would
change what the code compiles to or answers: a key wider than a union of
literals (`hasKey` narrows the record to `never` where it answers `false`), a
key whose type, not only its spelling, names an `Object.prototype` member, and a
type alias with a method, getter or setter signature, which a class may
implement.
