[**Documentation**](../README.md)

---

[Documentation](../README.md) / functional/pipe

# functional/pipe

## Functions

### pipe()

#### Call Signature

> **pipe**\<`A`\>(`a`): `PipeWithMapOptional`\<`A`\>

Defined in: [src/functional/pipe.mts:121](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/pipe.mts#L121)

Creates a new pipe object that allows for chaining operations on a value.

This function provides a fluent interface for applying transformations to values,
with intelligent method selection based on the input type:

- For `Optional` values: Provides `mapOptional` for safe Optional transformations
- For other values: Provides `mapNullable` for null-safe transformations
- All types get the basic `map` method for general transformations

The pipe maintains type safety throughout the chain, automatically selecting
the appropriate overload based on the current value type.

##### Type Parameters

###### A

`A` _extends_ [`Base`](optional/namespaces/Optional.md#base)

The type of the initial value to wrap in a pipe.

##### Parameters

###### a

`A`

The initial value to wrap in a pipe.

##### Returns

`PipeWithMapOptional`\<`A`\>

A pipe object with chaining methods appropriate for the value type.

##### Examples

Basic value transformation chaining:

```ts
// Simple sequential transformations
const result = pipe(10)
    .map((x) => x * 2) // 20
    .map((x) => x + 5) // 25
    .map((x) => x.toString()).value; // '25'
assert(result === '25');

// String processing pipeline
const processed = pipe('  Hello World  ')
    .map((s) => s.trim()) // "Hello World"
    .map((s) => s.toLowerCase()) // "hello world"
    .map((s) => s.split(' ')) // ["hello", "world"]
    .map((arr) => arr.join('-')).value; // "hello-world"
assert(processed === 'hello-world');
```

Nullable value handling with automatic null checking:

```ts
// Safe operations on potentially nullish values
const maybeNumber: number | undefined = 10;
const result = pipe(maybeNumber)
    .mapNullable((x) => x * 2) // Only applies if not null
    .mapNullable((x) => `Result: ${x}`).value; // Only applies if previous step succeeded // 'Result: 20' or undefined
assert(result === 'Result: 20');

// Handling null values
const nullValue: number | null = null;
const nullResult = pipe(nullValue).mapNullable((x) => x * 2).value;
assert(nullResult === undefined);
```

Optional value handling with monadic operations:

```ts
// Working with Optional types
const optional = Optional.some(42);
const result = pipe(optional)
    .mapOptional((x) => x / 2) // Optional.some(21)
    .mapOptional((x) => Math.sqrt(x)).value; // Optional.some(~4.58) // Optional.some(4.58...)
assert(Optional.isSome(result) === true);
assert(Math.abs(Optional.unwrap(result)! - Math.sqrt(21)) < 0.01);

// Optional with None
const noneOptional = Optional.none;
const noneResult = pipe(noneOptional).mapOptional((x) => x * 2).value;
assert(Optional.isNone(noneResult) === true);
```

Mixed type transformations:

```ts
// Starting with a string, transforming through different types
const complex = pipe('hello')
    .map((s) => s.length) // number: 5
    .map((n) => (n > 3 ? n : undefined)) // number | undefined: 5
    .mapNullable((n) => n * 10).value; // number: 50 (or undefined if undefined) // 50 or undefined
assert(complex === 50);

// Short string case
const shortString = pipe('hi')
    .map((s) => s.length) // number: 2
    .map((n) => (n > 3 ? n : undefined)) // number | undefined: undefined
    .mapNullable((n) => n * 10).value; // undefined
assert(shortString === undefined);
```

Error-safe computation chains:

```ts
// Building complex computations safely
const maybeNumber: number | undefined = 25;
const result = pipe(maybeNumber)
    .mapNullable((n) => (n > 0 ? n : undefined)) // Positive numbers only
    .mapNullable((n) => Math.sqrt(n)) // Safe square root
    .mapNullable((n) => (n < 100 ? n : undefined)) // Limit result
    .mapNullable((n) => Math.round(n * 100) / 100).value; // Round to 2 decimals // number | undefined

assert(result === 5); // sqrt(25) = 5

const negativeNumber: number | undefined = -5;
const negativeResult = pipe(negativeNumber).mapNullable((n) =>
    n > 0 ? n : undefined,
).value;
assert(negativeResult === undefined); // negative number
```

#### Call Signature

> **pipe**\<`A`\>(`a`): `PipeBase`\<`A`\>

Defined in: [src/functional/pipe.mts:125](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/pipe.mts#L125)

Creates a new pipe object that allows for chaining operations on a value.

This function provides a fluent interface for applying transformations to values,
with intelligent method selection based on the input type:

- For `Optional` values: Provides `mapOptional` for safe Optional transformations
- For other values: Provides `mapNullable` for null-safe transformations
- All types get the basic `map` method for general transformations

The pipe maintains type safety throughout the chain, automatically selecting
the appropriate overload based on the current value type.

##### Type Parameters

###### A

`A`

The type of the initial value to wrap in a pipe.

##### Parameters

###### a

`A`

The initial value to wrap in a pipe.

##### Returns

`PipeBase`\<`A`\>

A pipe object with chaining methods appropriate for the value type.

##### Examples

Basic value transformation chaining:

```ts
// Simple sequential transformations
const result = pipe(10)
    .map((x) => x * 2) // 20
    .map((x) => x + 5) // 25
    .map((x) => x.toString()).value; // '25'
assert(result === '25');

// String processing pipeline
const processed = pipe('  Hello World  ')
    .map((s) => s.trim()) // "Hello World"
    .map((s) => s.toLowerCase()) // "hello world"
    .map((s) => s.split(' ')) // ["hello", "world"]
    .map((arr) => arr.join('-')).value; // "hello-world"
assert(processed === 'hello-world');
```

Nullable value handling with automatic null checking:

```ts
// Safe operations on potentially nullish values
const maybeNumber: number | undefined = 10;
const result = pipe(maybeNumber)
    .mapNullable((x) => x * 2) // Only applies if not null
    .mapNullable((x) => `Result: ${x}`).value; // Only applies if previous step succeeded // 'Result: 20' or undefined
assert(result === 'Result: 20');

// Handling null values
const nullValue: number | null = null;
const nullResult = pipe(nullValue).mapNullable((x) => x * 2).value;
assert(nullResult === undefined);
```

Optional value handling with monadic operations:

```ts
// Working with Optional types
const optional = Optional.some(42);
const result = pipe(optional)
    .mapOptional((x) => x / 2) // Optional.some(21)
    .mapOptional((x) => Math.sqrt(x)).value; // Optional.some(~4.58) // Optional.some(4.58...)
assert(Optional.isSome(result) === true);
assert(Math.abs(Optional.unwrap(result)! - Math.sqrt(21)) < 0.01);

// Optional with None
const noneOptional = Optional.none;
const noneResult = pipe(noneOptional).mapOptional((x) => x * 2).value;
assert(Optional.isNone(noneResult) === true);
```

Mixed type transformations:

```ts
// Starting with a string, transforming through different types
const complex = pipe('hello')
    .map((s) => s.length) // number: 5
    .map((n) => (n > 3 ? n : undefined)) // number | undefined: 5
    .mapNullable((n) => n * 10).value; // number: 50 (or undefined if undefined) // 50 or undefined
assert(complex === 50);

// Short string case
const shortString = pipe('hi')
    .map((s) => s.length) // number: 2
    .map((n) => (n > 3 ? n : undefined)) // number | undefined: undefined
    .mapNullable((n) => n * 10).value; // undefined
assert(shortString === undefined);
```

Error-safe computation chains:

```ts
// Building complex computations safely
const maybeNumber: number | undefined = 25;
const result = pipe(maybeNumber)
    .mapNullable((n) => (n > 0 ? n : undefined)) // Positive numbers only
    .mapNullable((n) => Math.sqrt(n)) // Safe square root
    .mapNullable((n) => (n < 100 ? n : undefined)) // Limit result
    .mapNullable((n) => Math.round(n * 100) / 100).value; // Round to 2 decimals // number | undefined

assert(result === 5); // sqrt(25) = 5

const negativeNumber: number | undefined = -5;
const negativeResult = pipe(negativeNumber).mapNullable((n) =>
    n > 0 ? n : undefined,
).value;
assert(negativeResult === undefined); // negative number
```
