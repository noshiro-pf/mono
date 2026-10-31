---
'ts-data-forge': patch
---

`Json.stringifySortedKey` no longer drops properties it failed to collect. It sorted by passing every key it found as `JSON.stringify`'s allowlist, but its search skipped objects nested in an array of arrays and the objects `toJSON` returns, so `{ a: [[{ b: 1 }]] }` came out as `{"a":[[{}]]}` and `{ x: { toJSON: () => ({ y: 1 }) } }` as `{"x":{}}`, still as `Result.ok`. The keys are now collected while `JSON.stringify` walks the value, so every level is seen. A circular value now gives `Result.err` instead of throwing a `RangeError` from the search.
