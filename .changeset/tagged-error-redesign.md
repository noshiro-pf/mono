---
'ts-std-forge': minor
---

Redesign wrapper failure handling (BREAKING): compile-time refinement where possible, validate-first tagged unions elsewhere.

- `SafeNumber.toFixed` / `toExponential` / `toPrecision` / `toStringWithRadix` type their digit / precision / radix parameters as the exact literal ranges the spec allows (`UintRangeInclusive<0, 100>` etc., the same refinement the strict TS lib applies), become total, and return `string` directly instead of a `Result`.
- `SafeString.repeat` and `SafeString.fromCodePoint` keep plain `number` parameters (branded number types are deliberately not used) and validate the spec-defined condition up front, returning plain tagged errors (`{ kind: 'invalid-count', count }` / `{ kind: 'invalid-code-point', codePoint, index }`); the engine's implementation-defined string-length limit surfaces as the shared `UnexpectedError` fallback `{ kind: 'unexpected', cause }`.
- `SafeDate.toISOString` likewise validates up front and returns `Err<{ kind: 'invalid-date' }>` — never classifying by engine-specific messages.
- `Regex.create` classifies conservatively: only a caught `SyntaxError` (the spec-mandated type for parse failures) becomes `'invalid-regexp'` (with the error as `cause`); any other throw falls back to `'unexpected'`.
- `SafeString.normalize` no longer returns a `Result`: its `form` union type excludes the only failure mode, so it is total and returns `string` directly.
- `ts-type-forge` is now a runtime (type) dependency.
