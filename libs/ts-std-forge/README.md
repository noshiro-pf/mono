# ts-std-forge

Safe wrappers for standard library APIs that throw or return `null` / sentinel
values, returning [`Result` / `Optional`](https://github.com/noshiro-pf/mono/tree/main/libs/ts-data-forge)
instead. The dependency is strictly one-way: `ts-std-forge` → `ts-data-forge`.

The catalog of APIs to wrap, and the reasoning, live in the Tsubu language
project: [docs/tsubu/throwing-stdlib-survey.md](../../docs/tsubu/throwing-stdlib-survey.md)
(decisions D-22 / D-24).

## Error design

ECMAScript specifies the _conditions_ under which these APIs throw, but not
the error _messages_ — those are engine-specific. So each wrapper validates
the spec-defined condition up front (mirroring the spec's own coercion and
ordering, e.g. ToIntegerOrInfinity truncation and `toExponential`'s
finiteness-before-range check) and reports it as a **plain tagged error**
(`{ kind: 'radix-out-of-range', radix: 37 }`) that callers can branch on —
never by parsing an engine message. Throws the spec leaves to the engine
(e.g. `repeat` exceeding the implementation's string-length limit) are caught
by a `Result.fromThrowable` backstop and surface as
`{ kind: 'unexpected', cause: Error }`.

An API whose only failure mode is excluded by its parameter types
(`SafeString.normalize`) is total and returns its value directly, without
`Result`.

## Current API

- `Regex.create(pattern, flags?)` — `new RegExp` without throwing. Pattern validity is the engine's own grammar check (not pre-validatable), so the failure is the single kind `'invalid-regexp'` with the `SyntaxError` as `cause`.
- `SafeDate.toISOString(date)` — `Date.prototype.toISOString` without throwing (Invalid Date → `Err<{ kind: 'invalid-date' }>`).
- `SafeNumber.toFixed(value, fractionDigits)` — `Number.prototype.toFixed` without throwing (`Err<{ kind: 'fraction-digits-out-of-range' }>`).
- `SafeNumber.toExponential(value, fractionDigits?)` — `Number.prototype.toExponential` without throwing (`Err<{ kind: 'fraction-digits-out-of-range' }>`).
- `SafeNumber.toPrecision(value, precision)` — `Number.prototype.toPrecision` without throwing (`Err<{ kind: 'precision-out-of-range' }>`).
- `SafeNumber.toStringWithRadix(value, radix)` — `Number.prototype.toString(radix)` without throwing (`Err<{ kind: 'radix-out-of-range' }>`).
- `SafeString.fromCodePoint(...codePoints)` — `String.fromCodePoint` without throwing (`Err<{ kind: 'invalid-code-point', codePoint, index }>`).
- `SafeString.normalize(value, form?)` — `String.prototype.normalize`; `form` is typed as the `'NFC' | 'NFD' | 'NFKC' | 'NFKD'` union so the `RangeError` is unrepresentable at compile time and the function returns `string` directly.
- `SafeString.repeat(value, count)` — `String.prototype.repeat` without throwing (`Err<{ kind: 'invalid-count' }>`; an engine length-limit overflow surfaces as `'unexpected'`).

Each function exports its failure type alongside it (`SafeNumber.ToFixedError`,
`Regex.CreateError`, …), and the shared fallback type is `UnexpectedError`.

Module and package names are provisional until the first npm release.
