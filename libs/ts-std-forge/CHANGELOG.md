# ts-std-forge

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
