[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [functional/result](../README.md) / Result

# Result

Namespace for the `Result` type and related functions.
Provides utilities to handle operations that can succeed or fail.

## Type Aliases

### Base

> **Base** = [`Result`](../README.md#result)\<`unknown`, `unknown`\>

Defined in: [src/functional/result.mts:85](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L85)

Base type for any `Result`, used for generic constraints.
Represents a `Result` with unknown success and error types.

---

### Err\<E\>

> **Err**\<`E`\> = `Err_`\<`E`\>

Defined in: [src/functional/result.mts:79](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L79)

Represents a `Result` that is an error, containing an error value.

#### Type Parameters

##### E

`E`

The type of the error value.

---

### NarrowToErr\<R\>

> **NarrowToErr**\<`R`\> = `R` _extends_ [`Ok`](#ok)\<`unknown`\> ? `never` : `R`

Defined in: [src/functional/result.mts:113](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L113)

Narrows a `Result.Base` type to `Result.Err<E>` if it is an `Err`.
If the `Result` is `Result.Ok<S>`, resolves to `never`.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to narrow.

---

### NarrowToOk\<R\>

> **NarrowToOk**\<`R`\> = `R` _extends_ [`Err`](#err)\<`unknown`\> ? `never` : `R`

Defined in: [src/functional/result.mts:106](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L106)

Narrows a `Result.Base` type to `Result.Ok<S>` if it is an `Ok`.
If the `Result` is `Result.Err<E>`, resolves to `never`.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to narrow.

---

### Ok\<S\>

> **Ok**\<`S`\> = `Ok_`\<`S`\>

Defined in: [src/functional/result.mts:73](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L73)

Represents a `Result` that is a success, containing a value.

#### Type Parameters

##### S

`S`

The type of the success value.

---

### UnwrapErr\<R\>

> **UnwrapErr**\<`R`\> = `R` _extends_ [`Err`](#err)\<infer E\> ? `E` : `never`

Defined in: [src/functional/result.mts:99](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L99)

Extracts the error value type `E` from a `Result.Err<E>`.
If the `Result` is `Result.Ok<S>`, resolves to `never`.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to unwrap.

---

### UnwrapOk\<R\>

> **UnwrapOk**\<`R`\> = `R` _extends_ [`Ok`](#ok)\<infer S\> ? `S` : `never`

Defined in: [src/functional/result.mts:92](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L92)

Extracts the success value type `S` from a `Result.Ok<S>`.
If the `Result` is `Result.Err<E>`, resolves to `never`.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to unwrap.

## Variables

### expectToBe

> `const` **expectToBe**: `ExpectToBeFnOverload`

Defined in: [src/functional/result.mts:774](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L774)

Unwraps a `Result`, returning the success value or throwing an error with the provided message.

#### Template

The `Result.Base` type to unwrap.

#### Param

The `Result` to unwrap.

#### Param

The error message to throw if the `Result` is `Result.Err`.

#### Returns

The success value if `Result.Ok`.

#### Throws

Error with the provided message if the `Result` is `Result.Err`.

#### Example

```typescript
const result = Result.ok(42);
const value = Result.expectToBe(result, 'Operation must succeed');
console.log(value); // 42
```

---

### flatMap

> `const` **flatMap**: `FlatMapFnOverload`

Defined in: [src/functional/result.mts:722](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L722)

Applies a function that returns a `Result` to the success value of a `Result`.
If the input is `Err`, returns the original `Err`.
This is the monadic bind operation for `Result`.

#### Template

The input `Result.Base` type.

#### Template

The success type of the `Result` returned by the function.

#### Template

The error type of the `Result` returned by the function.

#### Param

The `Result` to flat map.

#### Param

The function to apply that returns a `Result`.

#### Returns

The result of applying the function, or the original `Err`.

#### Example

```typescript
const divide = (a: number, b: number): Result<number, string> =>
    b === 0 ? Result.err('Division by zero') : Result.ok(a / b);

const result = Result.flatMap(Result.ok(10), (x) => divide(x, 2));
console.log(Result.unwrapOk(result)); // 5
```

---

### fold

> `const` **fold**: `FoldFnOverload`

Defined in: [src/functional/result.mts:656](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L656)

Applies one of two functions depending on whether the `Result` is `Ok` or `Err`.

#### Template

The input `Result.Base` type.

#### Template

The type of the success value returned by `mapFn`.

#### Template

The type of the error value returned by `mapErrFn`.

#### Param

The `Result` to fold.

#### Param

The function to apply if `result` is `Ok`.

#### Param

The function to apply if `result` is `Err`.

#### Returns

A new `Result<S2, E2>` based on the applied function.

#### Example

```typescript
const result = Result.ok(42);
const folded = Result.fold(
    result,
    (x) => x * 2,
    () => 0,
);
console.log(Result.unwrapOk(folded)); // 84
```

---

### map

> `const` **map**: `MapFnOverload`

Defined in: [src/functional/result.mts:553](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L553)

Maps a `Result<S, E>` to `Result<S2, E>` by applying a function to the success value.
If the `Result` is `Result.Err`, returns the original `Err`.

#### Template

The input `Result.Base` type.

#### Template

The type of the success value returned by the mapping function.

#### Param

The `Result` to map.

#### Param

The function to apply to the success value if present.

#### Returns

A new `Result<S2, UnwrapErr<R>>`.

#### Example

```typescript
// Regular usage
const result = Result.ok(5);
const mapped = Result.map(result, (x) => x * 2);
console.log(Result.unwrap(mapped)); // 10

// Curried version for use with pipe
const doubler = Result.map((x: number) => x * 2);
const result2 = pipe(Result.ok(5)).map(doubler).value;
console.log(Result.unwrap(result2)); // 10
```

---

### mapErr

> `const` **mapErr**: `MapErrFnOverload`

Defined in: [src/functional/result.mts:604](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L604)

Maps a `Result<S, E>` to `Result<S, E2>` by applying a function to the error value.
If the `Result` is `Result.Ok`, returns the original `Ok`.

#### Template

The input `Result.Base` type.

#### Template

The type of the error value returned by the mapping function.

#### Param

The `Result` to map.

#### Param

The function to apply to the error value if present.

#### Returns

A new `Result<UnwrapOk<R>, E2>`.

#### Example

```typescript
const result = Result.err('error');
const mapped = Result.mapErr(result, (e) => e.toUpperCase());
console.log(Result.unwrapErr(mapped)); // "ERROR"
```

---

### orElse

> `const` **orElse**: `OrElseFnOverload`

Defined in: [src/functional/result.mts:936](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L936)

Returns the `Result` if it is `Ok`, otherwise returns the alternative.

#### Template

The input `Result.Base` type.

#### Param

The `Result` to check.

#### Param

The alternative `Result` to return if the first is `Err`.

#### Returns

The first `Result` if `Ok`, otherwise the alternative.

#### Example

```typescript
const primary = Result.err('error');
const fallback = Result.ok('default');
const result = Result.orElse(primary, fallback);
console.log(Result.unwrapOk(result)); // "default"
```

---

### unwrapErrOr

> `const` **unwrapErrOr**: `UnwrapErrOrFnOverload`

Defined in: [src/functional/result.mts:501](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L501)

Unwraps a `Result`, returning the error value or a default value if it is `Result.Ok`.

#### Template

The `Result.Base` type to unwrap.

#### Template

The type of the default value.

#### Param

The `Result` to unwrap.

#### Param

The value to return if `result` is `Result.Ok`.

#### Returns

The error value if `Result.Err`, otherwise `defaultValue`.

#### Example

```typescript
const result = Result.err('failed');
const error = Result.unwrapErrOr(result, 'default');
console.log(error); // "failed"
```

---

### unwrapOk

> `const` **unwrapOk**: `UnwrapOkFnOverload`

Defined in: [src/functional/result.mts:362](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L362)

Unwraps a `Result`, returning the success value or `undefined` if it's an error.

This function provides a safe way to extract success values from Results without
throwing exceptions. It has overloaded behavior based on the type:

- For `Result.Ok<T>`: Always returns `T` (guaranteed by type system)
- For general `Result<T, E>`: Returns `T | undefined`

#### Template

The `Result.Base` type to unwrap.

#### Param

The `Result` to unwrap.

#### Returns

The success value if `Result.Ok`, otherwise `undefined`.

#### Example

```typescript
// With guaranteed Ok - returns the value
const success = Result.ok(42);
const value = Result.unwrapOk(success); // Type: number, Value: 42

// With general Result - may return undefined
const maybeResult: Result<string, Error> = fetchData();
const data = Result.unwrapOk(maybeResult); // Type: string | undefined

// Safe pattern for handling both cases
const result = Result.ok('hello');
const unwrapped = Result.unwrapOk(result);
if (unwrapped !== undefined) {
    console.log(unwrapped.toUpperCase()); // "HELLO"
}

// Useful in conditional chains
const processResult = (r: Result<number, string>) => {
    const value = Result.unwrapOk(r);
    return value !== undefined ? value * 2 : 0;
};
```

---

### unwrapOkOr

> `const` **unwrapOkOr**: `UnwrapOkOrFnOverload`

Defined in: [src/functional/result.mts:391](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L391)

Unwraps a `Result`, returning the success value or a default value if it is `Result.Err`.

#### Template

The `Result.Base` type to unwrap.

#### Template

The type of the default value.

#### Param

The `Result` to unwrap.

#### Param

The value to return if `result` is `Result.Err`.

#### Returns

The success value if `Result.Ok`, otherwise `defaultValue`.

#### Example

```typescript
const result = Result.ok(42);
const value = Result.unwrapOkOr(result, 0);
console.log(value); // 42
```

## Functions

### err()

> **err**\<`E`\>(`value`): [`Err`](#err)\<`E`\>

Defined in: [src/functional/result.mts:188](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L188)

Creates a `Result.Err` containing the given error value.

Use this constructor when an operation fails and you want to wrap
the error information in a Result type for consistent error handling.

#### Type Parameters

##### E

`E`

The type of the error value.

#### Parameters

##### value

`E`

The error value.

#### Returns

[`Err`](#err)\<`E`\>

A `Result.Err<E>` containing the value.

#### Example

```typescript
// Basic error case
const failure = Result.err('Something went wrong');
console.log(Result.isErr(failure)); // true
console.log(Result.unwrapErr(failure)); // "Something went wrong"

// Function that can fail
function parseInteger(input: string): Result<number, string> {
    const num = parseInt(input, 10);
    if (isNaN(num)) {
        return Result.err(`Invalid number format: ${input}`);
    }
    return Result.ok(num);
}

const result = parseInteger('abc');
console.log(Result.unwrapErr(result)); // "Invalid number format: abc"

// Using custom error types
interface ValidationError {
    field: string;
    message: string;
}

const validationError = Result.err<ValidationError>({
    field: 'email',
    message: 'Invalid email format',
});
```

---

### fromPromise()

> **fromPromise**\<`P`\>(`promise`): `Promise`\<[`Result`](../README.md#result)\<`UnwrapPromise`\<`P`\>, `unknown`\>\>

Defined in: [src/functional/result.mts:823](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L823)

Converts a Promise into a Promise that resolves to a `Result`.
If the input Promise resolves, the `Result` will be `Ok` with the resolved value.
If the input Promise rejects, the `Result` will be `Err` with the rejection reason.

#### Type Parameters

##### P

`P` _extends_ `Promise`\<`unknown`\>

The type of the input Promise.

#### Parameters

##### promise

`P`

The Promise to convert.

#### Returns

`Promise`\<[`Result`](../README.md#result)\<`UnwrapPromise`\<`P`\>, `unknown`\>\>

A Promise that resolves to `Result<UnwrapPromise<P>, unknown>`.

---

### fromThrowable()

> **fromThrowable**\<`T`\>(`fn`): [`Result`](../README.md#result)\<`T`, `Error`\>

Defined in: [src/functional/result.mts:855](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L855)

Wraps a function that may throw an exception in a `Result`.

This is a fundamental utility for converting traditional exception-based error
handling into Result-based error handling. Any thrown value is converted to an
Error object for consistent error handling.

If the function executes successfully, returns `Result.Ok` with the result.
If the function throws, returns `Result.Err` with the caught error.

#### Type Parameters

##### T

`T`

The return type of the function.

#### Parameters

##### fn

() => `T`

The function to execute that may throw.

#### Returns

[`Result`](../README.md#result)\<`T`, `Error`\>

A `Result<T, Error>` containing either the successful result or the caught error.

#### Example

```typescript
// Wrapping JSON.parse which can throw
const parseJson = <T>(text: string): Result<T, Error> =>
    Result.fromThrowable(() => JSON.parse(text) as T);

const validJson = parseJson<{ valid: boolean }>('{"valid": true}');
if (Result.isOk(validJson)) {
    console.log(validJson.value.valid); // true
}
```

---

### isErr()

> **isErr**\<`R`\>(`result`): `result is NarrowToErr<R>`

Defined in: [src/functional/result.mts:285](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L285)

Checks if a `Result` is `Result.Err`.
Acts as a type guard, narrowing the type to the error variant.

This function is essential for type-safe Result handling, allowing
TypeScript to understand that subsequent operations will work with
the error value rather than the success value.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to check.

#### Parameters

##### result

`R`

The `Result` to check.

#### Returns

`result is NarrowToErr<R>`

`true` if the `Result` is `Result.Err`, otherwise `false`.

#### Example

```typescript
// Basic type guard usage
const result: Result<number, string> = divide(10, 0);

if (Result.isErr(result)) {
    // TypeScript knows result is Result.Err<string>
    console.log(result.value); // Safe to access error .value
    console.log(Result.unwrapErr(result)); // "Division by zero"
} else {
    // TypeScript knows result is Result.Ok<number>
    console.log(result.value); // Success value
}

// Error handling patterns
const handleResult = (r: Result<Data, ApiError>) => {
    if (Result.isErr(r)) {
        logError(r.value); // Safe error operations
        return null;
    }
    return processData(r.value);
};

// Collecting errors from multiple Results
const results: Result<string, ValidationError>[] = validateForm();
const errors = results.filter(Result.isErr).map((err) => err.value); // ValidationError[]
```

---

### isOk()

> **isOk**\<`R`\>(`result`): `result is NarrowToOk<R>`

Defined in: [src/functional/result.mts:241](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L241)

Checks if a `Result` is `Result.Ok`.
Acts as a type guard, narrowing the type to the success variant.

This function is essential for type-safe Result handling, allowing
TypeScript to understand that subsequent operations will work with
the success value rather than the error value.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to check.

#### Parameters

##### result

`R`

The `Result` to check.

#### Returns

`result is NarrowToOk<R>`

`true` if the `Result` is `Result.Ok`, otherwise `false`.

#### Example

```typescript
// Basic type guard usage
const result: Result<number, string> = divide(10, 2);

if (Result.isOk(result)) {
    // TypeScript knows result is Result.Ok<number>
    console.log(result.value); // Safe to access .value
    console.log(Result.unwrapOk(result)); // 5
} else {
    // TypeScript knows result is Result.Err<string>
    console.log(result.value); // Error message
}

// Using in conditional logic
const processResult = (r: Result<string, Error>) => {
    return Result.isOk(r)
        ? r.value.toUpperCase() // Safe string operations
        : 'Error occurred';
};

// Filtering arrays of Results
const results: Result<number, string>[] = [
    Result.ok(1),
    Result.err('error'),
    Result.ok(2),
];
const successes = results.filter(Result.isOk);
// successes is Result.Ok<number>[]
```

---

### isResult()

> **isResult**(`maybeOptional`): `maybeOptional is Result<unknown, unknown>`

Defined in: [src/functional/result.mts:60](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L60)

Checks if the given value is a `Result`.

#### Parameters

##### maybeOptional

`unknown`

The value to check.

#### Returns

`maybeOptional is Result<unknown, unknown>`

`true` if the value is a `Result`, otherwise `false`.

---

### ok()

> **ok**\<`S`\>(`value`): [`Ok`](#ok)\<`S`\>

Defined in: [src/functional/result.mts:143](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L143)

Creates a `Result.Ok` containing the given success value.

Use this constructor when an operation succeeds and you want to wrap
the successful result in a Result type for consistent error handling.

#### Type Parameters

##### S

`S`

The type of the success value.

#### Parameters

##### value

`S`

The success value.

#### Returns

[`Ok`](#ok)\<`S`\>

A `Result.Ok<S>` containing the value.

#### Example

```typescript
// Basic success case
const success = Result.ok(42);
console.log(Result.isOk(success)); // true
console.log(Result.unwrapOk(success)); // 42

// Function that returns a Result
function divide(a: number, b: number): Result<number, string> {
    if (b === 0) {
        return Result.err('Division by zero');
    }
    return Result.ok(a / b);
}

const result = divide(10, 2);
console.log(Result.unwrapOk(result)); // 5
```

---

### swap()

> **swap**\<`R`\>(`result`): [`Result`](../README.md#result)\<[`UnwrapErr`](#unwraperr)\<`R`\>, [`UnwrapOk`](#unwrapok)\<`R`\>\>

Defined in: [src/functional/result.mts:884](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L884)

Swaps the success and error values of a `Result`.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The input `Result.Base` type.

#### Parameters

##### result

`R`

The `Result` to swap.

#### Returns

[`Result`](../README.md#result)\<[`UnwrapErr`](#unwraperr)\<`R`\>, [`UnwrapOk`](#unwrapok)\<`R`\>\>

A new `Result` with success and error swapped.

#### Example

```typescript
const okResult = Result.ok(42);
const swapped = Result.swap(okResult);
console.log(Result.isErr(swapped)); // true
console.log(Result.unwrapErr(swapped)); // 42
```

---

### toOptional()

> **toOptional**\<`R`\>(`result`): [`Optional`](../../optional/README.md#optional)\<[`UnwrapOk`](#unwrapok)\<`R`\>\>

Defined in: [src/functional/result.mts:917](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L917)

Converts a `Result` to an `Optional`.

This conversion is useful when you want to discard error information and only
care about whether an operation succeeded. The error information is lost in
this conversion, so use it when error details are not needed.

If the `Result` is `Ok`, returns `Some` with the value.
If the `Result` is `Err`, returns `None`.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The input `Result.Base` type.

#### Parameters

##### result

`R`

The `Result` to convert.

#### Returns

[`Optional`](../../optional/README.md#optional)\<[`UnwrapOk`](#unwrapok)\<`R`\>\>

An `Optional<UnwrapOk<R>>` containing the success value or representing `None`.

#### Example

```typescript
// Basic conversion
const okResult = Result.ok(42);
const optional = Result.toOptional(okResult);
console.log(Optional.isSome(optional)); // true
console.log(Optional.unwrap(optional)); // 42

const errResult = Result.err('Network error');
const none = Result.toOptional(errResult);
console.log(Optional.isNone(none)); // true
```

---

### unwrapErr()

> **unwrapErr**\<`R`\>(`result`): `undefined` \| [`UnwrapErr`](#unwraperr)\<`R`\>

Defined in: [src/functional/result.mts:481](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L481)

Unwraps a `Result`, returning the error value or `undefined` if it is `Result.Ok`.

This provides a safe way to extract error values from Results without throwing
exceptions. Useful for error handling patterns where you want to check for
specific error conditions.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to unwrap.

#### Parameters

##### result

`R`

The `Result` to unwrap.

#### Returns

`undefined` \| [`UnwrapErr`](#unwraperr)\<`R`\>

The error value if `Result.Err`, otherwise `undefined`.

#### Example

```typescript
const failure = Result.err('Connection failed');
console.log(Result.unwrapErr(failure)); // "Connection failed"

const success = Result.ok(42);
console.log(Result.unwrapErr(success)); // undefined
```

---

### unwrapErrThrow()

> **unwrapErrThrow**\<`R`\>(`result`, `toStr`): [`UnwrapErr`](#unwraperr)\<`R`\>

Defined in: [src/functional/result.mts:447](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L447)

Unwraps a `Result`, returning the error value.
Throws an error if the `Result` is `Result.Ok`.

This function is used when you expect a Result to be an error and want to
extract the error value. If the Result is unexpectedly Ok, it will throw
an error with information about the unexpected success value.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to unwrap.

#### Parameters

##### result

`R`

The `Result` to unwrap.

##### toStr

(`v`) => `string`

An optional function to convert the success value to a string for the error message when the Result is unexpectedly Ok. Defaults to `String`.

#### Returns

[`UnwrapErr`](#unwraperr)\<`R`\>

The error value if `Result.Err`.

#### Throws

Error with message "Expected Err but got Ok: {value}" if the `Result` is `Result.Ok`.

#### Example

```typescript
const failure = Result.err('Network timeout');
console.log(Result.unwrapErrThrow(failure)); // "Network timeout"

const success = Result.ok(42);
try {
    Result.unwrapErrThrow(success); // throws Error: "Expected Err but got Ok: 42"
} catch (error) {
    console.log(error.message); // "Expected Err but got Ok: 42"
}
```

---

### unwrapThrow()

> **unwrapThrow**\<`R`\>(`result`, `toStr`): [`UnwrapOk`](#unwrapok)\<`R`\>

Defined in: [src/functional/result.mts:314](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L314)

Unwraps a `Result`, returning the success value.
Throws an error if the `Result` is `Result.Err`.

This is useful when you're confident that a Result should contain a success value
and want to treat errors as exceptional conditions. The error message will be
constructed from the error value using the provided string conversion function.

#### Type Parameters

##### R

`R` _extends_ [`Base`](#base)

The `Result.Base` type to unwrap.

#### Parameters

##### result

`R`

The `Result` to unwrap.

##### toStr

(`e`) => `string`

An optional function to convert the error value to a string for the error message. Defaults to `String`.

#### Returns

[`UnwrapOk`](#unwrapok)\<`R`\>

The success value if `Result.Ok`.

#### Throws

Error with the stringified error value if the `Result` is `Result.Err`.

#### Example

```typescript
const success = Result.ok(42);
console.log(Result.unwrapThrow(success)); // 42

const failure = Result.err('Network error');
try {
    Result.unwrapThrow(failure); // throws Error: "Network error"
} catch (error) {
    console.log(error.message); // "Network error"
}
```

---

### zip()

> **zip**\<`S1`, `E1`, `S2`, `E2`\>(`resultA`, `resultB`): [`Result`](../README.md#result)\<readonly \[`S1`, `S2`\], `E1` \| `E2`\>

Defined in: [src/functional/result.mts:991](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/result.mts#L991)

Combines two `Result` values into a single `Result` containing a tuple.
If either `Result` is `Err`, returns the first `Err` encountered.

#### Type Parameters

##### S1

`S1`

The success type of the first `Result`.

##### E1

`E1`

The error type of the first `Result`.

##### S2

`S2`

The success type of the second `Result`.

##### E2

`E2`

The error type of the second `Result`.

#### Parameters

##### resultA

[`Result`](../README.md#result)\<`S1`, `E1`\>

The first `Result`.

##### resultB

[`Result`](../README.md#result)\<`S2`, `E2`\>

The second `Result`.

#### Returns

[`Result`](../README.md#result)\<readonly \[`S1`, `S2`\], `E1` \| `E2`\>

A `Result` containing a tuple of both values, or the first `Err`.

#### Example

```typescript
const a = Result.ok(1);
const b = Result.ok('hello');
const zipped = Result.zip(a, b);
console.log(Result.unwrapOk(zipped)); // [1, "hello"]

const withErr = Result.zip(a, Result.err('error'));
console.log(Result.unwrapErr(withErr)); // "error"
```
