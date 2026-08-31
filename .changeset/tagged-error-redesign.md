---
'ts-std-forge': minor
---

Redesign wrapper failure handling (BREAKING): compile-time refinement where possible, validate-first tagged unions elsewhere.

- `SafeNumber.toFixed` / `toExponential` / `toPrecision` / `toStringWithRadix` type their digit / precision / radix parameters as the exact literal ranges the spec allows (`UintRangeInclusive<0, 100>` etc., the same refinement the strict TS lib applies), become total, and return `string` directly instead of a `Result`.
- `SafeString.repeat` types `count` as `SafeUint | SmallUint` (literals up to 39 need no cast); the only remaining failure — the engine's implementation-defined string-length limit — surfaces as the shared `UnexpectedError` fallback `{ kind: 'unexpected', cause }`.
- `SafeString.fromCodePoint` and `SafeDate.toISOString`, whose domains a type cannot express, validate the spec-defined condition up front and return plain tagged errors (`{ kind: 'invalid-code-point', codePoint, index }` / `{ kind: 'invalid-date' }`) — never classifying by engine-specific messages.
- `Regex.create` classifies conservatively: only a caught `SyntaxError` (the spec-mandated type for parse failures) becomes `'invalid-regexp'` (with the error as `cause`); any other throw falls back to `'unexpected'`.
- `SafeString.normalize` no longer returns a `Result`: its `form` union type excludes the only failure mode, so it is total and returns `string` directly.
- `ts-type-forge` is now a runtime (type) dependency.
