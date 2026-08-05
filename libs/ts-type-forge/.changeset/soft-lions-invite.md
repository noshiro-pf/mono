---
'eslint-plugin-ts-type-forge': minor
---

`prefer-canonical-length-constrained-tuple` now adds the import its rewrite
needs by default: `importStyle` defaults to `'named'`, so an autofix that
introduces `FixedLengthTuple` also inserts
`import { type FixedLengthTuple } from 'ts-type-forge';` when the name is not
in scope yet. This matches how eslint-plugin-ts-data-forge's rules behave, and
the inserted specifier is a `type` import, so it erases at compile time.

Set `importStyle: 'global'` to restore the previous behavior in a project that
loads the ambient globals of `ts-type-forge/global`.
