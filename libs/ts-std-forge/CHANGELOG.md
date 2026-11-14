# ts-std-forge

## 0.6.0

### Minor Changes

- e9340d0: The type-only properties that tell `Some` from `None` are keyed by `unique symbol`s from the new types-only package `ts-std-forge-keys`, which are declared and never defined, and exported as types only: no code names them by accident: an object literal that writes them out does not type-check as an `Optional`, and a property access does not read a `Some`'s value. (Spreading an existing Optional copies its type, not its runtime value; the type of the spread is not an Optional to trust.) Two copies of ts-std-forge that depend on the same version of `ts-std-forge-keys` declare the same `Optional`; that version moves only when the runtime encoding of an Optional does, so copies that would read each other's Optionals wrongly also declare types that are not assignable to each other.

    A package that compiles declarations names an Optional by its type (`Some<1>`, `Optional<number>`). Where its declaration emit would have to spell an Optional's properties out (the spread of an Optional, or a mapped type over one that TypeScript expands), it fails with TS4023, since the keys cannot be named from that package; annotate the declaration's type.

- a6d03ea: ts-std-forge is still at 0.x, so this minor release carries the breaking changes listed in the entry for the unwrapped `Optional`; read them all before updating.
- a6d03ea: `Optional` no longer wraps its value in an object. A `Some` is the value itself at runtime and `None` is one reserved string, so an `Optional` held in an array, a map or state costs no allocation: against the previous release, storing a million `Optional.some` values took 1/7 to 1/3 of the memory and reading them back ran about 5 times faster in a benchmark, and short `map` / `unwrapOr` pipelines ran 20–30% faster.

    Breaking changes:

    - `Some` and `None` no longer have `$$tag` or `value` properties. Read the value with `Optional.unwrap` (or `unwrapOr`, `unwrapThrow`, `expectToBe`, `match`) instead of `.value`: `Optional.isSome(o) ? o.value : d` becomes `Optional.isSome(o) ? Optional.unwrap(o) : d`. The `Some` / `None` types still tell the two apart at compile time, through type-only properties that do not exist at runtime.
    - `Optional.isOptional` is removed. A `Some` is its value, so any value other than the `None` string is a valid `Some` at runtime and no check can tell an `Optional` from a value that is not one. Likewise `Optional.isSome` tells a `Some` from `None` in a value typed as an `Optional`; it does not validate untrusted input.
    - `pipe(x).mapOptional` exists at runtime for every value; the type still offers it only when `x` is an `Optional`.
    - `AsyncData.isAsyncData` checks that a pending or failed value has a `previous` key, without checking what it holds (a `Some` of `undefined` is `undefined`).
    - `AsyncData.pending` and `AsyncData.err` tell an omitted `previous` from one passed by the number of arguments rather than by a default parameter, so `AsyncData.pending(Optional.some(undefined))` keeps its `Some`. Passing `undefined` for `previous` no longer type-checks: omit it, or pass `Optional.none`.
    - `Optional.unwrapOr` returns the value of a `Some` holding `null` or `undefined`; it used to return the default.
    - An `Optional` made by an earlier version (`{ $$tag, value }`) is not one to this version: values do not mix across the change, and a type error says so where TypeScript sees both.

    Nested `Optional`s keep working: `Optional.some(Optional.none)` is a `Some` holding `None`, and `Optional.unwrap(Optional.some(x))` is `x` whatever `x` is. A `Some` of a value that is not a reserved string is that value, so `Optional.some(Optional.some(5))` and `Optional.some(5)` are the same runtime value, while reserved strings (those that start with `"ts-std-forge::Optional/"`) are rewritten and keep each level of nesting apart; a string equal to an `Optional`'s runtime value is held as that `Optional` (`Optional.some("ts-std-forge::Optional/n0")` is `Optional.some(Optional.none)`). Falsy and nullish values are held as themselves: `Optional.some(0)` is `0` and `Optional.some(undefined)` is `undefined` at runtime, unlike before, when an `Optional` was always a truthy object. So do not test an `Optional` with truthiness, `??`, `?.` or a default parameter, which take such a `Some` for a missing value; test it with `Optional.isSome` / `isNone`, never with `typeof` either: a `Some` of a string is a string. For the same reason an API that branches on the kind of value it is given acts on the value a `Some` holds (`await` resolves a `Some` of a thenable, React's `useState` calls a `Some` of a function, `concat` spreads a `Some` of an array), and as a `WeakMap` key a `Some` is its value: `None` and a `Some` of a primitive throw (a non-registered symbol aside), and a `Some` of an object is the same key as that object. An `Optional` still survives `structuredClone`, `postMessage` and a JSON round trip, the last as far as JSON keeps the value it holds (a `Some` of `Infinity` comes back as `null`, as `Infinity` alone does, and a `Some` of `undefined` is dropped from an object, as `undefined` is). Two copies of the package agree on the representation, so values pass between them.

    In synstate, `getSnapshot()` and `initialValue` are `Optional`s, so the same change applies to them. Anything that compares values with `Object.is` now sees `Optional.some(x)` twice for the same `x` as the same value, where it used to get a new object each time: an operator's result (`map(() => Optional.some(id))`, `mapOptional`, `derive`), `skipIfNoChange` and a `createState` setter no longer emit or notify when the `Some` holds the very same `x` as before, and React's state bails out as it does for any unchanged value.

### Patch Changes

- e7b459f: `SafeNumber.parseInteger` (and `Num.safeParseInt`, which delegates to it) now accepts exactly what `Number` reads as a finite number, truncated toward zero, and its documentation says so. A leading-dot decimal such as `'.5'` or `'-.9'`, rejected before while `'0.5'` was accepted, now parses (to `0` / `-0`). The hexadecimal, binary and octal literals stay accepted, now documented rather than contradicting the "base-10" wording; `Num.safeParseInt`'s error message no longer says "base-10".
- 7d6f898: Export `AsyncData.Cases` and `AsyncData.SettleResult`, the types `AsyncData.match` and `AsyncData.settle` name.
- Updated dependencies [2f758a4]
- Updated dependencies [ae57625]
- Updated dependencies [40645fa]
    - ts-type-forge@9.2.6
    - ts-std-forge-keys@1.0.0

## 0.5.4

### Patch Changes

- 2c04f3f: `hasKey`'s documentation now says that it sees own properties only, so an accessor declared in a class — which lives on the prototype — is not found, and that `Reflect.get` reads one through the prototype chain.

## 0.5.3

### Patch Changes

- e9420e9: Drop the runtime dependency on `@sindresorhus/is`. The six guards these packages used from it (`isError`, `isDate`, `isRegExp`, `isMap`, `isSet`, `isTypedArray`) are now a few lines of their own that read the same `Object.prototype.toString` tag, so they answer as before, across realms included. `@sindresorhus/is` stayed mostly whole in a bundle that used any one of them: a bundle that reaches `fastDeepEqual`, `replaceEqualDeep`, `unknownToString`, `Result.fromThrowable` or the panic helpers is about 12 kB smaller minified (about 3 kB gzipped).

## 0.5.2

### Patch Changes

- 079cb28: Add `AsyncData<S, E>`, the state of data fetched asynchronously: `idle`, `pending`, or settled as the `Ok` / `Err` of `Result`. A pending or failed request keeps the latest success value as `previous`; `AsyncData.toPending` and `AsyncData.settle` move between the states and fill it in, and `AsyncData.isSettled` narrows a value to a `Result`. ts-data-forge re-exports it.

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
