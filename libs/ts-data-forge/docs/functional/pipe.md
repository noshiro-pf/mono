[**Documentation**](../README.md)

---

[Documentation](../README.md) / functional/pipe

# functional/pipe

## Variables

### pipe

> `const` **pipe**: `PipeFnOverload`

Defined in: [src/functional/pipe.mts:121](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/pipe.mts#L121)

Creates a new pipe object that allows for chaining operations on a value.

This function provides a fluent interface for applying transformations to values,
with intelligent method selection based on the input type:

- For `Optional` values: Provides `mapOptional` for safe Optional transformations
- For other values: Provides `mapNullable` for null-safe transformations
- All types get the basic `map` method for general transformations

The pipe maintains type safety throughout the chain, automatically selecting
the appropriate overload based on the current value type.

#### Template

The type of the initial value to wrap in a pipe.

#### Param

The initial value to wrap in a pipe.

#### Returns

A pipe object with chaining methods appropriate for the value type.

#### Examples

Basic value transformation chaining:

```typescript
// Simple sequential transformations
const result = pipe(10)
    .map((x) => x * 2) // 20
    .map((x) => x + 5) // 25
    .map((x) => x.toString()).value; // '25'

// String processing pipeline
const processed = pipe('  Hello World  ')
    .map((s) => s.trim()) // "Hello World"
    .map((s) => s.toLowerCase()) // "hello world"
    .map((s) => s.split(' ')) // ["hello", "world"]
    .map((arr) => arr.join('-')).value; // "hello-world"
```

Nullable value handling with automatic null checking:

```typescript
// Safe operations on potentially null values
const maybeNumber: number | null = getNumberFromAPI();
const result = pipe(maybeNumber)
    .mapNullable((x) => x * 2) // Only applies if not null
    .mapNullable((x) => `Result: ${x}`).value; // Only applies if previous step succeeded // 'Result: 20' or undefined

// Handling undefined values
const maybeUser: User | undefined = findUser(id);
const userName = pipe(maybeUser)
    .mapNullable((user) => user.name)
    .mapNullable((name) => name.toUpperCase()).value; // string or undefined
```

Optional value handling with monadic operations:

```typescript
// Working with Optional types
const optional = Optional.some(42);
const result = pipe(optional)
    .mapOptional((x) => x / 2) // Optional.some(21)
    .mapOptional((x) => Math.sqrt(x)).value; // Optional.some(~4.58) // Optional.some(4.58...)

// Optional chains that can become None
const parseAndProcess = (input: string) =>
    pipe(Optional.fromNullable(input))
        .mapOptional((s) => s.trim())
        .mapOptional((s) => (s.length > 0 ? s : null)) // Could become None
        .mapOptional((s) => parseInt(s, 10))
        .mapOptional((n) => (isNaN(n) ? null : n)).value; // Optional<number>
```

Mixed type transformations:

```typescript
// Starting with a string, transforming through different types
const complex = pipe('hello')
    .map((s) => s.length) // number: 5
    .map((n) => (n > 3 ? n : null)) // number | null: 5
    .mapNullable((n) => n * 10).value; // number: 50 (or undefined if null) // 50 or undefined

// API response processing
const processApiResponse = (response: ApiResponse) =>
    pipe(response)
        .map((r) => r.data) // Extract data
        .mapNullable((data) => data.user) // Safe user access
        .mapNullable((user) => user.profile) // Safe profile access
        .mapNullable((profile) => profile.avatar).value; // Safe avatar access // string | undefined
```

Error-safe computation chains:

```typescript
// Building complex computations safely
const safeCalculation = (input: unknown) =>
    pipe(input)
        .map((val) => (typeof val === 'number' ? val : null))
        .mapNullable((n) => (n > 0 ? n : null)) // Positive numbers only
        .mapNullable((n) => Math.sqrt(n)) // Safe square root
        .mapNullable((n) => (n < 100 ? n : null)) // Limit result
        .mapNullable((n) => Math.round(n * 100) / 100).value; // Round to 2 decimals // number | undefined
```
