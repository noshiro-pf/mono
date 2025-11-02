[**ts-repo-utils**](../../README.md)

***

[ts-repo-utils](../../README.md) / [entry-point](../README.md) / Result

# Result

Namespace for the `Result` type and related functions. Provides utilities to
handle operations that can succeed or fail.

## Type Aliases

### Base

> **Base** = [`Result`](../README.md#result)\<`unknown`, `unknown`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:81

Base type for any `Result`, used for generic constraints. Represents a
`Result` with unknown success and error types.

***

### Err

> **Err**\<`E`\> = `Err_`\<`E`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:76

Represents a `Result` that is an error, containing an error value.

#### Type Parameters

##### E

`E`

The type of the error value.

***

### NarrowToErr

> **NarrowToErr**\<`R`\> = `R` *extends* [`Ok`](#ok)\<`unknown`\> ? `never` : `R`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:109

Narrows a `Result.Base` type to `Result.Err<E>` if it is an `Err`. If the
`Result` is `Result.Ok<S>`, resolves to `never`.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to narrow.

***

### NarrowToOk

> **NarrowToOk**\<`R`\> = `R` *extends* [`Err`](#err)\<`unknown`\> ? `never` : `R`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:102

Narrows a `Result.Base` type to `Result.Ok<S>` if it is an `Ok`. If the
`Result` is `Result.Err<E>`, resolves to `never`.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to narrow.

***

### Ok

> **Ok**\<`S`\> = `Ok_`\<`S`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:70

Represents a `Result` that is a success, containing a value.

#### Type Parameters

##### S

`S`

The type of the success value.

***

### UnwrapErr

> **UnwrapErr**\<`R`\> = `R` *extends* [`Err`](#err)\<infer E\> ? `E` : `never`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:95

Extracts the error value type `E` from a `Result.Err<E>`. If the `Result`
is `Result.Ok<S>`, resolves to `never`.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

***

### UnwrapOk

> **UnwrapOk**\<`R`\> = `R` *extends* [`Ok`](#ok)\<infer S\> ? `S` : `never`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:88

Extracts the success value type `S` from a `Result.Ok<S>`. If the `Result`
is `Result.Err<E>`, resolves to `never`.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

## Variables

### err()

> `const` **err**: \<`E`\>(`value`) => [`Err`](#err)\<`E`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:157

Creates a `Result.Err` containing the given error value.

Use this constructor when an operation fails and you want to wrap the error
information in a Result type for consistent error handling.

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

```ts
const success = Result.ok({ id: 1 });
const failure = Result.err(new Error('missing data'));

assert.deepStrictEqual(success, {
  $$tag: 'ts-data-forge::Result.ok',
  value: { id: 1 },
});
assert.ok(Result.isErr(failure));
```

***

### fromPromise()

> `const` **fromPromise**: \<`P`\>(`promise`) => `Promise`\<[`Result`](../README.md#result)\<`UnwrapPromise`\<`P`\>, `unknown`\>\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:578

Converts a Promise into a Promise that resolves to a `Result`. If the input
Promise resolves, the `Result` will be `Ok` with the resolved value. If the
input Promise rejects, the `Result` will be `Err` with the rejection
reason.

#### Type Parameters

##### P

`P` *extends* `Promise`\<`unknown`\>

The type of the input Promise.

#### Parameters

##### promise

`P`

The Promise to convert.

#### Returns

`Promise`\<[`Result`](../README.md#result)\<`UnwrapPromise`\<`P`\>, `unknown`\>\>

A Promise that resolves to `Result<UnwrapPromise<P>, unknown>`.

#### Example

```ts
const successPromise = Result.fromPromise(Promise.resolve('ok'));
const failurePromise = Result.fromPromise(Promise.reject(new Error('fail')));

const resolved = await successPromise;
const rejected = await failurePromise;

assert.deepStrictEqual(resolved, Result.ok('ok'));
assert.ok(Result.isErr(rejected));
```

***

### fromThrowable()

> `const` **fromThrowable**: \<`T`\>(`fn`) => [`Result`](../README.md#result)\<`T`, `Error`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:606

Wraps a function that may throw an exception in a `Result`.

This is a fundamental utility for converting traditional exception-based
error handling into Result-based error handling. Any thrown value is
converted to an Error object for consistent error handling.

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

A `Result<T, Error>` containing either the successful result or
  the caught error.

#### Example

```ts
const success = Result.fromThrowable(() => 1 + 1);
const failure = Result.fromThrowable(() => {
  throw new Error('boom');
});

assert.deepStrictEqual(success, Result.ok(2));
assert.ok(Result.isErr(failure));
```

***

### isErr()

> `const` **isErr**: \<`R`\>(`result`) => `result is NarrowToErr<R>`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:211

Checks if a `Result` is `Result.Err`. Acts as a type guard, narrowing the
type to the error variant.

This function is essential for type-safe Result handling, allowing
TypeScript to understand that subsequent operations will work with the
error value rather than the success value.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to check.

#### Parameters

##### result

`R`

The `Result` to check.

#### Returns

`result is NarrowToErr<R>`

`true` if the `Result` is `Result.Err`, otherwise `false`.

#### Example

```ts
const operation = Result.ok(3);
const failure = Result.err('error');

if (Result.isOk(operation)) {
  const value: number = operation.value;
  assert(value === 3);
}

assert.ok(Result.isErr(failure));
```

***

### isOk()

> `const` **isOk**: \<`R`\>(`result`) => `result is NarrowToOk<R>`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:184

Checks if a `Result` is `Result.Ok`. Acts as a type guard, narrowing the
type to the success variant.

This function is essential for type-safe Result handling, allowing
TypeScript to understand that subsequent operations will work with the
success value rather than the error value.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to check.

#### Parameters

##### result

`R`

The `Result` to check.

#### Returns

`result is NarrowToOk<R>`

`true` if the `Result` is `Result.Ok`, otherwise `false`.

#### Example

```ts
const operation = Result.ok(3);
const failure = Result.err('error');

if (Result.isOk(operation)) {
  const value: number = operation.value;
  assert(value === 3);
}

assert.ok(Result.isErr(failure));
```

***

### isResult()

> `const` **isResult**: (`maybeOptional`) => `maybeOptional is Result<unknown, unknown>`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:64

Checks if the given value is a `Result`.

#### Parameters

##### maybeOptional

`unknown`

The value to check.

#### Returns

`maybeOptional is Result<unknown, unknown>`

`true` if the value is a `Result`, otherwise `false`.

#### Example

```ts
const okValue = Result.ok('success');
const errValue = Result.err(new Error('failure'));
const notResult = { $$tag: 'ts-data-forge::Result.ok' };

assert.ok(Result.isResult(okValue));
assert.ok(Result.isResult(errValue));
assert.notOk(Result.isResult(notResult));
```

***

### ok()

> `const` **ok**: \<`S`\>(`value`) => [`Ok`](#ok)\<`S`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:133

Creates a `Result.Ok` containing the given success value.

Use this constructor when an operation succeeds and you want to wrap the
successful result in a Result type for consistent error handling.

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

```ts
const success = Result.ok({ id: 1 });
const failure = Result.err(new Error('missing data'));

assert.deepStrictEqual(success, {
  $$tag: 'ts-data-forge::Result.ok',
  value: { id: 1 },
});
assert.ok(Result.isErr(failure));
```

***

### swap()

> `const` **swap**: \<`R`\>(`result`) => [`Result`](../README.md#result)\<[`UnwrapErr`](#unwraperr)\<`R`\>, [`UnwrapOk`](#unwrapok)\<`R`\>\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:624

Swaps the success and error values of a `Result`.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The input `Result.Base` type.

#### Parameters

##### result

`R`

The `Result` to swap.

#### Returns

[`Result`](../README.md#result)\<[`UnwrapErr`](#unwraperr)\<`R`\>, [`UnwrapOk`](#unwrapok)\<`R`\>\>

A new `Result` with success and error swapped.

#### Example

```ts
const okValue = Result.ok('value');
const errValue = Result.err('error');

assert.deepStrictEqual(Result.swap(okValue), Result.err('value'));
assert.deepStrictEqual(Result.swap(errValue), Result.ok('error'));
```

***

### toOptional()

> `const` **toOptional**: \<`R`\>(`result`) => `Optional`\<[`UnwrapOk`](#unwrapok)\<`R`\>\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:650

Converts a `Result` to an `Optional`.

This conversion is useful when you want to discard error information and
only care about whether an operation succeeded. The error information is
lost in this conversion, so use it when error details are not needed.

If the `Result` is `Ok`, returns `Some` with the value. If the `Result` is
`Err`, returns `None`.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The input `Result.Base` type.

#### Parameters

##### result

`R`

The `Result` to convert.

#### Returns

`Optional`\<[`UnwrapOk`](#unwrapok)\<`R`\>\>

An `Optional<UnwrapOk<R>>` containing the success value or
  representing `None`.

#### Example

```ts
const okValue = Result.ok(7);
const errValue = Result.err('fail');

assert.deepStrictEqual(Result.toOptional(okValue), Optional.some(7));
assert.deepStrictEqual(Result.toOptional(errValue), Optional.none);
```

***

### unwrapErr()

> `const` **unwrapErr**: \<`R`\>(`result`) => [`UnwrapErr`](#unwraperr)\<`R`\> \| `undefined`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:353

Unwraps a `Result`, returning the error value or `undefined` if it is
`Result.Ok`.

This provides a safe way to extract error values from Results without
throwing exceptions. Useful for error handling patterns where you want to
check for specific error conditions.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

#### Parameters

##### result

`R`

The `Result` to unwrap.

#### Returns

[`UnwrapErr`](#unwraperr)\<`R`\> \| `undefined`

The error value if `Result.Err`, otherwise `undefined`.

#### Example

```ts
const okResult = Result.ok('data');
const errResult = Result.err('problem');

// Result.unwrapErr returns undefined for Ok results
// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
assert(Result.unwrapErr(okResult) === undefined);

// Result.unwrapErr returns the error value for Err results

assert(Result.unwrapErr(errResult) === 'problem');
```

***

### unwrapErrThrow()

> `const` **unwrapErrThrow**: \<`R`\>(`result`, `toStr?`) => [`UnwrapErr`](#unwraperr)\<`R`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:325

Unwraps a `Result`, returning the error value. Throws an error if the
`Result` is `Result.Ok`.

This function is used when you expect a Result to be an error and want to
extract the error value. If the Result is unexpectedly Ok, it will throw an
error with information about the unexpected success value.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

#### Parameters

##### result

`R`

The `Result` to unwrap.

##### toStr?

(`v`) => `string`

An optional function to convert the success value to a string
  for the error message when the Result is unexpectedly Ok. Defaults to
  `String`.

#### Returns

[`UnwrapErr`](#unwraperr)\<`R`\>

The error value if `Result.Err`.

#### Example

```ts
const errResult = Result.err(new Error('broken'));
const okResult = Result.ok('value');

assert(Result.unwrapErrThrow(errResult).message === 'broken');
assert.throws(() => Result.unwrapErrThrow(okResult), /Expected Err/u);
```

#### Throws

Error with message "Expected Err but got Ok: {value}" if
  the `Result` is `Result.Ok`.

***

### unwrapThrow()

> `const` **unwrapThrow**: \<`R`\>(`result`, `toStr?`) => [`UnwrapOk`](#unwrapok)\<`R`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:239

Unwraps a `Result`, returning the success value. Throws an error if the
`Result` is `Result.Err`.

This is useful when you're confident that a Result should contain a success
value and want to treat errors as exceptional conditions. The error message
will be constructed from the error value using the provided string
conversion function.

#### Type Parameters

##### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

#### Parameters

##### result

`R`

The `Result` to unwrap.

##### toStr?

(`e`) => `string`

An optional function to convert the error value to a string
  for the error message. Defaults to `String`.

#### Returns

[`UnwrapOk`](#unwrapok)\<`R`\>

The success value if `Result.Ok`.

#### Example

```ts
const okResult = Result.ok('data');
const errResult = Result.err(new Error('fail'));

assert(Result.unwrapThrow(okResult) === 'data');
assert.throws(() => Result.unwrapThrow(errResult), /fail/u);
```

#### Throws

Error with the stringified error value if the `Result` is
  `Result.Err`.

***

### zip()

> `const` **zip**: \<`S1`, `E1`, `S2`, `E2`\>(`resultA`, `resultB`) => [`Result`](../README.md#result)\<readonly \[`S1`, `S2`\], `E1` \| `E2`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:708

Combines two `Result` values into a single `Result` containing a tuple. If
either `Result` is `Err`, returns the first `Err` encountered.

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

```ts
const first = Result.ok('left');
const second = Result.ok(1);

const expected: readonly [string, number] = ['left', 1];

assert.deepStrictEqual(Result.zip(first, second), Result.ok(expected));
assert.deepStrictEqual(
  Result.zip(first, Result.err('error')),
  Result.err('error'),
);
```

## Functions

### expectToBe()

#### Call Signature

> **expectToBe**\<`R`\>(`result`, `message`): [`UnwrapOk`](#unwrapok)\<`R`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:547

Unwraps a `Result`, returning the success value or throwing an error with
the provided message.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

##### Parameters

###### result

`R`

The `Result` to unwrap.

###### message

`string`

The error message to throw if the `Result` is `Result.Err`.

##### Returns

[`UnwrapOk`](#unwrapok)\<`R`\>

The success value if `Result.Ok`.

##### Example

```ts
const okValue = Result.ok('data');

assert(Result.expectToBe(okValue, 'should have value') === 'data');

const expectResult = Result.expectToBe<string>('missing result');

assert.throws(() => expectResult(Result.err('boom')), /missing result/u);
assert(expectResult(Result.ok('value')) === 'value');
```

##### Throws

Error with the provided message if the `Result` is `Result.Err`.

#### Call Signature

> **expectToBe**\<`S`\>(`message`): \<`E`\>(`result`) => `S`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:548

Unwraps a `Result`, returning the success value or throwing an error with
the provided message.

##### Type Parameters

###### S

`S`

##### Parameters

###### message

`string`

The error message to throw if the `Result` is `Result.Err`.

##### Returns

The success value if `Result.Ok`.

> \<`E`\>(`result`): `S`

###### Type Parameters

###### E

`E`

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

`S`

##### Example

```ts
const okValue = Result.ok('data');

assert(Result.expectToBe(okValue, 'should have value') === 'data');

const expectResult = Result.expectToBe<string>('missing result');

assert.throws(() => expectResult(Result.err('boom')), /missing result/u);
assert(expectResult(Result.ok('value')) === 'value');
```

##### Throws

Error with the provided message if the `Result` is `Result.Err`.

***

### flatMap()

#### Call Signature

> **flatMap**\<`R`, `S2`, `E2`\>(`result`, `flatMapFn`): [`Result`](../README.md#result)\<`S2`, `E2` \| [`UnwrapErr`](#unwraperr)\<`R`\>\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:522

Applies a function that returns a `Result` to the success value of a
`Result`. If the input is `Err`, returns the original `Err`. This is the
monadic bind operation for `Result`.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The input `Result.Base` type.

###### S2

`S2`

The success type of the `Result` returned by the function.

###### E2

`E2`

The error type of the `Result` returned by the function.

##### Parameters

###### result

`R`

The `Result` to flat map.

###### flatMapFn

(`value`) => [`Result`](../README.md#result)\<`S2`, `E2`\>

The function to apply that returns a `Result`.

##### Returns

[`Result`](../README.md#result)\<`S2`, `E2` \| [`UnwrapErr`](#unwraperr)\<`R`\>\>

The result of applying the function, or the original `Err`.

##### Example

```ts
const parseNumber = (input: string): Result<number, string> => {
  const num = Number.parseInt(input, 10);
  return Number.isNaN(num) ? Result.err('not a number') : Result.ok(num);
};

const parsed = Result.flatMap(Result.ok('42'), parseNumber);
const failure = Result.flatMap(Result.ok('abc'), parseNumber);
const passthrough = Result.flatMap(Result.err('fail'), parseNumber);

assert.deepStrictEqual(parsed, Result.ok(42));
assert.deepStrictEqual(failure, Result.err('not a number'));
assert.deepStrictEqual(passthrough, Result.err('fail'));

const parseThenDouble = Result.flatMap((input: string) =>
  Result.map(parseNumber(input), (value) => value * 2),
);

assert.deepStrictEqual(parseThenDouble(Result.ok('10')), Result.ok(20));
```

#### Call Signature

> **flatMap**\<`S`, `S2`, `E2`\>(`flatMapFn`): \<`E`\>(`result`) => [`Result`](../README.md#result)\<`S2`, `E2` \| `E`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:523

Applies a function that returns a `Result` to the success value of a
`Result`. If the input is `Err`, returns the original `Err`. This is the
monadic bind operation for `Result`.

##### Type Parameters

###### S

`S`

###### S2

`S2`

The success type of the `Result` returned by the function.

###### E2

`E2`

The error type of the `Result` returned by the function.

##### Parameters

###### flatMapFn

(`value`) => [`Result`](../README.md#result)\<`S2`, `E2`\>

The function to apply that returns a `Result`.

##### Returns

The result of applying the function, or the original `Err`.

> \<`E`\>(`result`): [`Result`](../README.md#result)\<`S2`, `E2` \| `E`\>

###### Type Parameters

###### E

`E`

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

[`Result`](../README.md#result)\<`S2`, `E2` \| `E`\>

##### Example

```ts
const parseNumber = (input: string): Result<number, string> => {
  const num = Number.parseInt(input, 10);
  return Number.isNaN(num) ? Result.err('not a number') : Result.ok(num);
};

const parsed = Result.flatMap(Result.ok('42'), parseNumber);
const failure = Result.flatMap(Result.ok('abc'), parseNumber);
const passthrough = Result.flatMap(Result.err('fail'), parseNumber);

assert.deepStrictEqual(parsed, Result.ok(42));
assert.deepStrictEqual(failure, Result.err('not a number'));
assert.deepStrictEqual(passthrough, Result.err('fail'));

const parseThenDouble = Result.flatMap((input: string) =>
  Result.map(parseNumber(input), (value) => value * 2),
);

assert.deepStrictEqual(parseThenDouble(Result.ok('10')), Result.ok(20));
```

***

### fold()

#### Call Signature

> **fold**\<`R`, `S2`, `E2`\>(`result`, `mapFn`, `mapErrFn`): [`Result`](../README.md#result)\<`S2`, `E2`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:485

Applies one of two functions depending on whether the `Result` is `Ok` or
`Err`.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The input `Result.Base` type.

###### S2

`S2`

The type of the success value returned by `mapFn`.

###### E2

`E2`

The type of the error value returned by `mapErrFn`.

##### Parameters

###### result

`R`

The `Result` to fold.

###### mapFn

(`value`) => `S2`

The function to apply if `result` is `Ok`.

###### mapErrFn

(`error`) => `E2`

The function to apply if `result` is `Err`.

##### Returns

[`Result`](../README.md#result)\<`S2`, `E2`\>

A new `Result<S2, E2>` based on the applied function.

##### Example

```ts
const okValue = Result.ok(2);
const errValue = Result.err('bad');

const foldedOk = Result.fold(
  okValue,
  (value) => value * 2,
  (error) => error,
);
const foldedErr = Result.fold(
  errValue,
  (value: number) => value * 2,
  (error) => error.toUpperCase(),
);

assert.deepStrictEqual(foldedOk, Result.ok(4));
assert.deepStrictEqual(foldedErr, Result.err('BAD'));

const foldNumbers = Result.fold(
  (value: number) => value * 3,
  (error: string) => error.length,
);

assert.deepStrictEqual(foldNumbers(Result.ok(3)), Result.ok(9));
assert.deepStrictEqual(foldNumbers(Result.err('oops')), Result.err(4));
```

#### Call Signature

> **fold**\<`S`, `E`, `S2`, `E2`\>(`mapFn`, `mapErrFn`): (`result`) => [`Result`](../README.md#result)\<`S2`, `E2`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:486

Applies one of two functions depending on whether the `Result` is `Ok` or
`Err`.

##### Type Parameters

###### S

`S`

###### E

`E`

###### S2

`S2`

The type of the success value returned by `mapFn`.

###### E2

`E2`

The type of the error value returned by `mapErrFn`.

##### Parameters

###### mapFn

(`value`) => `S2`

The function to apply if `result` is `Ok`.

###### mapErrFn

(`error`) => `E2`

The function to apply if `result` is `Err`.

##### Returns

A new `Result<S2, E2>` based on the applied function.

> (`result`): [`Result`](../README.md#result)\<`S2`, `E2`\>

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

[`Result`](../README.md#result)\<`S2`, `E2`\>

##### Example

```ts
const okValue = Result.ok(2);
const errValue = Result.err('bad');

const foldedOk = Result.fold(
  okValue,
  (value) => value * 2,
  (error) => error,
);
const foldedErr = Result.fold(
  errValue,
  (value: number) => value * 2,
  (error) => error.toUpperCase(),
);

assert.deepStrictEqual(foldedOk, Result.ok(4));
assert.deepStrictEqual(foldedErr, Result.err('BAD'));

const foldNumbers = Result.fold(
  (value: number) => value * 3,
  (error: string) => error.length,
);

assert.deepStrictEqual(foldNumbers(Result.ok(3)), Result.ok(9));
assert.deepStrictEqual(foldNumbers(Result.err('oops')), Result.err(4));
```

***

### map()

#### Call Signature

> **map**\<`R`, `S2`\>(`result`, `mapFn`): [`Result`](../README.md#result)\<`S2`, [`UnwrapErr`](#unwraperr)\<`R`\>\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:411

Maps a `Result<S, E>` to `Result<S2, E>` by applying a function to the
success value. If the `Result` is `Result.Err`, returns the original
`Err`.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The input `Result.Base` type.

###### S2

`S2`

The type of the success value returned by the mapping
  function.

##### Parameters

###### result

`R`

The `Result` to map.

###### mapFn

(`value`) => `S2`

The function to apply to the success value if present.

##### Returns

[`Result`](../README.md#result)\<`S2`, [`UnwrapErr`](#unwraperr)\<`R`\>\>

A new `Result<S2, UnwrapErr<R>>`.

##### Example

```ts
const okNumber = Result.ok(5);
const errMessage = Result.err('error');

const doubled = Result.map(okNumber, (value) => value * 2);
const untouchedError = Result.map(errMessage, (value: number) => value * 2);

assert.deepStrictEqual(doubled, Result.ok(10));
assert.deepStrictEqual(untouchedError, errMessage);

const mapToLength = Result.map((text: string) => text.length);

assert.deepStrictEqual(mapToLength(Result.ok('abc')), Result.ok(3));
assert.deepStrictEqual(mapToLength(Result.err('bad')), Result.err('bad'));
```

#### Call Signature

> **map**\<`S`, `S2`\>(`mapFn`): \<`E`\>(`result`) => [`Result`](../README.md#result)\<`S2`, `E`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:412

Maps a `Result<S, E>` to `Result<S2, E>` by applying a function to the
success value. If the `Result` is `Result.Err`, returns the original
`Err`.

##### Type Parameters

###### S

`S`

###### S2

`S2`

The type of the success value returned by the mapping
  function.

##### Parameters

###### mapFn

(`value`) => `S2`

The function to apply to the success value if present.

##### Returns

A new `Result<S2, UnwrapErr<R>>`.

> \<`E`\>(`result`): [`Result`](../README.md#result)\<`S2`, `E`\>

###### Type Parameters

###### E

`E`

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

[`Result`](../README.md#result)\<`S2`, `E`\>

##### Example

```ts
const okNumber = Result.ok(5);
const errMessage = Result.err('error');

const doubled = Result.map(okNumber, (value) => value * 2);
const untouchedError = Result.map(errMessage, (value: number) => value * 2);

assert.deepStrictEqual(doubled, Result.ok(10));
assert.deepStrictEqual(untouchedError, errMessage);

const mapToLength = Result.map((text: string) => text.length);

assert.deepStrictEqual(mapToLength(Result.ok('abc')), Result.ok(3));
assert.deepStrictEqual(mapToLength(Result.err('bad')), Result.err('bad'));
```

***

### mapErr()

#### Call Signature

> **mapErr**\<`R`, `E2`\>(`result`, `mapFn`): [`Result`](../README.md#result)\<[`UnwrapOk`](#unwrapok)\<`R`\>, `E2`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:442

Maps a `Result<S, E>` to `Result<S, E2>` by applying a function to the
error value. If the `Result` is `Result.Ok`, returns the original `Ok`.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The input `Result.Base` type.

###### E2

`E2`

The type of the error value returned by the mapping function.

##### Parameters

###### result

`R`

The `Result` to map.

###### mapFn

(`error`) => `E2`

The function to apply to the error value if present.

##### Returns

[`Result`](../README.md#result)\<[`UnwrapOk`](#unwrapok)\<`R`\>, `E2`\>

A new `Result<UnwrapOk<R>, E2>`.

##### Example

```ts
const okValue = Result.ok(3) as Result<number, string>;
const errValue = Result.err('missing');

const untouchedOk = Result.mapErr(okValue, (error) => error.toUpperCase());
const uppercasedErr = Result.mapErr(errValue, (error) => error.toUpperCase());

assert.deepStrictEqual(untouchedOk, Result.ok(3));
assert.deepStrictEqual(uppercasedErr, Result.err('MISSING'));

const mapError = Result.mapErr((error: Readonly<Error>) => error.message);

const wrapped = mapError(Result.err(new Error('boom')));

assert.deepStrictEqual(wrapped, Result.err('boom'));
```

#### Call Signature

> **mapErr**\<`E`, `E2`\>(`mapFn`): \<`S`\>(`result`) => [`Result`](../README.md#result)\<`S`, `E2`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:443

Maps a `Result<S, E>` to `Result<S, E2>` by applying a function to the
error value. If the `Result` is `Result.Ok`, returns the original `Ok`.

##### Type Parameters

###### E

`E`

###### E2

`E2`

The type of the error value returned by the mapping function.

##### Parameters

###### mapFn

(`error`) => `E2`

The function to apply to the error value if present.

##### Returns

A new `Result<UnwrapOk<R>, E2>`.

> \<`S`\>(`result`): [`Result`](../README.md#result)\<`S`, `E2`\>

###### Type Parameters

###### S

`S`

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

[`Result`](../README.md#result)\<`S`, `E2`\>

##### Example

```ts
const okValue = Result.ok(3) as Result<number, string>;
const errValue = Result.err('missing');

const untouchedOk = Result.mapErr(okValue, (error) => error.toUpperCase());
const uppercasedErr = Result.mapErr(errValue, (error) => error.toUpperCase());

assert.deepStrictEqual(untouchedOk, Result.ok(3));
assert.deepStrictEqual(uppercasedErr, Result.err('MISSING'));

const mapError = Result.mapErr((error: Readonly<Error>) => error.message);

const wrapped = mapError(Result.err(new Error('boom')));

assert.deepStrictEqual(wrapped, Result.err('boom'));
```

***

### orElse()

#### Call Signature

> **orElse**\<`R`, `R2`\>(`result`, `alternative`): `R2` \| [`NarrowToOk`](#narrowtook)\<`R`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:679

Returns the `Result` if it is `Ok`, otherwise returns the alternative.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The input `Result.Base` type.

###### R2

`R2` *extends* [`Base`](#base)

##### Parameters

###### result

`R`

The `Result` to check.

###### alternative

`R2`

The alternative `Result` to return if the first is
  `Err`.

##### Returns

`R2` \| [`NarrowToOk`](#narrowtook)\<`R`\>

The first `Result` if `Ok`, otherwise the alternative.

##### Example

```ts
const primary = Result.ok('primary');
const fallback = Result.ok('fallback');
const failure = Result.err('failure');

assert.deepStrictEqual(Result.orElse(primary, fallback), primary);
assert.deepStrictEqual(Result.orElse(failure, fallback), fallback);

const orElseFallback = Result.orElse(Result.ok('default'));

assert.deepStrictEqual(
  orElseFallback(Result.err('missing')),
  Result.ok('default'),
);
assert.deepStrictEqual(orElseFallback(Result.ok('value')), Result.ok('value'));
```

#### Call Signature

> **orElse**\<`S`, `E`, `S2`, `E2`\>(`alternative`): (`result`) => [`Result`](../README.md#result)\<`S2`, `E2`\> \| [`Result`](../README.md#result)\<`S`, `E`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:680

Returns the `Result` if it is `Ok`, otherwise returns the alternative.

##### Type Parameters

###### S

`S`

###### E

`E`

###### S2

`S2`

###### E2

`E2`

##### Parameters

###### alternative

[`Result`](../README.md#result)\<`S2`, `E2`\>

The alternative `Result` to return if the first is
  `Err`.

##### Returns

The first `Result` if `Ok`, otherwise the alternative.

> (`result`): [`Result`](../README.md#result)\<`S2`, `E2`\> \| [`Result`](../README.md#result)\<`S`, `E`\>

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

[`Result`](../README.md#result)\<`S2`, `E2`\> \| [`Result`](../README.md#result)\<`S`, `E`\>

##### Example

```ts
const primary = Result.ok('primary');
const fallback = Result.ok('fallback');
const failure = Result.err('failure');

assert.deepStrictEqual(Result.orElse(primary, fallback), primary);
assert.deepStrictEqual(Result.orElse(failure, fallback), fallback);

const orElseFallback = Result.orElse(Result.ok('default'));

assert.deepStrictEqual(
  orElseFallback(Result.err('missing')),
  Result.ok('default'),
);
assert.deepStrictEqual(orElseFallback(Result.ok('value')), Result.ok('value'));
```

***

### unwrapErrOr()

#### Call Signature

> **unwrapErrOr**\<`R`, `D`\>(`result`, `defaultValue`): `D` \| [`UnwrapErr`](#unwraperr)\<`R`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:379

Unwraps a `Result`, returning the error value or a default value if it is
`Result.Ok`.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

###### D

`D`

The type of the default value.

##### Parameters

###### result

`R`

The `Result` to unwrap.

###### defaultValue

`D`

The value to return if `result` is `Result.Ok`.

##### Returns

`D` \| [`UnwrapErr`](#unwraperr)\<`R`\>

The error value if `Result.Err`, otherwise `defaultValue`.

##### Example

```ts
const okResult = Result.ok('success');
const errResult = Result.err('failure');

assert(Result.unwrapErrOr(okResult, 'default') === 'default');
assert(Result.unwrapErrOr(errResult, 'default') === 'failure');

const unwrapError = Result.unwrapErrOr('fallback error');

assert(unwrapError(Result.err('boom')) === 'boom');
assert(unwrapError(Result.ok('no error')) === 'fallback error');
```

#### Call Signature

> **unwrapErrOr**\<`E`, `D`\>(`defaultValue`): \<`S`\>(`result`) => `E` \| `D`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:380

Unwraps a `Result`, returning the error value or a default value if it is
`Result.Ok`.

##### Type Parameters

###### E

`E`

###### D

`D`

The type of the default value.

##### Parameters

###### defaultValue

`D`

The value to return if `result` is `Result.Ok`.

##### Returns

The error value if `Result.Err`, otherwise `defaultValue`.

> \<`S`\>(`result`): `E` \| `D`

###### Type Parameters

###### S

`S`

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

`E` \| `D`

##### Example

```ts
const okResult = Result.ok('success');
const errResult = Result.err('failure');

assert(Result.unwrapErrOr(okResult, 'default') === 'default');
assert(Result.unwrapErrOr(errResult, 'default') === 'failure');

const unwrapError = Result.unwrapErrOr('fallback error');

assert(unwrapError(Result.err('boom')) === 'boom');
assert(unwrapError(Result.ok('no error')) === 'fallback error');
```

***

### unwrapOk()

#### Call Signature

> **unwrapOk**\<`R`\>(`result`): [`UnwrapOk`](#unwrapok)\<`R`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:269

Unwraps a `Result`, returning the success value or `undefined` if it's an
error.

This function provides a safe way to extract success values from Results
without throwing exceptions. It has overloaded behavior based on the type:

- For `Result.Ok<T>`: Always returns `T` (guaranteed by type system)
- For general `Result<T, E>`: Returns `T | undefined`

##### Type Parameters

###### R

`R` *extends* `Readonly`\<\{ `value`: `unknown`; \}\>

The `Result.Base` type to unwrap.

##### Parameters

###### result

`R`

The `Result` to unwrap.

##### Returns

[`UnwrapOk`](#unwrapok)\<`R`\>

The success value if `Result.Ok`, otherwise `undefined`.

##### Example

```ts
const okResult = Result.ok(42);
const errResult = Result.err('oops');

// Result.unwrapOk returns the value for Ok results

assert(Result.unwrapOk(okResult) === 42);

// Result.unwrapOk returns undefined for Err results
// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
assert(Result.unwrapOk(errResult) === undefined);
```

#### Call Signature

> **unwrapOk**\<`R`\>(`result`): [`UnwrapOk`](#unwrapok)\<`R`\> \| `undefined`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:270

Unwraps a `Result`, returning the success value or `undefined` if it's an
error.

This function provides a safe way to extract success values from Results
without throwing exceptions. It has overloaded behavior based on the type:

- For `Result.Ok<T>`: Always returns `T` (guaranteed by type system)
- For general `Result<T, E>`: Returns `T | undefined`

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

##### Parameters

###### result

`R`

The `Result` to unwrap.

##### Returns

[`UnwrapOk`](#unwrapok)\<`R`\> \| `undefined`

The success value if `Result.Ok`, otherwise `undefined`.

##### Example

```ts
const okResult = Result.ok(42);
const errResult = Result.err('oops');

// Result.unwrapOk returns the value for Ok results

assert(Result.unwrapOk(okResult) === 42);

// Result.unwrapOk returns undefined for Err results
// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
assert(Result.unwrapOk(errResult) === undefined);
```

***

### unwrapOkOr()

#### Call Signature

> **unwrapOkOr**\<`R`, `D`\>(`result`, `defaultValue`): `D` \| [`UnwrapOk`](#unwrapok)\<`R`\>

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:296

Unwraps a `Result`, returning the success value or a default value if it is
`Result.Err`.

##### Type Parameters

###### R

`R` *extends* [`Base`](#base)

The `Result.Base` type to unwrap.

###### D

`D`

The type of the default value.

##### Parameters

###### result

`R`

The `Result` to unwrap.

###### defaultValue

`D`

The value to return if `result` is `Result.Err`.

##### Returns

`D` \| [`UnwrapOk`](#unwrapok)\<`R`\>

The success value if `Result.Ok`, otherwise `defaultValue`.

##### Example

```ts
const okValue = Result.ok(10);
const errValue = Result.err('fail');

assert(Result.unwrapOkOr(okValue, 0) === 10);
assert(Result.unwrapOkOr(errValue, 0) === 0);

const unwrapWithDefault = Result.unwrapOkOr(5);

assert(unwrapWithDefault(Result.ok(3)) === 3);
assert(unwrapWithDefault(Result.err('no data')) === 5);
```

#### Call Signature

> **unwrapOkOr**\<`S`, `D`\>(`defaultValue`): \<`E`\>(`result`) => `S` \| `D`

Defined in: node\_modules/.pnpm/ts-data-forge@3.3.1\_typescript@5.9.3/node\_modules/ts-data-forge/dist/functional/result.d.mts:297

Unwraps a `Result`, returning the success value or a default value if it is
`Result.Err`.

##### Type Parameters

###### S

`S`

###### D

`D`

The type of the default value.

##### Parameters

###### defaultValue

`D`

The value to return if `result` is `Result.Err`.

##### Returns

The success value if `Result.Ok`, otherwise `defaultValue`.

> \<`E`\>(`result`): `S` \| `D`

###### Type Parameters

###### E

`E`

###### Parameters

###### result

[`Result`](../README.md#result)\<`S`, `E`\>

###### Returns

`S` \| `D`

##### Example

```ts
const okValue = Result.ok(10);
const errValue = Result.err('fail');

assert(Result.unwrapOkOr(okValue, 0) === 10);
assert(Result.unwrapOkOr(errValue, 0) === 0);

const unwrapWithDefault = Result.unwrapOkOr(5);

assert(unwrapWithDefault(Result.ok(3)) === 3);
assert(unwrapWithDefault(Result.err('no data')) === 5);
```
