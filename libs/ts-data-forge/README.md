# ts-data-forge

[![npm version](https://img.shields.io/npm/v/ts-data-forge.svg)](https://www.npmjs.com/package/ts-data-forge)
[![npm downloads](https://img.shields.io/npm/dm/ts-data-forge.svg)](https://www.npmjs.com/package/ts-data-forge)
[![License](https://img.shields.io/npm/l/ts-data-forge.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-data-forge/graph/badge.svg?token=69TA40HACZ)](https://codecov.io/gh/noshiro-pf/ts-data-forge)

**ts-data-forge** is a TypeScript utility library that provides type-safe functional programming utilities with zero runtime dependencies. It aims to enhance development robustness, maintainability, and correctness by leveraging TypeScript's powerful type system.

## Features

This library offers a range of utilities, including:

- **Compile-Time Type Checking**: Assert type relationships at compile time with `expectType`.
- **Immutable Collections**: Type-safe and immutable map (`IMap`), set (`ISet`) implementations.
- **Array Utilities**: A comprehensive suite of functions for array manipulation, creation, transformation, and querying.
- **Number Utilities**: Safe and convenient functions for numerical operations, including branded types and range checking.
- **Object Utilities**: Helpers for working with objects, such as shallow equality checks.
- **Functional Programming Tools**: Utilities like `pipe`, `Optional`, and `Result` to support functional programming patterns.
- **Type Guards**: A collection of type guard functions to narrow down types safely.
- **JSON Handling**: Type-safe JSON parsing and stringification.
- **And more**: Including memoization, casting utilities, and other helpful tools.

## Installation

```bash
npm install ts-data-forge
```

Or with other package managers:

```bash
# Yarn
yarn add ts-data-forge

# pnpm
pnpm add ts-data-forge
```

## TypeScript Configuration

ts-data-forge works best with strict TypeScript settings:

```json
{
    "compilerOptions": {
        "strict": true, // important
        "noUncheckedIndexedAccess": true, // important
        "noPropertyAccessFromIndexSignature": true, // important
        "noFallthroughCasesInSwitch": true,
        "noImplicitOverride": true,
        "noImplicitReturns": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "allowUnreachableCode": false,
        "allowUnusedLabels": false,
        "exactOptionalPropertyTypes": false
    }
}
```

## Core Modules

### 🎯 [Functional Programming](./documents/functional.md)

Essential FP utilities for cleaner, more reliable code.

- **Optional** - Type-safe null handling
- **Result** - Error handling without exceptions
- **Pipe** - Function composition utilities
- **match** - Pattern matching for TypeScript

### 🛡️ Type Guards

Runtime type checking with TypeScript integration.

- **Type Checks** - `isString`, `isNumber`, `isNonNullish`, etc.
- **Object Guards** - `isRecord`, `isNonNullObject`, `hasKey`
- **Utility Guards** - `isNonEmptyString`, `isPrimitive`

### 🔢 Number Utilities

Branded number types and safe arithmetic operations.

- **Branded Types** - `Int`, `Uint`, `SafeInt`, `FiniteNumber`
- **Range Types** - `Int16`, `Uint32`, `PositiveInt`, etc.
- **Math Utils** - Type-safe arithmetic operations

### 🔧 Array Operations

Type-safe array and tuple utilities with functional programming patterns.

- **Array Utils** - Comprehensive array manipulation functions
- **Tuple Utils** - Type-safe tuple operations with compile-time guarantees

### 📦 [Collections](./documents/collections.md)

Immutable data structures for safer state management.

- **IMap** - Immutable Map implementation
- **ISet** - Immutable Set implementation

And mutable Queue/Stack implementation

- **Queue** - FIFO queue with O(1) operations
- **Stack** - LIFO stack implementation

### 🔍 Other Utilities

Additional helpers for common programming tasks.

- **Type Casting** - `castMutable`, `castReadonly`
- **Utilities** - `memoizeFunction`, `mapNullable`, `unknownToString`
- **Conditionals** - `ifThen` for conditional operations

## Usage Examples

Here are some examples of how to use utilities from `ts-data-forge`:

### 1. Compile-Time Type Assertions with `expectType`

The `expectType` utility allows you to make assertions about types at compile time. This is useful for ensuring type correctness in complex type manipulations or when refactoring.

```typescript
import { expectType } from 'ts-data-forge';

type User = { id: number; name: string };
type Admin = { id: number; name: string; role: 'admin' };

// Assert that Admin extends User
expectType<Admin, User>('<=');

// Assert that User does not extend Admin
expectType<User, Admin>('!<=');

// Assert exact type equality
expectType<{ x: number }, { x: number }>('=');

// The following would cause a compile-time error:
// expectType<User, Admin>("="); // Error: Type 'User' is not strictly equal to type 'Admin'.

expectType<User, any>('!='); // Error: Comparisons with `any` are also strictly checked.
```

### 2. Functional Programming with `Optional`, `Result`, `pipe`, and `match`

Handle nullable values and error-prone operations safely.

```typescript
import { Optional, Result, pipe, match } from 'ts-data-forge';

// Optional for nullable values
const maybeValue = Optional.some(42);
const nothing = Optional.none;

const doubled = Optional.map(maybeValue, (x) => x * 2);
console.log(Optional.unwrapOr(doubled, 0)); // 84

// Result for error handling
const success = Result.ok(42);
const failure = Result.err('Something went wrong');

const mapped = Result.map(success, (x) => x * 2);
if (Result.isOk(mapped)) {
    console.log(mapped.value); // 84
}

// Advanced pipe usage
const processNumber = (input: number) =>
    pipe(input)
        .map((x) => x * 2) // Regular transformation
        .map((x) => x + 10) // Chain transformations
        .map((x) => (x > 50 ? Optional.some(x) : Optional.none)) // Convert to Optional
        .mapOptional((x) => x / 2).value; // Continue with Optional chain and get final Optional<number>

console.log(processNumber(30)); // Optional.some(35)
console.log(processNumber(10)); // Optional.none

// Pattern matching with match
type Status = 'loading' | 'success' | 'error';

const handleStatus = (status: Status, data?: string) =>
    match(status, {
        loading: 'Please wait...',
        success: `Data: ${data ?? 'No data'}`,
        error: 'An error occurred',
    });

console.log(handleStatus('loading')); // 'Please wait...'
console.log(handleStatus('success', 'Hello')); // 'Data: Hello'
console.log(handleStatus('error')); // 'An error occurred'

// Pattern matching with Result
const processResult = (result: Result<number, string>) =>
    Result.isOk(result) ? `Success: ${result.value}` : `Error: ${result.value}`;

console.log(processResult(Result.ok(42))); // 'Success: 42'
console.log(processResult(Result.err('Failed'))); // 'Error: Failed'
```

### 3. Number Utilities with `Num` and Branded Number Types

The `Num` object provides safe and convenient functions for numerical operations.

```typescript
import { Num } from 'ts-data-forge';

// Basic conversions
const num = Num.from('123'); // 123
const invalid = Num.from('abc'); // NaN

// Range checking
const inRange = Num.isInRange(0, 10);
console.log(inRange(5)); // true
console.log(inRange(0)); // true (inclusive lower bound)
console.log(inRange(10)); // false (exclusive upper bound)

// Clamping values
const clamp = Num.clamp(0, 100);
console.log(clamp(150)); // 100
console.log(clamp(-10)); // 0

// Rounding utilities
const round2 = Num.round(2);
console.log(round2(3.14159)); // 3.14

console.log(Num.roundAt(3.14159, 3)); // 3.142
console.log(Num.roundToInt(3.7) satisfies Int); // 4

// Type guards
declare const value: number;
if (Num.isNonZero(value)) {
    // value is guaranteed to be non-zero
    const result = Num.div(10, value); // Safe division
}
```

#### Branded Number Types for Enhanced Type Safety

`ts-data-forge` provides branded number types that enforce specific constraints at the type level.

```typescript
import {
    asInt,
    asUint,
    asFiniteNumber,
    asSafeInt,
    asInt16,
    asUint32,
    asNonZeroInt,
    asPositiveInt,
    Int,
    Uint,
    FiniteNumber,
    SafeInt,
    Int16,
    Uint32,
    NonZeroInt,
    PositiveInt,
} from 'ts-data-forge';

// Basic branded types
const integer = asInt(42); // Int - any integer
const unsigned = asUint(42); // Uint - non-negative integer
const finite = asFiniteNumber(3.14); // FiniteNumber - finite floating-point
const safeInt = asSafeInt(42); // SafeInt - integer in safe range

const nonInteger = asInt(3.14); // This line causes a runtime error

// Range-constrained types (16-bit, 32-bit)
const int16 = asInt16(1000); // Int16: [-32768, 32767]
const uint32 = asUint32(3000000000); // Uint32: [0, 4294967295]

// Non-zero and positive variants
const nonZeroInt = asNonZeroInt(5); // NonZeroInt - excludes zero
const positiveInt = asPositiveInt(10); // PositiveInt - excludes zero and negatives

// Type-safe arithmetic with automatic clamping
const sum = Int16.add(int16, asInt16(2000)); // Int16 (3000)
const clamped = Int16.clamp(100000); // Int16 (32767 - clamped to MAX_VALUE)

// Safe division with non-zero types
const ratio = NonZeroInt.div(asNonZeroInt(10), nonZeroInt); // No division by zero risk

// Random generation within type constraints
const randomInt16 = Int16.random(); // Int16 (random value in valid range)
```

### 4. Array Utilities with `Arr`

The `Arr` object provides a rich set of functions for array manipulation.

```typescript
import { Arr } from 'ts-data-forge';

const numbers: readonly number[] = [1, 2, 3, 4, 5, 2, 3];
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
] as const;

// Reduction
const sum = Arr.sum(numbers);
console.log(sum); // 20

// Array creation
const zeros: readonly [0, 0, 0, 0, 0] = Arr.zeros(5); // [0, 0, 0, 0, 0]
const range: readonly [1, 2, 3] = Arr.range(1, 4); // [1, 2, 3]

// Type-safe length checking
if (Arr.isArrayAtLeastLength(numbers, 2)) {
    // numbers is now guaranteed to have at least 3 elements
    expectType<typeof numbers, readonly [number, number, ...number[]]>('=');
    console.log(numbers[1]); // Safe access to index 2
}

// Take first n elements
const firstThree = Arr.take(numbers, 3); // [1, 2, 3]

// Find maximum by property
const oldestPerson = Arr.maxBy(people, (person) => person.age);
console.log(oldestPerson?.name); // 'Charlie'

// Remove duplicates
const unique = Arr.uniq(numbers); // [1, 2, 3, 4, 5]
```

### 5. Immutable Collections: `IMap` and `ISet`

Type-safe, immutable data structures.

```typescript
import { IMap, ISet, pipe } from 'ts-data-forge';

// IMap usage - immutable operations
const originalMap = IMap.create<string, number>([]);
const mapWithOne = originalMap.set('one', 1);
const mapWithTwo = mapWithOne.set('two', 2);

// Original map is unchanged
console.log(originalMap.size); // 0
console.log(mapWithTwo.get('one')); // Optional.some(1)
console.log(mapWithTwo.has('three')); // false

// Using pipe for fluent updates
const idMap = pipe(Arr.seq(10))
    .map(Arr.map<number>(i => [i, i.toString()])
     .map(Arr.skip(1)) // [ [1, "1"], ..., [9, "9"]]
    .map(IMap.create<number, string>).value;

console.log(idMap.size); // 9

// Efficient batch updates with withMutations
const idMapUpdated = idMap.withMutations([
    { type: 'set', key: 99, value: "99" },
    { type: 'update', key: 5, value: "five" },
    { type: 'delete', key: 4 },
]);

console.log(idMapUpdated.size); // 9

// ISet usage
const originalSet = ISet.create<number>([]);
const setWithItems = originalSet.add(1).add(2).add(1); // Duplicate ignored

console.log(originalSet.size); // 0 (unchanged)
console.log(setWithItems.has(1)); // true
console.log(setWithItems.size); // 2
```

### 6. Type Guards

Safe type narrowing with comprehensive type guards.

```typescript
import { isNonNullObject, isRecord, hasKey } from 'ts-data-forge';

function processData(data: unknown) {
    if (isRecord(data)) {
        // data is now UnknownRecord (= Readonly<Record<string, unknown>>)
        if (
            hasKey(data, 'name') &&
            // data is now ReadonlyRecord<"name", unknown> & UnknownRecord
            typeof data.name === 'string'
        ) {
            console.log(`Hello, ${data.name}!`);
        }
    }
}

// Non-null object checking
declare const value: unknown;
if (isNonNullObject(value)) {
    // value is guaranteed to be a non-null object
    console.log(Object.keys(value));
}
```

### 7. Iteration with `range`

Generate ranges for iteration and array creation.

```typescript
import { range } from 'ts-data-forge';

// Traditional for loop using range
for (const i of range(0, 5)) {
    console.log(i); // 0, 1, 2, 3, 4
}

// Create arrays from ranges
const numbers = Array.from(range(1, 4)); // [1, 2, 3]
const squares = Array.from(range(1, 6), (x) => x * x); // [1, 4, 9, 16, 25]

// Step ranges
for (const i of range(0, 10, 2)) {
    console.log(i); // 0, 2, 4, 6, 8
}
```

### 8. Mutability Utilities with `castMutable`

Safely work with readonly types when interfacing with mutable APIs.

```tsx
import { Autocomplete } from '@mui/material';
import { castMutable } from 'ts-data-forge';

const readonlyOptions: readonly string[] = ['Option 1', 'Option 2', 'Option 3'];

const SomeComponent: React.FC = () => {
    // Component implementation
    return (
        <Autocomplete
            // Use castMutable to safely pass readonly array to mutable API. This is safer than casting with `as`, as it simply changes type `readonly T[]` to `T[]`.
            options={castMutable(readonlyOptions)}
            // ...
        />
    );
};

// Immer.js example - draft properties need mutable types
import { produce } from 'immer';

type State = Readonly<{
    items: readonly string[];
}>;

const initialState: State = {
    items: ['item1', 'item2'],
} as const;

const newItems: readonly string[] = ['newItem1', 'newItem2'];

const updatedState = produce(initialState, (draft) => {
    // draft.items expects mutable array, but newItems is readonly
    draft.items = castMutable(newItems); // Safe cast for assignment
});

console.log(updatedState.items); // ['newItem1', 'newItem2']
```

## Modules Overview

- **`expect-type`**: Compile-time type assertion utilities for testing and verification.
- **`guard`**: Type guard functions for safe type narrowing (e.g., `isNonNullObject`, `isRecord`).
- **`functional`**: Functional programming helpers like `Optional`, `Result`, `pipe`, and `match`.
- **`number`**: Comprehensive numerical utilities including the `Num` namespace and an extensive collection of branded number types (`Int`, `Uint`, `SafeInt`, `Int16`, `Int32`, `Uint16`, `Uint32`, `NonZeroInt`, `PositiveInt`, `NonNegativeFiniteNumber`, etc.) with type-safe arithmetic operations, range checking, and automatic clamping.
- **`array`**: Utilities for working with arrays and tuples, including creation, transformation, and type-safe operations.
- **`object`**: Utilities for working with records/objects (e.g., `Obj.shallowEq`).
- **`json`**: Type-safe JSON parsing and stringification utilities.
- **`collections`**: Immutable data structures like `IMap`, `ISet`, and `Queue` with full type safety.
- **`iterator`**: Utilities for working with iterators and generators (e.g., `range`).
- **`others`**: Miscellaneous utilities like `castMutable`, `castReadonly`, `ifThen`, `mapNullable`, `memoizeFunction`, `tuple`, `unknownToString`.

## Key Benefits

- **Type Safety**: All utilities are designed with TypeScript's type system in mind, providing compile-time guarantees.
- **Immutability**: Data structures and operations promote immutable patterns for safer, more predictable code.
- **Functional Programming**: Support for functional programming paradigms with utilities like `Optional`, `Result`, and `pipe`.
- **Zero Runtime Dependencies**: The library has no external runtime dependencies, keeping your bundle size minimal.
- **Comprehensive Testing**: All utilities are thoroughly tested with both runtime and compile-time tests.

**Important Notes:**

- This library **only supports ESM (ES Modules)**. CommonJS is not supported.
- This library uses advanced TypeScript features, including branded types for enhanced type safety. Some functions require specific branded types as parameters (such as `Uint32` in `newArray`). The examples above use the small literal numeric values specifically allowed in each function for brevity, but in actual use you should use the provided type conversion functions (such as `asUint32`) or cast to the appropriate branded type, for example `as Uint32`.

## Removing `expectType` in Production

Since `expectType` is only used for compile-time type checking, you should remove these calls in production builds for better performance.

### Rollup Configuration

```javascript
import rollupPluginStrip from '@rollup/plugin-strip';

export default {
    // ... other config
    plugins: [
        // ... other plugins
        rollupPluginStrip({
            functions: ['expectType'],
            include: '**/*.(mts|ts|mjs|js)',
        }),
    ],
};
```

### Vite Configuration

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
    // ... other config
    build: {
        terserOptions: {
            compress: {
                pure_funcs: ['expectType'],
            },
        },
    },
});
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## License

This project is licensed under the [Apache License 2.0](./LICENSE).
