# ts-std-forge

Safe wrappers for standard library APIs that throw or return `null` / sentinel
values, returning [`Result` / `Optional`](https://github.com/noshiro-pf/mono/tree/main/libs/ts-data-forge)
instead. The dependency is strictly one-way: `ts-std-forge` → `ts-data-forge`.

The catalog of APIs to wrap, and the reasoning, live in the Sumi language
project: [languages/sumi/docs/throwing-stdlib-survey.md](../../languages/sumi/docs/throwing-stdlib-survey.md)
(decisions D-22 / D-24 / D-26).

## Error design (D-26)

Failures are removed at compile time where the argument domain allows it, and
classified by up-front validation where it does not — never by parsing engine
error messages, whose wording ECMAScript leaves unspecified.

- **Type-refined, total**: when the throwing condition is a finite argument
  range, the parameter is typed as that literal range (the same refinement
  the strict TS lib applies — `UintRangeInclusive<0, 100>` for `toFixed`, etc.) and
  the function returns its value directly, with no `Result` and no runtime
  check. The type is the contract: a caller holding a plain `number` narrows
  it first (truncating explicitly with `Math.trunc` if it may be
  fractional); one that defeats the type system gets the raw throw.
  Refinement stops at literal ranges: **branded number types (`SafeUint`
  etc.) are deliberately not used** — demanding a brand cast at ordinary
  call sites would be a detour for callers, and busywork a native integer
  type (Sumi v2) would later obsolete.
- **Validate-first, tagged**: when the domain is not expressible as a
  literal range (`fromCodePoint`'s 0–0x10FFFF, `repeat`'s count, `Date`
  validity), the parameter stays a plain `number` / `Date` and the wrapper
  checks the spec-defined condition before calling, reporting it as a plain
  tagged error (`{ kind: 'invalid-code-point', codePoint, index }`).
- **Conservative fallback**: only spec-mandated, known error conditions get
  a specific `kind`; everything else the engine throws — including
  implementation-defined limits such as `repeat`'s maximum string length —
  is caught by a `Result.fromThrowable` backstop and surfaces as
  `{ kind: 'unexpected', cause: Error }`.

## Constructor calls without `new` (D-15 / D-41)

Sumi forbids calling the built-in constructors as plain functions
(`Number(x)`, `String(x)`, `Boolean(x)`, …): they are implicit conversions
whose intent is not in the name and whose failure is a sentinel. The
replacements that are stdlib wrappers live here — `SafeNumber.parse` /
`SafeNumber.parseInteger` for `Number(str)` / `Number.parseInt(str, 10)`, `SafeString.fromPrimitive` for `String(x)`, `Regex.create` for
`RegExp(p, f)`. The rest need no new API: `Error('msg')` / `Date()` become
their `new` forms, `Array(n)` a literal or ts-data-forge's `Arr.newArray` /
`Arr.seq`, and `Boolean(x)` an explicit comparison (there is deliberately no
truthiness helper). `Symbol()` and `BigInt()` are not affected — they have
no `new` form.

## Current API

- `panic(message, { cause? })` / `unreachable(value: never, message?)` / `todo(message?)` — the panic path (Sumi D-48): a programming error stops the program by throwing ts-data-forge's `PanicError`, which the `Result` / `AsyncResult` boundary functions rethrow rather than turn into `Err`. All three return `never` and are declared with explicit types so that a call terminates control flow.
- `Regex.create(pattern, flags?)` — `new RegExp` without throwing. Pattern validity is the engine's own grammar check (not pre-validatable); a caught `SyntaxError` becomes `'invalid-regexp'` with the error as `cause`, anything else `'unexpected'`.
- `SafeDate.toISOString(date)` — `Date.prototype.toISOString` without throwing (Invalid Date → `Err<{ kind: 'invalid-date' }>`).
- `SafeNumber.parse(value)` — the alternative to `Number(str)`: the same implementation as ts-data-forge's `Num.safeParseFloat` (a copy, not a dependency), returning `Ok<number>` (finite) or `Err<{ kind: 'invalid-number', input }>` for blank input, trailing garbage, `NaN` and `±Infinity`.
- `SafeNumber.parseInteger(value)` — the alternative to `Number.parseInt(str, 10)`: the same implementation as `Num.safeParseInt` plus a finiteness check, returning `Ok<number>` (an integer, truncated toward zero) or `Err<{ kind: 'invalid-integer', input }>`. Named `parseInteger` because a declaration named `parseInt` would shadow the global.
- `SafeNumber.toFixed(value, fractionDigits)` — `fractionDigits: UintRangeInclusive<0, 100>`; total, returns `string`.
- `SafeNumber.toExponential(value, fractionDigits?)` — `fractionDigits?: UintRangeInclusive<0, 100>`; total, returns `string`.
- `SafeNumber.toPrecision(value, precision)` — `precision: UintRangeInclusive<1, 100>`; total, returns `string`.
- `SafeNumber.toStringWithRadix(value, radix)` — `radix: UintRangeInclusive<2, 36>`; total, returns `string`.
- `SafeString.fromCodePoint(...codePoints)` — `String.fromCodePoint` without throwing (`Err<{ kind: 'invalid-code-point', codePoint, index }>`).
- `SafeString.fromPrimitive(value)` — the alternative to `String(x)` for `string | number | boolean | bigint | symbol | undefined` (the last three cannot go in a template literal); total, returns `string`.
- `SafeString.normalize(value, form?)` — `form` is typed as the `'NFC' | 'NFD' | 'NFKC' | 'NFKD'` union; total, returns `string`.
- `SafeString.repeat(value, count)` — `String.prototype.repeat` without throwing (`Err<{ kind: 'invalid-count' }>`; an engine length-limit overflow surfaces as `'unexpected'`).

Neither returns a branded number (`FiniteNumber` / `Int`): ts-std-forge
does not use ts-type-forge's number brands, and an ESLint rule in this
package allows only the literal-range types to be imported from it.

Functions that can still fail export their failure type alongside
(`SafeString.FromCodePointError`, `Regex.CreateError`, …), and the shared
fallback type is `UnexpectedError`.

Module and package names are provisional.
