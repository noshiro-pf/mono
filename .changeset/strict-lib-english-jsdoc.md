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

The JSDoc that the strict lib adds is in English: the notes on
`Object.fromEntries` and on the internal `KeysOfEntries` type, and the
description of the internal `HasOwnReturnType` type behind `Object.hasOwn`. An
editor shows them on hover. The Japanese they replace stays beside them as line
comments. The `HasOwnReturnType` description now says what the type does: it
keeps the members of the union that have the key, and gives `never` when none
has it. The old one said `Record<K, unknown>`.
