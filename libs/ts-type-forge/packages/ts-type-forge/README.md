# ts-type-forge

[![npm version](https://img.shields.io/npm/v/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)

## Documentation

- API reference: <https://noshiro-pf.github.io/ts-type-forge/>

[![npm downloads](https://img.shields.io/npm/dm/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![License](https://img.shields.io/npm/l/ts-type-forge.svg)](./LICENSE)

**ts-type-forge** is a comprehensive TypeScript type utility library that provides powerful type-level operations with zero runtime cost. It enhances TypeScript development by offering advanced type manipulations, strict type checking utilities, and comprehensive type safety features.

## Features

This library offers a comprehensive suite of type-level utilities, including:

- **Advanced Type Utilities**: Enhanced versions of built-in types like [`StrictExclude`](./src/record/std.mts#L86), [`StrictOmit`](./src/record/std.mts#L120), [`ReadonlyRecord`](./src/record/std.mts#L155), and many more.
- **Compile-Time Type Checking**: Assert type relationships at compile time with comprehensive condition types.
- **Branded Types**: Extensive collection of branded number types (`Int`, `Uint`, `SafeInt`, `FiniteNumber`, etc.) for enhanced type safety.
- **Array and Tuple Utilities**: Type-safe operations with `List` and `Tuple` namespaces for complex array manipulations.
- **Record Manipulation**: Deep operations like `DeepReadonly`, `DeepPartial`, and advanced path-based record updates.
- **Type-Level Arithmetic**: Integer operations, ranges (`UintRange`), and mathematical type computations.
- **Global Type Availability**: **No need for import statements** when using Triple-Slash Directives.
- **Zero Runtime Cost**: Pure type-level operations with no runtime dependencies.
- **Comprehensive Testing**: Thoroughly tested for type correctness with custom type-testing utilities.

## Installation

```bash
npm add --save-dev ts-type-forge
```

Or with other package managers:

```bash
# Yarn
yarn add --dev ts-type-forge

# pnpm
pnpm add --save-dev ts-type-forge
```

## TypeScript Configuration

ts-type-forge works best with strict TypeScript settings:

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

## How to use

There are two ways to use the types provided by `ts-type-forge`:

1. **Explicit Imports (Recommended — side-effect free):**
   Import the types you need by name. Only the imported types come into scope; nothing else from `ts-type-forge` is added to the global namespace, so the package can be loaded without affecting the rest of your project.

    ```ts
    // src/types/dice.ts
    import { type UintRange } from 'ts-type-forge';

    export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
    ```

2. **Triple-Slash Directive (opt-in to ambient access):**
   When you prefer ambient access, add `/// <reference types="ts-type-forge/global" />` to any `.ts` file in your project (e.g., `globals.d.ts` or at the top of a frequently used file included in the tsconfig.json). This makes every type provided by `ts-type-forge` globally available throughout your project — useful for prototyping or for projects that already rely on ambient typings.

    ```ts
    // src/globals.d.ts or any other .ts file
    /// <reference types="ts-type-forge/global" />

    // src/types/dice.ts
    // No import needed
    export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
    ```

## Core Modules

### 🎯 Type Conditions and Predicates

Essential type-level conditional logic for advanced type operations.

- **Type Equality** - `TypeEq` for exact type matching
- **Type Extensions** - `TypeExtends` for subtype relationships
- **Union Detection** - `IsUnion` for union type identification
- **Never Detection** - `IsNever` for never type checking

### 🔧 Record and Object Types

Advanced object type manipulations with strict type safety.

- **Strict Operations** - `StrictOmit`, `StrictPick`, `StrictExclude` with key validation
- **Deep Operations** - `DeepReadonly`, `DeepPartial`, `DeepRequired`
- **Partial Utilities** - `PartiallyPartial`, `PartiallyOptional`, `PartiallyRequired`
- **Record Paths** - `RecordPaths`, `RecordValueAtPath` for type-safe property access

### 🔢 Branded Number Types

Comprehensive branded types for enhanced numeric type safety.

- **Basic Types** - `Int`, `Uint`, `SafeInt`, `FiniteNumber`
- **Range Types** - `Int16`, `Int32`, `Uint16`, `Uint32`
- **Constraint Types** - `PositiveInt`, `NonZeroInt`, `NonNegativeInt`
- **Floating Point** - `Float32`, `Float64` with proper constraints

### 📋 Array and Tuple Operations

Type-safe array and tuple utilities with functional programming patterns.

- **Array Types** - `NonEmptyArray`, `FixedLengthTuple`, `MinLengthTuple`
- **List Namespace** - Comprehensive list operations (Head, Tail, Take, Skip, etc.)
- **Tuple Namespace** - Type-safe tuple manipulations with compile-time guarantees

### 🧮 Type-Level Arithmetic

Mathematical operations performed entirely at the type level.

- **Integer Operations** - `Increment`, `Decrement`, `AbsoluteValue`
- **Ranges** - `UintRange`, `UintRangeInclusive`, `IntRange`, `IntRangeInclusive` for precise numeric constraints
- **Comparisons** - `Max`, `Min` for type-level comparisons

### 🌐 Constants and Primitives

Pre-defined type constants for common use cases.

- **Basic Constants** - `Primitive`, `FalsyValue`, `UnknownRecord`
- **Web Types** - `HTTPRequestMethod` for web development
- **Numeric Enums** - `MonthEnum`, `DateEnum`, `HoursEnum`, etc.

## Usage Examples

Here are detailed examples showcasing the power of ts-type-forge's type utilities.

For a comprehensive list of all available types and their detailed documentation, please refer to the [API Reference](#api-reference) section.

### 1. Type-Level Conditional Logic with `TypeEq` and `TypeExtends`

The type utilities allow you to perform complex type checking and assertions at compile time.

```tsx
// No import needed if using triple-slash directive
// import type { TypeEq, TypeExtends } from 'ts-type-forge'; // if importing explicitly

type User = { id: number; name: string };

type Admin = { id: number; name: string; role: 'admin' };

// Check exact type equality
type IsExactMatch = TypeEq<User, Admin>; // false

type IsSameType = TypeEq<User, User>; // true

// Check type extension relationships
type AdminExtendsUser = TypeExtends<Admin, User>; // true

type UserExtendsAdmin = TypeExtends<User, Admin>; // false

// Use in conditional types
type GetUserType<T> =
    TypeExtends<T, Admin> extends true
        ? 'admin'
        : TypeExtends<T, User> extends true
          ? 'user'
          : 'unknown';

type AdminType = GetUserType<Admin>; // 'admin'

type UserType = GetUserType<User>; // 'user'
```

### 2. Deep Object Manipulation with `DeepReadonly` and `DeepPartial`

Transform nested object types with precise control over mutability and optionality.

```tsx
type Config = {
    port: number;
    database: {
        host: string;
        port: number;
        credentials?: {
            user: string;
            pass: string;
        };
    };
    features: string[];
};

// Create a type where all properties, nested or not, are readonly
type ReadonlyConfig = DeepReadonly<Config>;

const config: ReadonlyConfig = {
    port: 8080,
    database: {
        host: 'localhost',
        port: 5432,
        credentials: {
            user: 'admin',
            pass: 'secret',
        },
    },
    features: ['featureA', 'featureB'],
};

// @ts-expect-error Cannot assign to 'port' because it is a read-only property
config.port = 8081;

// @ts-expect-error Cannot assign to 'host' because it is a read-only property
config.database.host = 'remote';

// @ts-expect-error Property 'push' does not exist on type 'readonly string[]'
config.features.push('featureC');

// Create a type where all properties are optional (useful for partial updates)
type PartialConfig = DeepPartial<Config>;

const partialUpdate: PartialConfig = {
    database: {
        host: 'new-host', // Only update specific fields
        // port and credentials are optional
    },
    // port and features are optional
};
```

### 3. Strict Type Operations with `StrictOmit`

Enhanced versions of built-in `Omit` utility that provide compile-time key validation.

```tsx
type UserProfile = Readonly<{
    id: string;
    username: string;
    email: string;
    lastLogin: Date;
    bio?: string;
}>;

// StrictOmit ensures keys actually exist in the source type
type UserCreationData = StrictOmit<UserProfile, 'id' | 'lastLogin'>;

expectType<
    UserCreationData,
    // Result:
    Readonly<{
        username: string;
        email: string;
        bio?: string | undefined;
    }>
>('=');

const newUser: UserCreationData = {
    username: 'jane_doe',
    email: 'jane@example.com',
    bio: 'Software Developer', // Optional
};

// @ts-expect-error 'nonExistentKey' doesn't exist:
type InvalidOmit = StrictOmit<UserProfile, 'id' | 'nonExistentKey'>;
```

### 4. Array Type Safety with `NonEmptyArray` and `List` Operations

Guarantee array constraints and perform type-safe operations on collections.

```tsx
type Post = Readonly<{
    title: string;
    content: string;
}>;

// A blog must have at least one post
type Blog = Readonly<{
    name: string;
    posts: NonEmptyArray<Post>; // Ensures posts array is never empty
}>;

// `NonEmptyArray<A>` is brand-based (an alias of `MinLengthArray<1, A>`), so a
// value is obtained via a runtime guard or an explicit cast rather than a plain
// array literal.
const myBlog: Blog = {
    name: 'My Tech Journey',
    posts: [
        // This array must have at least one element
        { title: 'First Post', content: 'Hello world!' },
        { title: 'Understanding TypeScript', content: '...' },
    ] as unknown as NonEmptyArray<Post>,
};

// This would cause a type error:
const emptyBlog: Blog = {
    name: 'Empty Thoughts',
    // @ts-expect-error `[]` lacks the `MinLength` brand required by NonEmptyArray
    posts: [],
};

const getFirstPostTitle = (posts: NonEmptyArray<Post>): string =>
    posts[0].title; // Safe to access posts[0] - guaranteed to exist

// Advanced List operations at the type level
type NumberList = readonly [1, 2, 3, 4, 5];

type FirstElement = List.Head<NumberList>; // 1

type LastElement = List.Last<NumberList>; // 5

type WithoutFirst = List.Tail<NumberList>; // readonly [2, 3, 4, 5]

type FirstThree = List.Take<3, NumberList>; // readonly [1, 2, 3]

type Reversed = List.Reverse<NumberList>; // readonly [5, 4, 3, 2, 1]

// Combine operations
type LastThreeReversed = List.Reverse<List.TakeLast<3, NumberList>>; // readonly [5, 4, 3]
```

### 5. Type-Safe JSON Handling with `JsonValue`

Safely represent and work with JSON data structures.

```tsx
const jsonString =
    '{"name": "Alice", "age": 30, "isAdmin": false, "tags": ["user", "active"], "metadata": null}';

try {
    // Cast the result of JSON.parse to JsonValue for type safety
    const parsedData = JSON.parse(jsonString) as JsonValue;

    // Use type guards to safely work with parsed data
    if (
        typeof parsedData === 'object' &&
        parsedData !== null &&
        !Array.isArray(parsedData)
    ) {
        // parsedData is now known to be JsonObject
        const jsonObj = parsedData as JsonObject;

        console.log(jsonObj['name']); // Access properties safely

        if (typeof jsonObj['age'] === 'number') {
            console.log(`Age: ${jsonObj['age']}`);
        }

        if (Array.isArray(jsonObj['tags'])) {
            for (const tag of jsonObj['tags']) {
                if (typeof tag === 'string') {
                    console.log(`Tag: ${tag}`);
                }
            }
        }
    } else if (Array.isArray(parsedData)) {
        // parsedData is a JSON array
        for (const item of parsedData) {
            console.log(item);
        }
    }
} catch (error) {
    console.error('Failed to parse JSON:', error);
}

// Define API response types using JsonValue
type ApiResponse = JsonObject &
    Readonly<{
        status: 'success' | 'error';
        data?: JsonValue;
        message?: string;
    }>;
```

### 6. Precise Numeric Ranges with `UintRange` and Branded Types

Define exact numeric constraints and enhance type safety with branded number types.

```tsx
/**
 * Parse integer with constrained radix parameter
 * @param str A string to convert into a number
 * @param radix A value between 2 and 36 that specifies the base
 */
export const parseInteger = (str: string, radix?: UintRange<2, 37>): number =>
    Number.parseInt(str, radix);

// Alternative using inclusive range
export const parseIntegerInclusive = (
    str: string,
    radix?: UintRangeInclusive<2, 36>,
): number => Number.parseInt(str, radix);

// Valid usages:
parseInteger('10'); // radix defaults to 10

parseInteger('10', 2); // Binary

parseInteger('255', 16); // Hexadecimal

parseInteger('123', 36); // Maximum base

// Invalid usages (TypeScript will error):
// @ts-expect-error Argument of type '1' is not assignable to parameter of type 'UintRange<2, 37> | undefined'
parseInteger('10', 1);

// @ts-expect-error Argument of type '37' is not assignable to parameter of type 'UintRange<2, 37> | undefined'
parseInteger('10', 37);

// Branded types for additional safety
type UserId = Brand<number, 'UserId'>;

type ProductId = Brand<number, 'ProductId'>;

// Create branded values (you would typically have constructor functions)
declare const userId: UserId;

declare const productId: ProductId;

// Type-safe functions that can't mix up IDs
const getUserById = (id: UserId): User | undefined => {
    /* ... */

    return undefined;
};

const getProductById = (id: ProductId): Product | undefined => {
    /* ... */

    return undefined;
};

// @ts-expect-error Argument of type 'ProductId' is not assignable to parameter of type 'UserId'
getUserById(productId);
```

## Modules Overview

The library is organized into logical modules for easy navigation and understanding:

- **`condition/`**: Type predicates like `TypeEq`, `TypeExtends`, `IsUnion`, `IsNever` for conditional type logic.
- **`record/`**: Object type utilities including `StrictOmit`, `DeepReadonly`, `RecordPaths`, and partial operations.
- **`branded-types/`**: Comprehensive branded number types (`Int`, `Uint`, `SafeInt`, `FiniteNumber`, etc.) with range constraints.
- **`tuple-and-list/`**: Array and tuple operations with `List` and `Tuple` namespaces for type-safe manipulations.
- **`type-level-integer/`**: Mathematical operations like `Increment`, `UintRange`, `AbsoluteValue` performed at the type level.
- **`constants/`**: Pre-defined constants like `Primitive`, `FalsyValue`, `HTTPRequestMethod`, and enum types.
- **`others/`**: Utility types like `JsonValue`, `Mutable`, `WidenLiteral`, and helper functions.

## Key Benefits

- **Type Safety**: All utilities are designed with TypeScript's advanced type system, providing compile-time guarantees.
- **Zero Runtime Cost**: Pure type-level operations with no runtime dependencies or overhead.
- **Comprehensive Coverage**: From basic utilities to advanced type manipulations for complex scenarios.
- **Global Availability**: Use triple-slash directives to make types available without explicit imports.
- **Extensive Testing**: All utilities are thoroughly tested with custom type-testing framework.
- **Strict Validation**: Enhanced versions of built-in types with compile-time key validation.

## API Reference

For detailed information on all types, see the [Full API Reference](./docs/README.md).

### Overview of All Types (with source code links)

<!-- AUTO-GENERATED TYPES START -->

- src/branded-types/brand.mts
    - [UnknownBrand](./src/branded-types/brand.mts#L7)
    - [Brand](./src/branded-types/brand.mts#L56)
    - [UnwrapBrandTrueKeys](./src/branded-types/brand.mts#L77)
    - [UnwrapBrandFalseKeys](./src/branded-types/brand.mts#L91)
    - [UnwrapBrandBooleanKeys](./src/branded-types/brand.mts#L108)
    - [UnwrapBrandKeys](./src/branded-types/brand.mts#L123)
    - [GetBrandKeysPart](./src/branded-types/brand.mts#L138)
    - [GetBrandValuePart](./src/branded-types/brand.mts#L158)
    - [ExtendBrand](./src/branded-types/brand.mts#L189)
    - [ChangeBaseBrand](./src/branded-types/brand.mts#L220)
    - [IntersectBrand](./src/branded-types/brand.mts#L247)
    - [NormalizeBrandUnion](./src/branded-types/brand.mts#L272)
- src/branded-types/predefined-arrays/length-constrained-array-bounds.mts
    - [HasLengthConstraint](./src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L35)
    - [LengthConstraintBrandOf](./src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L50)
    - [MinLengthOf](./src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L79)
    - [MaxLengthOf](./src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L109)
    - [ChangeArrayElement](./src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L170)
- src/branded-types/predefined-arrays/length-constrained-array-ops.mts
    - [ConstrainedList.Reverse](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L102)
    - [ConstrainedList.SetAt](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L115)
    - [ConstrainedList.Tail](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L125)
    - [ConstrainedList.ButLast](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L135)
    - [ConstrainedList.Take](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L148)
    - [ConstrainedList.TakeLast](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L160)
    - [ConstrainedList.Skip](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L175)
    - [ConstrainedList.SkipLast](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L187)
    - [ConstrainedList.Concat](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L202)
    - [ConstrainedList.Zip](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L222)
    - [ConstrainedList.Head](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L247)
    - [ConstrainedList.Last](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L263)
    - [ConstrainedList.Partition](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L278)
    - [FromBounds](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L316)
    - [NormalizeLengthConstraint](./src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L377)
- src/branded-types/predefined-arrays/length-constrained-array.mts
    - [StructuralPrefixCap](./src/branded-types/predefined-arrays/length-constrained-array.mts#L29)
    - [StructuralPrefixLength](./src/branded-types/predefined-arrays/length-constrained-array.mts#L39)
    - [MaxLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L97)
    - [MutableMaxLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L136)
    - [MinLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L200)
    - [MutableMinLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L240)
    - [BoundedLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L281)
    - [MutableBoundedLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L316)
    - [FixedLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L354)
    - [MutableFixedLengthArray](./src/branded-types/predefined-arrays/length-constrained-array.mts#L391)
- src/branded-types/predefined-numbers/bigint.mts
    - [BigInt64](./src/branded-types/predefined-numbers/bigint.mts#L18)
    - [BigUint64](./src/branded-types/predefined-numbers/bigint.mts#L33)
- src/branded-types/predefined-numbers/core.mts
    - [NaNType](./src/branded-types/predefined-numbers/core.mts#L58)
    - [ValidNumber](./src/branded-types/predefined-numbers/core.mts#L81)
    - [NonZeroNumber](./src/branded-types/predefined-numbers/core.mts#L101)
    - [NonNegativeNumber](./src/branded-types/predefined-numbers/core.mts#L121)
    - [PositiveNumber](./src/branded-types/predefined-numbers/core.mts#L140)
    - [NonPositiveNumber](./src/branded-types/predefined-numbers/core.mts#L160)
    - [NegativeNumber](./src/branded-types/predefined-numbers/core.mts#L179)
- src/branded-types/predefined-numbers/finite-number.mts
    - [FiniteNumber](./src/branded-types/predefined-numbers/finite-number.mts#L30)
    - [InfiniteNumber](./src/branded-types/predefined-numbers/finite-number.mts#L50)
    - [POSITIVE_INFINITY](./src/branded-types/predefined-numbers/finite-number.mts#L71)
    - [NEGATIVE_INFINITY](./src/branded-types/predefined-numbers/finite-number.mts#L92)
    - [NonNegativeFiniteNumber](./src/branded-types/predefined-numbers/finite-number.mts#L111)
    - [PositiveFiniteNumber](./src/branded-types/predefined-numbers/finite-number.mts#L129)
    - [NegativeFiniteNumber](./src/branded-types/predefined-numbers/finite-number.mts#L146)
    - [NonZeroFiniteNumber](./src/branded-types/predefined-numbers/finite-number.mts#L161)
    - [NonPositiveFiniteNumber](./src/branded-types/predefined-numbers/finite-number.mts#L175)
- src/branded-types/predefined-numbers/float.mts
    - [Float16](./src/branded-types/predefined-numbers/float.mts#L22)
    - [Float32](./src/branded-types/predefined-numbers/float.mts#L43)
    - [Float64](./src/branded-types/predefined-numbers/float.mts#L61)
- src/branded-types/predefined-numbers/int.mts
    - [Int](./src/branded-types/predefined-numbers/int.mts#L34)
    - [NonZeroInt](./src/branded-types/predefined-numbers/int.mts#L50)
    - [NonNegativeInt](./src/branded-types/predefined-numbers/int.mts#L65)
    - [Uint](./src/branded-types/predefined-numbers/int.mts#L80)
    - [PositiveInt](./src/branded-types/predefined-numbers/int.mts#L96)
    - [NegativeInt](./src/branded-types/predefined-numbers/int.mts#L111)
    - [NonPositiveInt](./src/branded-types/predefined-numbers/int.mts#L126)
    - [IntWithSmallInt](./src/branded-types/predefined-numbers/int.mts#L132)
    - [NonZeroIntWithSmallInt](./src/branded-types/predefined-numbers/int.mts#L138)
    - [NonNegativeIntWithSmallInt](./src/branded-types/predefined-numbers/int.mts#L144)
    - [UintWithSmallInt](./src/branded-types/predefined-numbers/int.mts#L151)
    - [PositiveIntWithSmallInt](./src/branded-types/predefined-numbers/int.mts#L157)
    - [NegativeIntWithSmallInt](./src/branded-types/predefined-numbers/int.mts#L163)
    - [NonPositiveIntWithSmallInt](./src/branded-types/predefined-numbers/int.mts#L169)
- src/branded-types/predefined-numbers/int16.mts
    - [Int16](./src/branded-types/predefined-numbers/int16.mts#L28)
    - [NonZeroInt16](./src/branded-types/predefined-numbers/int16.mts#L46)
    - [NonNegativeInt16](./src/branded-types/predefined-numbers/int16.mts#L61)
    - [PositiveInt16](./src/branded-types/predefined-numbers/int16.mts#L76)
    - [NegativeInt16](./src/branded-types/predefined-numbers/int16.mts#L91)
    - [NonPositiveInt16](./src/branded-types/predefined-numbers/int16.mts#L106)
    - [Int16WithSmallInt](./src/branded-types/predefined-numbers/int16.mts#L112)
    - [NonZeroInt16WithSmallInt](./src/branded-types/predefined-numbers/int16.mts#L118)
    - [NonNegativeInt16WithSmallInt](./src/branded-types/predefined-numbers/int16.mts#L124)
    - [PositiveInt16WithSmallInt](./src/branded-types/predefined-numbers/int16.mts#L130)
    - [NegativeInt16WithSmallInt](./src/branded-types/predefined-numbers/int16.mts#L136)
    - [NonPositiveInt16WithSmallInt](./src/branded-types/predefined-numbers/int16.mts#L142)
- src/branded-types/predefined-numbers/int32.mts
    - [Int32](./src/branded-types/predefined-numbers/int32.mts#L29)
    - [NonZeroInt32](./src/branded-types/predefined-numbers/int32.mts#L47)
    - [NonNegativeInt32](./src/branded-types/predefined-numbers/int32.mts#L62)
    - [PositiveInt32](./src/branded-types/predefined-numbers/int32.mts#L77)
    - [NegativeInt32](./src/branded-types/predefined-numbers/int32.mts#L92)
    - [NonPositiveInt32](./src/branded-types/predefined-numbers/int32.mts#L107)
    - [Int32WithSmallInt](./src/branded-types/predefined-numbers/int32.mts#L113)
    - [NonZeroInt32WithSmallInt](./src/branded-types/predefined-numbers/int32.mts#L119)
    - [NonNegativeInt32WithSmallInt](./src/branded-types/predefined-numbers/int32.mts#L125)
    - [PositiveInt32WithSmallInt](./src/branded-types/predefined-numbers/int32.mts#L131)
    - [NegativeInt32WithSmallInt](./src/branded-types/predefined-numbers/int32.mts#L137)
    - [NonPositiveInt32WithSmallInt](./src/branded-types/predefined-numbers/int32.mts#L143)
- src/branded-types/predefined-numbers/safe-int.mts
    - [SafeInt](./src/branded-types/predefined-numbers/safe-int.mts#L31)
    - [NonZeroSafeInt](./src/branded-types/predefined-numbers/safe-int.mts#L46)
    - [SafeUint](./src/branded-types/predefined-numbers/safe-int.mts#L61)
    - [NonNegativeSafeInt](./src/branded-types/predefined-numbers/safe-int.mts#L67)
    - [PositiveSafeInt](./src/branded-types/predefined-numbers/safe-int.mts#L82)
    - [NegativeSafeInt](./src/branded-types/predefined-numbers/safe-int.mts#L96)
    - [NonPositiveSafeInt](./src/branded-types/predefined-numbers/safe-int.mts#L110)
    - [SafeIntWithSmallInt](./src/branded-types/predefined-numbers/safe-int.mts#L116)
    - [NonZeroSafeIntWithSmallInt](./src/branded-types/predefined-numbers/safe-int.mts#L122)
    - [SafeUintWithSmallInt](./src/branded-types/predefined-numbers/safe-int.mts#L128)
    - [NonNegativeSafeIntWithSmallInt](./src/branded-types/predefined-numbers/safe-int.mts#L135)
    - [PositiveSafeIntWithSmallInt](./src/branded-types/predefined-numbers/safe-int.mts#L141)
    - [NegativeSafeIntWithSmallInt](./src/branded-types/predefined-numbers/safe-int.mts#L147)
    - [NonPositiveSafeIntWithSmallInt](./src/branded-types/predefined-numbers/safe-int.mts#L153)
- src/branded-types/predefined-numbers/small-int.mts
    - [SmallInt](./src/branded-types/predefined-numbers/small-int.mts#L44)
    - [SmallUint](./src/branded-types/predefined-numbers/small-int.mts#L72)
    - [WithSmallInt](./src/branded-types/predefined-numbers/small-int.mts#L101)
    - [ExcludeSmallInt](./src/branded-types/predefined-numbers/small-int.mts#L139)
- src/branded-types/predefined-numbers/uint16.mts
    - [Uint16](./src/branded-types/predefined-numbers/uint16.mts#L22)
    - [PositiveUint16](./src/branded-types/predefined-numbers/uint16.mts#L40)
    - [NonZeroUint16](./src/branded-types/predefined-numbers/uint16.mts#L55)
    - [Uint16WithSmallInt](./src/branded-types/predefined-numbers/uint16.mts#L61)
    - [PositiveUint16WithSmallInt](./src/branded-types/predefined-numbers/uint16.mts#L67)
    - [NonZeroUint16WithSmallInt](./src/branded-types/predefined-numbers/uint16.mts#L74)
- src/branded-types/predefined-numbers/uint32.mts
    - [Uint32](./src/branded-types/predefined-numbers/uint32.mts#L23)
    - [PositiveUint32](./src/branded-types/predefined-numbers/uint32.mts#L38)
    - [NonZeroUint32](./src/branded-types/predefined-numbers/uint32.mts#L53)
    - [Uint32WithSmallInt](./src/branded-types/predefined-numbers/uint32.mts#L59)
    - [PositiveUint32WithSmallInt](./src/branded-types/predefined-numbers/uint32.mts#L65)
    - [NonZeroUint32WithSmallInt](./src/branded-types/predefined-numbers/uint32.mts#L72)
- src/branded-types/predefined-strings/length-constrained-string.mts
    - [MaxLengthString](./src/branded-types/predefined-strings/length-constrained-string.mts#L43)
    - [MinLengthString](./src/branded-types/predefined-strings/length-constrained-string.mts#L84)
    - [BoundedLengthString](./src/branded-types/predefined-strings/length-constrained-string.mts#L117)
    - [FixedLengthString](./src/branded-types/predefined-strings/length-constrained-string.mts#L138)
- src/branded-types/predefined-strings/non-empty-string.mts
    - [NonEmptyString](./src/branded-types/predefined-strings/non-empty-string.mts#L21)
- src/branded-types/supported-length.mts
    - [SupportedLengthCap](./src/branded-types/supported-length.mts#L18)
    - [SupportedLength](./src/branded-types/supported-length.mts#L35)
- src/condition/eq.mts
    - [TypeEq](./src/condition/eq.mts#L23)
- src/condition/extends.mts
    - [TypeExtends](./src/condition/extends.mts#L45)
- src/condition/is-any.mts
    - [IsAny](./src/condition/is-any.mts#L21)
    - [IsNotAny](./src/condition/is-any.mts#L35)
- src/condition/is-fixed-length-list.mts
    - [IsFixedLengthList](./src/condition/is-fixed-length-list.mts#L21)
    - [IsNotFixedLengthList](./src/condition/is-fixed-length-list.mts#L39)
- src/condition/is-never.mts
    - [IsNever](./src/condition/is-never.mts#L20)
- src/condition/is-union.mts
    - [IsUnion](./src/condition/is-union.mts#L30)
- src/condition/is-unknown.mts
    - [IsUnknown](./src/condition/is-unknown.mts#L21)
    - [IsNotUnknown](./src/condition/is-unknown.mts#L36)
- src/constants/alphabet.mts
    - [LowerAlphabet](./src/constants/alphabet.mts#L21)
    - [UpperAlphabet](./src/constants/alphabet.mts#L48)
    - [Alphabet](./src/constants/alphabet.mts#L74)
- src/constants/falsy-value.mts
    - [FalsyValue](./src/constants/falsy-value.mts#L43)
- src/constants/int-enum.mts
    - [Uint8](./src/constants/int-enum.mts#L22)
    - [Uint9](./src/constants/int-enum.mts#L39)
    - [Uint10](./src/constants/int-enum.mts#L57)
    - [Uint11](./src/constants/int-enum.mts#L66)
    - [Int8](./src/constants/int-enum.mts#L72)
    - [Int9](./src/constants/int-enum.mts#L78)
    - [Int10](./src/constants/int-enum.mts#L84)
    - [Int11](./src/constants/int-enum.mts#L93)
    - [MonthEnum](./src/constants/int-enum.mts#L127)
    - [MonthIndexEnum](./src/constants/int-enum.mts#L149)
    - [DateEnum](./src/constants/int-enum.mts#L155)
    - [DayOfWeekIndex](./src/constants/int-enum.mts#L161)
    - [DayOfWeekName](./src/constants/int-enum.mts#L167)
    - [HoursEnum](./src/constants/int-enum.mts#L196)
    - [MinutesEnum](./src/constants/int-enum.mts#L202)
    - [SecondsEnum](./src/constants/int-enum.mts#L208)
    - [MillisecondsEnum](./src/constants/int-enum.mts#L214)
    - [Sexagesimal](./src/constants/int-enum.mts#L220)
    - [Percent](./src/constants/int-enum.mts#L249)
- src/constants/primitive.mts
    - [Primitive](./src/constants/primitive.mts#L23)
- src/constants/record.mts
    - [UnknownRecord](./src/constants/record.mts#L36)
- src/constants/web.mts
    - [HTTPRequestMethod](./src/constants/web.mts#L45)
- src/entry-point.mts
- src/others/bivariant-hack.mts
    - [BivariantHack](./src/others/bivariant-hack.mts#L26)
- src/others/boolean.mts
    - [BoolNot](./src/others/boolean.mts#L26)
    - [BoolAnd](./src/others/boolean.mts#L59)
    - [BoolOr](./src/others/boolean.mts#L102)
    - [BoolEq](./src/others/boolean.mts#L128)
    - [BoolNand](./src/others/boolean.mts#L153)
    - [BoolNor](./src/others/boolean.mts#L167)
    - [BoolNeq](./src/others/boolean.mts#L182)
- src/others/json.mts
    - [JsonPrimitive](./src/others/json.mts#L17)
    - [MutableJsonValue](./src/others/json.mts#L55)
    - [JsonValue](./src/others/json.mts#L91)
    - [JsonObject](./src/others/json.mts#L117)
    - [MutableJsonObject](./src/others/json.mts#L135)
- src/others/mutable.mts
    - [Mutable](./src/others/mutable.mts#L30)
    - [ToMutableMap](./src/others/mutable.mts#L51)
    - [ToMutableSet](./src/others/mutable.mts#L72)
    - [MutableSet](./src/others/mutable.mts#L89)
    - [MutableMap](./src/others/mutable.mts#L106)
- src/others/std.mts
    - [StrictExtract](./src/others/std.mts#L16)
    - [RelaxedExtract](./src/others/std.mts#L33)
    - [StrictPick](./src/others/std.mts#L50)
    - [RelaxedPick](./src/others/std.mts#L69)
    - [StrictExclude](./src/others/std.mts#L86)
    - [RelaxedExclude](./src/others/std.mts#L103)
    - [StrictOmit](./src/others/std.mts#L120)
    - [RelaxedOmit](./src/others/std.mts#L137)
    - [ReadonlyRecord](./src/others/std.mts#L155)
    - [MutableRecord](./src/others/std.mts#L176)
- src/others/utils.mts
    - [ToString](./src/others/utils.mts#L13)
    - [ToNumber](./src/others/utils.mts#L24)
    - [ValueOf](./src/others/utils.mts#L33)
    - [Length](./src/others/utils.mts#L50)
    - [FunctionType](./src/others/utils.mts#L58)
    - [Fn](./src/others/utils.mts#L66)
    - [MonoTypeFunction](./src/others/utils.mts#L72)
    - [Reducer](./src/others/utils.mts#L80)
    - [AnyFn](./src/others/utils.mts#L90)
    - [UnionToIntersection](./src/others/utils.mts#L98)
    - [MergeIntersection](./src/others/utils.mts#L111)
    - [ExcludeFalsyValue](./src/others/utils.mts#L120)
    - [Intersection](./src/others/utils.mts#L128)
- src/others/widen-literal.mts
    - [WidenLiteral](./src/others/widen-literal.mts#L47)
- src/record/deep-pick-omit.mts
    - [DeepPick](./src/record/deep-pick-omit.mts#L21)
    - [DeepOmit](./src/record/deep-pick-omit.mts#L48)
- src/record/deep.mts
    - [DeepReadonly](./src/record/deep.mts#L26)
    - [DeepMutable](./src/record/deep.mts#L57)
    - [DeepPartial](./src/record/deep.mts#L95)
    - [DeepRequired](./src/record/deep.mts#L127)
- src/record/partial.mts
    - [PartiallyPartial](./src/record/partial.mts#L15)
    - [PartiallyOptional](./src/record/partial.mts#L29)
    - [PartiallyNullable](./src/record/partial.mts#L42)
    - [PartiallyRequired](./src/record/partial.mts#L57)
    - [OptionalKeys](./src/record/partial.mts#L103)
    - [RequiredKeys](./src/record/partial.mts#L122)
- src/record/record-path.mts
    - [RecordPathsWithIndex](./src/record/record-path.mts#L31)
    - [RecordPaths](./src/record/record-path.mts#L45)
    - [RecordPathAndValueTypeTuple](./src/record/record-path.mts#L60)
    - [RecordLeafPaths](./src/record/record-path.mts#L75)
    - [RecordLeafPathsWithIndex](./src/record/record-path.mts#L91)
    - [RecordUpdated](./src/record/record-path.mts#L110)
    - [RecordValueAtPath](./src/record/record-path.mts#L134)
    - [RecordValueAtPathWithIndex](./src/record/record-path.mts#L158)
- src/tuple-and-list/array.mts
    - [MutableNonEmptyTuple](./src/tuple-and-list/array.mts#L18)
    - [NonEmptyTuple](./src/tuple-and-list/array.mts#L31)
    - [NonEmptyArray](./src/tuple-and-list/array.mts#L46)
    - [MutableNonEmptyArray](./src/tuple-and-list/array.mts#L56)
    - [ArrayElement](./src/tuple-and-list/array.mts#L69)
- src/tuple-and-list/index-of-tuple.mts
    - [IndexOfTuple](./src/tuple-and-list/index-of-tuple.mts#L17)
    - [NegativeIndexOfTuple](./src/tuple-and-list/index-of-tuple.mts#L52)
- src/tuple-and-list/length-constrained-tuple.mts
    - [FixedLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L18)
    - [MutableFixedLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L28)
    - [MutableMinLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L47)
    - [MinLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L62)
    - [BoundedLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L109)
    - [MutableBoundedLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L125)
    - [MaxLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L149)
    - [MutableMaxLengthTuple](./src/tuple-and-list/length-constrained-tuple.mts#L164)
- src/tuple-and-list/list.mts
    - [List.Head](./src/tuple-and-list/list.mts#L19)
    - [List.Last](./src/tuple-and-list/list.mts#L32)
    - [List.ButLast](./src/tuple-and-list/list.mts#L45)
    - [List.Tail](./src/tuple-and-list/list.mts#L58)
    - [List.Reverse](./src/tuple-and-list/list.mts#L71)
    - [List.Take](./src/tuple-and-list/list.mts#L91)
    - [List.Skip](./src/tuple-and-list/list.mts#L106)
    - [List.TakeLast](./src/tuple-and-list/list.mts#L121)
    - [List.SkipLast](./src/tuple-and-list/list.mts#L136)
    - [List.SetAt](./src/tuple-and-list/list.mts#L152)
    - [List.Flatten](./src/tuple-and-list/list.mts#L167)
    - [List.Concat](./src/tuple-and-list/list.mts#L181)
    - [List.Zip](./src/tuple-and-list/list.mts#L200)
    - [List.Partition](./src/tuple-and-list/list.mts#L226)
- src/tuple-and-list/make-tuple.mts
    - [MakeTuple](./src/tuple-and-list/make-tuple.mts#L13)
- src/tuple-and-list/tuple.mts
    - [Tuple.Head](./src/tuple-and-list/tuple.mts#L17)
    - [Tuple.Last](./src/tuple-and-list/tuple.mts#L42)
    - [Tuple.ButLast](./src/tuple-and-list/tuple.mts#L60)
    - [Tuple.Tail](./src/tuple-and-list/tuple.mts#L78)
    - [Tuple.Reverse](./src/tuple-and-list/tuple.mts#L92)
    - [Tuple.Take](./src/tuple-and-list/tuple.mts#L107)
    - [Tuple.Skip](./src/tuple-and-list/tuple.mts#L123)
    - [Tuple.TakeLast](./src/tuple-and-list/tuple.mts#L139)
    - [Tuple.SkipLast](./src/tuple-and-list/tuple.mts#L154)
    - [Tuple.SetAt](./src/tuple-and-list/tuple.mts#L169)
    - [Tuple.Flatten](./src/tuple-and-list/tuple.mts#L189)
    - [Tuple.Concat](./src/tuple-and-list/tuple.mts#L213)
    - [Tuple.Zip](./src/tuple-and-list/tuple.mts#L230)
    - [Tuple.Partition](./src/tuple-and-list/tuple.mts#L249)
- src/type-level-integer/abs.mts
    - [AbsoluteValue](./src/type-level-integer/abs.mts#L17)
    - [Abs](./src/type-level-integer/abs.mts#L34)
- src/type-level-integer/increment.mts
    - [Increment](./src/type-level-integer/increment.mts#L37)
    - [Decrement](./src/type-level-integer/increment.mts#L80)
- src/type-level-integer/index-type.mts
    - [Index](./src/type-level-integer/index-type.mts#L16)
    - [IndexInclusive](./src/type-level-integer/index-type.mts#L29)
    - [NegativeIndex](./src/type-level-integer/index-type.mts#L45)
- src/type-level-integer/int-range.mts
    - [IntRange](./src/type-level-integer/int-range.mts#L32)
    - [IntRangeInclusive](./src/type-level-integer/int-range.mts#L79)
- src/type-level-integer/max.mts
    - [Max](./src/type-level-integer/max.mts#L16)
- src/type-level-integer/min.mts
    - [Min](./src/type-level-integer/min.mts#L15)
- src/type-level-integer/seq.mts
    - [Seq](./src/type-level-integer/seq.mts#L15)
- src/type-level-integer/uint-range.mts
    - [UintRange](./src/type-level-integer/uint-range.mts#L22)
    - [UintRangeInclusive](./src/type-level-integer/uint-range.mts#L48)

<!-- AUTO-GENERATED TYPES END -->

## Important Notes

- This library is **type-level only** with zero runtime dependencies and no runtime cost.
- All types are designed to work seamlessly with TypeScript's strict mode settings.
- The library supports both explicit imports and global type availability via triple-slash directives.
- Custom type-testing utilities ensure all operations work correctly at compile time.

## Runtime Type Guards with ts-data-forge

While **ts-type-forge** provides powerful compile-time type utilities, combining it with [**ts-data-forge**](https://www.npmjs.com/package/ts-data-forge) unlocks runtime type validation capabilities that make your TypeScript applications even more robust.

**ts-data-forge** complements ts-type-forge by providing:

- **Type Guard Functions**: Runtime validation for all the branded types defined in ts-type-forge
- **Type Assertions**: Throw errors when values don't match expected types
- **Type Predicates**: Safely narrow types at runtime with `is*` functions
- **JSON Validation**: Runtime validation for `JsonValue` types
- **Array Guards**: Validate `NonEmptyArray` and other array constraints at runtime

### Example: Combining Type-Level and Runtime Safety

```typescript
/// <reference types="ts-type-forge/global" />

// Runtime validation with ts-data-forge
import {
    isUint,
    expectType,
    assertNonEmptyArray,
    parseJsonValue,
    isRecord,
    hasKey,
} from 'ts-data-forge';

const numbers: readonly number[] = [1, 2, 3, 4, 5, 2, 3];

// Type-safe length checking
if (Arr.isArrayAtLeastLength(numbers, 2)) {
    // numbers is now guaranteed to have at least 3 elements
    expectType<typeof numbers, MinLengthTuple<2, number>>('=');
    console.log(numbers[1]); // Array access to index 0, 1 is now safe even with noUncheckedIndexedAccess enabled
}

// Safe JSON parsing with type validation
const jsonString = '{"count": 42, "items": [1, 2, 3]}';
const data: JsonValue = parseJsonValue(jsonString); // Validates at runtime

// Use the data with confidence
if (isRecord(data) && hasKey(data, 'count')) {
    console.log(data.count); // Safe access
}
```

### Benefits of Using Both Libraries Together

1. **Complete Type Safety**: Compile-time guarantees with ts-type-forge + runtime validation with ts-data-forge
2. **API Boundary Protection**: Validate external data (API responses, user input) at runtime
3. **Developer Experience**: Same type names and conventions across both libraries
4. **Zero Runtime Cost Option**: Use only ts-type-forge when runtime validation isn't needed
5. **Progressive Enhancement**: Start with type-level safety, add runtime checks where needed

Install both libraries to get the full TypeScript type safety experience:

```bash
npm add ts-data-forge
npm add -D ts-type-forge
```

## Compatibility Notes

This library requires TypeScript version 4.8 or higher for full compatibility with advanced type features.

## Contributing

Contributions are welcome! Please see the repository's contribution guidelines for detailed information on how to contribute to this project.

## License

Apache-2.0
