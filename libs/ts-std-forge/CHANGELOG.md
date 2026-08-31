# ts-std-forge

## 0.3.0

### Minor Changes

- dbf9783: Redesign wrapper failure handling (BREAKING): compile-time refinement where possible, validate-first tagged unions elsewhere.

    - `SafeNumber.toFixed` / `toExponential` / `toPrecision` / `toStringWithRadix` type their digit / precision / radix parameters as the exact literal ranges the spec allows (`UintRangeInclusive<0, 100>` etc., the same refinement the strict TS lib applies), become total, and return `string` directly instead of a `Result`.
    - `SafeString.repeat` and `SafeString.fromCodePoint` keep plain `number` parameters (branded number types are deliberately not used) and validate the spec-defined condition up front, returning plain tagged errors (`{ kind: 'invalid-count', count }` / `{ kind: 'invalid-code-point', codePoint, index }`); the engine's implementation-defined string-length limit surfaces as the shared `UnexpectedError` fallback `{ kind: 'unexpected', cause }`.
    - `SafeDate.toISOString` likewise validates up front and returns `Err<{ kind: 'invalid-date' }>` — never classifying by engine-specific messages.
    - `Regex.create` classifies conservatively: only a caught `SyntaxError` (the spec-mandated type for parse failures) becomes `'invalid-regexp'` (with the error as `cause`); any other throw falls back to `'unexpected'`.
    - `SafeString.normalize` no longer returns a `Result`: its `form` union type excludes the only failure mode, so it is total and returns `string` directly.
    - `ts-type-forge` is now a runtime (type) dependency.

### Patch Changes

- Updated dependencies [7fa2b22]
    - ts-data-forge@14.6.1

## 0.2.0

### Minor Changes

- 8954b57: Add `SafeNumber` and `SafeString` wrappers for the remaining Tier 1 throwing stdlib APIs:

    - `SafeNumber.toFixed(value, fractionDigits)` — `Number.prototype.toFixed` without the RangeError throw
    - `SafeNumber.toExponential(value, fractionDigits?)` — `Number.prototype.toExponential` without the RangeError throw
    - `SafeNumber.toPrecision(value, precision)` — `Number.prototype.toPrecision` without the RangeError throw
    - `SafeNumber.toStringWithRadix(value, radix)` — `Number.prototype.toString(radix)` without the RangeError throw
    - `SafeString.fromCodePoint(...codePoints)` — `String.fromCodePoint` without the RangeError throw
    - `SafeString.normalize(value, form?)` — `String.prototype.normalize` with `form` typed as the `'NFC' | 'NFD' | 'NFKC' | 'NFKD'` union
    - `SafeString.repeat(value, count)` — `String.prototype.repeat` without the RangeError throw

    All return `Result<string, Error>` via `Result.fromThrowable`, matching the existing `Regex.create` / `SafeDate.toISOString` shape.

### Patch Changes

- Updated dependencies [d6124a5]
    - ts-data-forge@14.6.0
