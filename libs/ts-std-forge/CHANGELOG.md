# ts-std-forge

## 0.5.1

### Patch Changes

- 6e23aed: Back every JSDoc `@example` with a type-checked sample file

    The `@example` blocks under `src/` are filled from real `.mts` files under
    `samples/`, which the package type-checks and — where the package runs its
    samples — executes as Vitest cases. Forty-four source files still carried
    `@example` blocks written by hand, so what they showed was compiled by
    nothing: the snippets are now sample files, and the ones that cannot be
    reached from `samples/` — a module-local helper, or a block that is not
    TypeScript at all — say what they do in prose instead.

    Documentation only; no runtime or type change. A few examples read slightly
    differently for it, because an illustration with nothing to assert became one
    with an assertion.

## 0.5.0

### Minor Changes

- 9c21467: Move the algebraic data type core from ts-data-forge to ts-std-forge and reverse the dependency between the two packages (Sumi D-49).

    `Result`, `Optional`, `TernaryResult`, `AsyncResult`, `pipe` and `match` are now implemented in ts-std-forge, together with the helpers they need: the four variant types (`Ok`, `Err`, `Some`, `None`), `PanicError` and its constructor and guard, `unknownToString`, `hasKey` / `isRecord` / `keyIsIn` / `isNonNullObject`, and `expectType`. ts-data-forge re-exports every one of them and now depends on ts-std-forge, which no longer depends on ts-data-forge at all.

    **Nothing is removed from either package, and the move itself changes no behavior.** The re-exports denote the same declarations, so `import { Result } from 'ts-data-forge'` and `import { Result } from 'ts-std-forge'` are interchangeable, values built through either are the same type, and the runtime tags are unchanged. New code should prefer `ts-std-forge`. Two behavior changes do arrive with the port, both described below: the boundary functions now rethrow a `PanicError`, and `Num.safeParseInt` rejects a value that overflows to `Infinity`.

    The panic path arrives with it. `panic`, `unreachable` and `todo` live in ts-std-forge; `PanicError`, `isPanicError` and `createPanicError` are exported from both. `Result.fromThrowable`, `Result.fromPromise`, `AsyncResult.fromThrowable` and `AsyncResult.fromPromise` now rethrow a `PanicError` instead of converting it to `Err`, and the `unwrapThrow` / `unwrapErrThrow` / `expectToBe` / `safeUnwrap` families throw one (still an `Error` with the same message), so a programming error cannot masquerade as a recoverable failure.

    `Num.safeParseFloat` and `Num.safeParseInt` are now implemented by delegating to `SafeNumber.parse` and `SafeNumber.parseInteger`, keeping their own contract on top: the `FiniteNumber` / `Int` brand on the success side and an `Error` on the failure side. **`Num.safeParseInt` rejects a value that overflows to `Infinity`, where it used to accept one.** `Number('1e400')` is `Infinity` while `parseInt('1e400', 10)` is `1`, so the old agreement check let it through and returned `Ok(Infinity)` branded as `Int` — a value the brand promised could not exist. `SafeNumber.parseInteger` already checked finiteness, and delegating closes the hole.

    The samples and JSDoc examples that document the ADT core moved with the implementation.

- 9c21467: Reach the wrapper modules through their namespace only (BREAKING).

    `Regex`, `SafeDate`, `SafeNumber`, `SafeString` and the new `SafeArray` no
    longer re-export their contents at the package's top level, so the bare
    `create`, `toISOString`, `parse`, `parseInteger`, `toExponential`, `toFixed`,
    `toPrecision`, `toStringWithRadix`, `fromCodePoint`, `fromPrimitive`,
    `normalize` and `repeat` — and the failure types beside them (`CreateError`,
    `ParseError`, `RepeatError`, …) — are gone. Import the namespace instead:

    ```ts
    // before
    import { repeat } from 'ts-std-forge';
    // after
    import { SafeString } from 'ts-std-forge';
    SafeString.repeat('ab', 3);
    ```

    `SafeString.repeat(s, 3)` was already the documented spelling and the only one
    used in this repository; the bare names were a by-product of the barrels being
    generated. They also collide: `Regex.create` and `SafeArray.create` are both
    `create`, which `export *` reports as TS2308 rather than resolving — the
    reason `SafeArray` shipped namespace-only, now applied to all five.

    The guards (`isRecord`, `hasKey`, …), the ADT core (`Result`, `Optional`,
    `pipe`, `match`, …), `panic` and `unknownToString` are unaffected: they have no
    namespace to sit under and keep their bare names.

- 9c21467: Add `SafeArray`: `create`, `isArray`, `isEmpty`, `isNonEmpty`.

    `SafeArray.create(length, init)` is the D-15 / D-41 alternative to `Array(n)`,
    which the mapping used to send to ts-data-forge's `Arr.newArray` — the wrong
    direction since the D-49 inversion. It returns `Err<{ kind: 'invalid-length',
length }>` for the lengths `Array(n)` throws on. Writing the same thing as
    `Array.from({ length })` does not throw at all: `ToLength` clamps `-1` to `0`
    and truncates `1.5`, so a computed length silently produces the wrong array,
    which is the sentinel this package replaces.

    The three guards are copies of `Arr.isArray`, `Arr.isEmptyTuple` and
    `Arr.isNonEmptyTuple`. They are here so that this package and its new ESLint
    plugin stop pointing across at `Arr` for them; the `*Tuple` suffix is dropped
    because there is no branded length family here to tell them apart from.

    `SafeArray` is reachable only through the namespace — `Regex` already exports
    `create` and `CreateError`, and `export *` reports the ambiguity rather than
    picking one.

- 9c21467: Add the panic path for a programming error (Sumi D-48 / D-53): `panic`, `unreachable`, `todo`, and the `PanicError` type with `isPanicError`, `createPanicError` and `markAsPanic`.

    `panic(message, { cause? })` throws a fresh `PanicError`. `panic(error)` marks the error the caller already holds and throws that very object, so its `name`, its tag, its payload and above all its stack — which points at where the failure happened rather than at the panic — all survive; that is what makes `throw error` port to `panic(error)` without losing anything. `unreachable(value?: never, message?)` covers exhaustiveness checks, and with no argument the standing invariant — the default of a method every implementation is expected to override, where there is no `never` value to hand and the fact of being called is the whole error. The value stays the first parameter rather than gaining a message-first form, which would swallow the exhaustiveness check over a union of string literals: a forgotten `'b'` case is not assignable to `never` but is assignable to `string`. `todo(message?)` marks an unwritten path. All are declared with explicit `never`-returning types so that a call terminates control flow.

    A panic is marked by a dedicated `$$panic` property rather than by the error's `name`, which is where a class-free error factory puts the error's own identity (`name: 'HttpError'`); marking on `name` would force an existing error to choose between keeping what it is and being recognized as a panic. `isPanicError` matches on the mark, not on the constructor, so an error that crossed a package boundary is recognized just the same — which is what keeps `Result.fromThrowable` and the other boundary functions re-throwing a panic instead of turning it into `Err`.

## 0.4.0

### Minor Changes

- 92ac79c: Add the alternatives to the constructor-as-function calls that Sumi forbids (D-15 / D-41):

    - `SafeNumber.parse(value)` replaces `Number(str)`: the same implementation as ts-data-forge's `Num.safeParseFloat` (a copy, so the two can later be consolidated here), returning `Ok<number>` (finite) or `Err<{ kind: 'invalid-number', input }>` for blank input, trailing garbage, `NaN` and `±Infinity`.
    - `SafeNumber.parseInteger(value)` replaces `Number.parseInt(str, 10)`: the same implementation as `Num.safeParseInt` plus a finiteness check (`'1e400'` is rejected instead of becoming `Infinity`), returning `Ok<number>` (an integer) or `Err<{ kind: 'invalid-integer', input }>`.
    - `SafeString.fromPrimitive(value)` replaces `String(x)` for `string | number | boolean | bigint | symbol | undefined` — the last three cannot go in a template literal. It is total and returns `string`.

## 0.3.1

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.

- Updated dependencies [30de8fa]
    - ts-data-forge@14.6.3

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
