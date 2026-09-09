# ts-std-forge

Safe wrappers for standard library APIs that throw or return `null` / sentinel
values, returning `Result` / `Optional` instead — and, since the D-49 port
below, those algebraic data types themselves.

**The dependency between this package and ts-data-forge now runs the other
way.** It used to be `ts-std-forge` → `ts-data-forge`; Sumi decision D-49
reverses it. The ADT core — `Result`, `Optional`, `TernaryResult`,
`AsyncResult`, `pipe`, `match` — and the helpers it needs are implemented
here, and ts-data-forge re-exports them, so `import { Result } from
'ts-data-forge'` keeps working and denotes the same declarations. There is one
implementation, not two. New code should import these from `ts-std-forge`.

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
`RegExp(p, f)`, `SafeArray.create` for `Array(n)`. The rest need no new API:
`Error('msg')` / `Date()` become their `new` forms, and `Boolean(x)` an
explicit comparison (there is deliberately no truthiness helper). `Symbol()`
and `BigInt()` are not affected — they have no `new` form.

## Current API

- `panic(message, { cause? })` / `panic(error)` / `unreachable(value: never, message?)` / `todo(message?)` — the panic path (Sumi D-48 / D-53). Given an error, `panic` marks that very object and throws it, so its `name`, tag, payload and stack survive: a programming error stops the program by throwing a `PanicError`, which the `Result` / `AsyncResult` boundary functions rethrow rather than turn into `Err`. All three return `never` and are declared with explicit types so that a call terminates control flow.
- `Regex.create(pattern, flags?)` — `new RegExp` without throwing. Pattern validity is the engine's own grammar check (not pre-validatable); a caught `SyntaxError` becomes `'invalid-regexp'` with the error as `cause`, anything else `'unexpected'`.
- `SafeDate.toISOString(date)` — `Date.prototype.toISOString` without throwing (Invalid Date → `Err<{ kind: 'invalid-date' }>`).
- `Result` / `Optional` / `TernaryResult` / `AsyncResult` / `pipe` / `match` — the ADT core, ported from ts-data-forge (D-49). Same API, same runtime tags; there is one implementation, and ts-data-forge re-exports it.
- `PanicError` / `isPanicError` / `createPanicError` / `markAsPanic` — grouped with `panic`, which is now the single place this package stops the program from (the `unwrapThrow` / `expectToBe` families call it rather than throwing directly). `unknownToString`, `hasKey` / `isRecord` / `keyIsIn` / `isNonNullObject`, `expectType` — the helpers the ADT core needs, ported with it. `expectType`\'s permanent home is still open (D-49 (b)).
- `SafeNumber.parse(value)` — the alternative to `Number(str)`: the single implementation of the conversion (ts-data-forge's `Num.safeParseFloat` delegates here since D-49 (c)), returning `Ok<number>` (finite) or `Err<{ kind: 'invalid-number', input }>` for blank input, trailing garbage, `NaN` and `±Infinity`.
- `SafeNumber.parseInteger(value)` — the alternative to `Number.parseInt(str, 10)`: likewise the single implementation, with the finiteness check the old `Num.safeParseInt` lacked, returning `Ok<number>` (an integer, truncated toward zero) or `Err<{ kind: 'invalid-integer', input }>`. Named `parseInteger` because a declaration named `parseInt` would shadow the global.
- `SafeNumber.toFixed(value, fractionDigits)` — `fractionDigits: UintRangeInclusive<0, 100>`; total, returns `string`.
- `SafeNumber.toExponential(value, fractionDigits?)` — `fractionDigits?: UintRangeInclusive<0, 100>`; total, returns `string`.
- `SafeNumber.toPrecision(value, precision)` — `precision: UintRangeInclusive<1, 100>`; total, returns `string`.
- `SafeNumber.toStringWithRadix(value, radix)` — `radix: UintRangeInclusive<2, 36>`; total, returns `string`.
- `SafeString.fromCodePoint(...codePoints)` — `String.fromCodePoint` without throwing (`Err<{ kind: 'invalid-code-point', codePoint, index }>`).
- `SafeString.fromPrimitive(value)` — the alternative to `String(x)` for `string | number | boolean | bigint | symbol | undefined` (the last three cannot go in a template literal); total, returns `string`.
- `SafeString.normalize(value, form?)` — `form` is typed as the `'NFC' | 'NFD' | 'NFKC' | 'NFKD'` union; total, returns `string`.
- `SafeString.repeat(value, count)` — `String.prototype.repeat` without throwing (`Err<{ kind: 'invalid-count' }>`; an engine length-limit overflow surfaces as `'unexpected'`).
- `SafeArray.create(length, init)` — the alternative to `Array(n)`, returning `Err<{ kind: 'invalid-length', length }>` for the lengths `Array(n)` throws on. Writing it as `Array.from({ length })` instead does not throw — `ToLength` clamps `-1` to `0` and truncates `1.5` — so the failure this replaces is a silently wrong array rather than an exception.
- `SafeArray.isArray(value)` / `SafeArray.isEmpty(array)` / `SafeArray.isNonEmpty(array)` — the array guards, copied from ts-data-forge's `Arr` (`isArray`, `isEmptyTuple`, `isNonEmptyTuple`) so that this package and its ESLint plugin no longer have to point across at `Arr` for them. `isArray` keeps the array members of a union where `Array.isArray` widens to `any[]`; the other two narrow to `readonly []` / `MinLengthTuple<1, E>`, which is what makes the non-empty branch index without an assertion under `noUncheckedIndexedAccess`. The `*Tuple` suffix is dropped because there is no branded family here to tell them apart from.

Every wrapper module is reachable **only** through its namespace —
`SafeString.repeat(s, 3)`, never a bare `repeat`. The barrels stopped
re-exporting their `impl/` contents at the package's top level in the same
release that added `SafeArray`: generic names (`create`, `parse`, `repeat`,
`normalize`) are not what a top level is for, and they collide across modules
— `Regex.create` and `SafeArray.create` are both `create`, which `export *`
reports as TS2308 rather than resolving. The guards, the ADT core and `panic`
keep their bare names; they have no namespace to sit under.

Neither returns a branded number (`FiniteNumber` / `Int`): ts-std-forge
does not use ts-type-forge's number brands, and an ESLint rule in this
package allows only the literal-range types to be imported from it.

Functions that can still fail export their failure type alongside, under the
same namespace (`SafeString.FromCodePointError`, `Regex.CreateError`, …), and
the shared fallback type is `UnexpectedError`.

Module and package names are provisional.
