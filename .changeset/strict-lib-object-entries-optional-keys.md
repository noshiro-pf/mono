---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

`Object.entries` on a record with optional keys returns entries that can be
destructured again: `for (const [key, value] of Object.entries(record))` no
longer fails with TS2488 when `record` is, say,
`Readonly<{ a?: number; b?: string }>`.

The mapped type behind the record overload kept each optional key optional, so
indexing it added `undefined` to the entry itself, not only to its value. The
value of an optional key is still `number | undefined`; the entry is
`readonly ['a', number | undefined]` rather than that or `undefined`.
