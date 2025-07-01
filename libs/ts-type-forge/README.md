# ts-type-forge

[![npm version](https://img.shields.io/npm/v/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![npm downloads](https://img.shields.io/npm/dm/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![License](https://img.shields.io/npm/l/ts-type-forge.svg)](./LICENSE)

**ts-type-forge** is a comprehensive TypeScript type utility library that provides powerful type-level operations with zero runtime cost. It enhances TypeScript development by offering advanced type manipulations, strict type checking utilities, and comprehensive type safety features.

## Features

This library offers a comprehensive suite of type-level utilities, including:

- **Advanced Type Utilities**: Enhanced versions of built-in types like [`StrictExclude`](./src/record/std.d.mts#L86), [`StrictOmit`](./src/record/std.d.mts#L120), [`ReadonlyRecord`](./src/record/std.d.mts#L155), and many more.
- **Compile-Time Type Checking**: Assert type relationships at compile time with comprehensive condition types.
- **Branded Types**: Extensive collection of branded number types (`Int`, `Uint`, `SafeInt`, `FiniteNumber`, etc.) for enhanced type safety.
- **Array and Tuple Utilities**: Type-safe operations with `List` and `Tuple` namespaces for complex array manipulations.
- **Record Manipulation**: Deep operations like `DeepReadonly`, `DeepPartial`, and advanced path-based record updates.
- **Type-Level Arithmetic**: Integer operations, ranges (`UintRange`), and mathematical type computations.
- **Global Type Availability**: No need for import statements when using Triple-Slash Directives.
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

1. **Triple-Slash Directive (Recommended for global availability):**
   Add `/// <reference types="ts-type-forge" />` to any `.ts` file in your project (e.g., `globals.d.ts` or at the top of a frequently used file). This makes all types from `ts-type-forge` globally available without needing explicit imports.

    ```ts
    // src/globals.d.ts or any other .ts file
    /// <reference types="ts-type-forge" />

    // src/types/dice.ts
    // No import needed
    export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
    ```

2. **Explicit Imports:**
   Alternatively, you can import types explicitly if you prefer more granular control or are not using triple-slash directives.

    ```ts
    // src/types/dice.ts
    import { type UintRange } from 'ts-type-forge';

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

- **Array Types** - `NonEmptyArray`, `ArrayOfLength`, `ArrayAtLeastLen`
- **List Namespace** - Comprehensive list operations (Head, Tail, Take, Skip, etc.)
- **Tuple Namespace** - Type-safe tuple manipulations with compile-time guarantees

### 🧮 Type-Level Arithmetic

Mathematical operations performed entirely at the type level.

- **Integer Operations** - `Increment`, `Decrement`, `AbsoluteValue`
- **Ranges** - `UintRange`, `UintRangeInclusive` for precise numeric constraints
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

```ts
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

```ts
// No import needed if using triple-slash directive
// import type { DeepReadonly, DeepPartial } from 'ts-type-forge'; // if importing explicitly

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

// config.port = 8081; // Error: Cannot assign to 'port' because it is a read-only property
// config.database.host = 'remote'; // Error: Cannot assign to 'host' because it is a read-only property
// config.features.push('featureC'); // Error: Property 'push' does not exist on type 'readonly string[]'

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

```ts
// No import needed if using triple-slash directive
// import type { StrictOmit } from 'ts-type-forge'; // if importing explicitly

type UserProfile = Readonly<{
    id: string;
    username: string;
    email: string;
    lastLogin: Date;
    bio?: string;
}>;

// StrictOmit ensures keys actually exist in the source type
type UserCreationData = StrictOmit<UserProfile, 'id' | 'lastLogin'>;
// Result:
// type UserCreationData = Readonly<{
//     username: string;
//     email: string;
//     bio?: string | undefined;
// }>;

const newUser: UserCreationData = {
    username: 'jane_doe',
    email: 'jane@example.com',
    bio: 'Software Developer', // Optional
};

// The following would cause a compile-time error because 'nonExistentKey' doesn't exist:
// type InvalidOmit = StrictOmit<UserProfile, 'id' | 'nonExistentKey'>; // Error
```

### 4. Array Type Safety with `NonEmptyArray` and `List` Operations

Guarantee array constraints and perform type-safe operations on collections.

```ts
// No import needed if using triple-slash directive
// import type { NonEmptyArray, List } from 'ts-type-forge'; // if importing explicitly

type Post = Readonly<{
    title: string;
    content: string;
}>;

// A blog must have at least one post
type Blog = Readonly<{
    name: string;
    posts: NonEmptyArray<Post>; // Ensures posts array is never empty
}>;

const myBlog: Blog = {
    name: 'My Tech Journey',
    posts: [
        // This array must have at least one element
        { title: 'First Post', content: 'Hello world!' },
        { title: 'Understanding TypeScript', content: '...' },
    ],
};

// This would cause a type error:
// const emptyBlog: Blog = {
//     name: 'Empty Thoughts',
//     posts: [], // Error: Source has 0 element(s) but target requires 1
// };

const getFirstPostTitle = (posts: NonEmptyArray<Post>): string =>
    posts[0].title; // Safe to access posts[0] - guaranteed to exist

// Advanced List operations at the type level
type NumberList = readonly [1, 2, 3, 4, 5];

type FirstElement = List.Head<NumberList>; // 1
type LastElement = List.Last<NumberList>; // 5
type WithoutFirst = List.Tail<NumberList>; // readonly [2, 3, 4, 5]
type FirstThree = List.Take<NumberList, 3>; // readonly [1, 2, 3]
type Reversed = List.Reverse<NumberList>; // readonly [5, 4, 3, 2, 1]

// Combine operations
type LastThreeReversed = List.Reverse<List.TakeLast<NumberList, 3>>; // readonly [5, 4, 3]
```

### 5. Type-Safe JSON Handling with `JsonValue`

Safely represent and work with JSON data structures.

```ts
// No import needed if using triple-slash directive
// import type { JsonValue, JsonObject } from 'ts-type-forge'; // if importing explicitly

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
            jsonObj['tags'].forEach((tag) => {
                if (typeof tag === 'string') {
                    console.log(`Tag: ${tag}`);
                }
            });
        }
    } else if (Array.isArray(parsedData)) {
        // parsedData is a JSON array
        parsedData.forEach((item) => console.log(item));
    }
} catch (error) {
    console.error('Failed to parse JSON:', error);
}

// Define API response types using JsonValue
type ApiResponse = JsonObject & {
    readonly status: 'success' | 'error';
    readonly data?: JsonValue;
    readonly message?: string;
};
```

### 6. Precise Numeric Ranges with `UintRange` and Branded Types

Define exact numeric constraints and enhance type safety with branded number types.

```ts
// No import needed if using triple-slash directive
// import type { UintRange, UintRangeInclusive, Int, Uint } from 'ts-type-forge'; // if importing explicitly

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
// parseInteger('10', 1); // Error: Argument of type '1' is not assignable to parameter of type 'UintRange<2, 37> | undefined'
// parseInteger('10', 37); // Error: Argument of type '37' is not assignable to parameter of type 'UintRange<2, 37> | undefined'

// Branded types for additional safety
type UserId = Brand<number, 'UserId'>;
type ProductId = Brand<number, 'ProductId'>;

// Create branded values (you would typically have constructor functions)
declare const userId: UserId;
declare const productId: ProductId;

// Type-safe functions that can't mix up IDs
function getUserById(id: UserId): User | null {
    /* ... */
}
function getProductById(id: ProductId): Product | null {
    /* ... */
}

// getUserById(productId); // Error: Argument of type 'ProductId' is not assignable to parameter of type 'UserId'
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

- src/branded-types/bigint.d.mts
    - [BigInt64](./src/branded-types/bigint.d.mts#L15)
    - [BigUint64](./src/branded-types/bigint.d.mts#L30)
- src/branded-types/brand.d.mts
    - [UnknownBrand](./src/branded-types/brand.d.mts#L9)
    - [Brand](./src/branded-types/brand.d.mts#L75)
    - [UnwrapBrandTrueKeys](./src/branded-types/brand.d.mts#L92)
    - [UnwrapBrandFalseKeys](./src/branded-types/brand.d.mts#L107)
    - [UnwrapBrandBooleanKeys](./src/branded-types/brand.d.mts#L125)
    - [UnwrapBrandKeys](./src/branded-types/brand.d.mts#L140)
    - [GetBrandKeysPart](./src/branded-types/brand.d.mts#L157)
    - [GetBrandValuePart](./src/branded-types/brand.d.mts#L174)
    - [ExtendBrand](./src/branded-types/brand.d.mts#L205)
    - [ChangeBaseBrand](./src/branded-types/brand.d.mts#L236)
    - [IntersectBrand](./src/branded-types/brand.d.mts#L263)
    - [NormalizeBrandUnion](./src/branded-types/brand.d.mts#L285)
- src/branded-types/core.d.mts
    - [NaNType](./src/branded-types/core.d.mts#L76)
    - [ValidNumber](./src/branded-types/core.d.mts#L101)
    - [NonZeroNumber](./src/branded-types/core.d.mts#L121)
    - [NonNegativeNumber](./src/branded-types/core.d.mts#L137)
    - [PositiveNumber](./src/branded-types/core.d.mts#L156)
    - [NegativeNumber](./src/branded-types/core.d.mts#L172)
- src/branded-types/finite-number.d.mts
    - [FiniteNumber](./src/branded-types/finite-number.d.mts#L16)
    - [InfiniteNumber](./src/branded-types/finite-number.d.mts#L36)
    - [POSITIVE_INFINITY](./src/branded-types/finite-number.d.mts#L56)
    - [NEGATIVE_INFINITY](./src/branded-types/finite-number.d.mts#L76)
    - [NonNegativeFiniteNumber](./src/branded-types/finite-number.d.mts#L95)
    - [PositiveFiniteNumber](./src/branded-types/finite-number.d.mts#L110)
    - [NegativeFiniteNumber](./src/branded-types/finite-number.d.mts#L125)
    - [NonZeroFiniteNumber](./src/branded-types/finite-number.d.mts#L140)
- src/branded-types/float.d.mts
    - [Float32](./src/branded-types/float.d.mts#L17)
    - [Float64](./src/branded-types/float.d.mts#L35)
- src/branded-types/int.d.mts
    - [Int](./src/branded-types/int.d.mts#L16)
    - [NonZeroInt](./src/branded-types/int.d.mts#L34)
    - [NonNegativeInt](./src/branded-types/int.d.mts#L49)
    - [Uint](./src/branded-types/int.d.mts#L67)
    - [PositiveInt](./src/branded-types/int.d.mts#L84)
    - [NegativeInt](./src/branded-types/int.d.mts#L99)
    - [IntWithSmallInt](./src/branded-types/int.d.mts#L105)
    - [NonZeroIntWithSmallInt](./src/branded-types/int.d.mts#L111)
    - [NonNegativeIntWithSmallInt](./src/branded-types/int.d.mts#L117)
    - [UintWithSmallInt](./src/branded-types/int.d.mts#L124)
    - [PositiveIntWithSmallInt](./src/branded-types/int.d.mts#L130)
    - [NegativeIntWithSmallInt](./src/branded-types/int.d.mts#L136)
- src/branded-types/int16.d.mts
    - [Int16](./src/branded-types/int16.d.mts#L14)
    - [NonZeroInt16](./src/branded-types/int16.d.mts#L31)
    - [NonNegativeInt16](./src/branded-types/int16.d.mts#L45)
    - [PositiveInt16](./src/branded-types/int16.d.mts#L59)
    - [NegativeInt16](./src/branded-types/int16.d.mts#L73)
    - [Int16WithSmallInt](./src/branded-types/int16.d.mts#L79)
    - [NonZeroInt16WithSmallInt](./src/branded-types/int16.d.mts#L85)
    - [NonNegativeInt16WithSmallInt](./src/branded-types/int16.d.mts#L91)
    - [PositiveInt16WithSmallInt](./src/branded-types/int16.d.mts#L97)
    - [NegativeInt16WithSmallInt](./src/branded-types/int16.d.mts#L103)
- src/branded-types/int32.d.mts
    - [Int32](./src/branded-types/int32.d.mts#L18)
    - [NonZeroInt32](./src/branded-types/int32.d.mts#L35)
    - [NonNegativeInt32](./src/branded-types/int32.d.mts#L49)
    - [PositiveInt32](./src/branded-types/int32.d.mts#L63)
    - [NegativeInt32](./src/branded-types/int32.d.mts#L77)
    - [Int32WithSmallInt](./src/branded-types/int32.d.mts#L83)
    - [NonZeroInt32WithSmallInt](./src/branded-types/int32.d.mts#L89)
    - [NonNegativeInt32WithSmallInt](./src/branded-types/int32.d.mts#L95)
    - [PositiveInt32WithSmallInt](./src/branded-types/int32.d.mts#L101)
    - [NegativeInt32WithSmallInt](./src/branded-types/int32.d.mts#L107)
- src/branded-types/safe-int.d.mts
    - [SafeInt](./src/branded-types/safe-int.d.mts#L17)
    - [NonZeroSafeInt](./src/branded-types/safe-int.d.mts#L32)
    - [SafeUint](./src/branded-types/safe-int.d.mts#L47)
    - [PositiveSafeInt](./src/branded-types/safe-int.d.mts#L62)
    - [NegativeSafeInt](./src/branded-types/safe-int.d.mts#L76)
    - [NonNegativeSafeInt](./src/branded-types/safe-int.d.mts#L83)
    - [SafeIntWithSmallInt](./src/branded-types/safe-int.d.mts#L89)
    - [NonZeroSafeIntWithSmallInt](./src/branded-types/safe-int.d.mts#L95)
    - [NonNegativeSafeIntWithSmallInt](./src/branded-types/safe-int.d.mts#L101)
    - [SafeUintWithSmallInt](./src/branded-types/safe-int.d.mts#L108)
    - [PositiveSafeIntWithSmallInt](./src/branded-types/safe-int.d.mts#L114)
    - [NegativeSafeIntWithSmallInt](./src/branded-types/safe-int.d.mts#L120)
- src/branded-types/small-int.d.mts
    - [SmallInt](./src/branded-types/small-int.d.mts#L22)
    - [SmallUint](./src/branded-types/small-int.d.mts#L55)
    - [WithSmallInt](./src/branded-types/small-int.d.mts#L84)
    - [ExcludeSmallInt](./src/branded-types/small-int.d.mts#L113)
- src/branded-types/uint16.d.mts
    - [Uint16](./src/branded-types/uint16.d.mts#L14)
    - [PositiveUint16](./src/branded-types/uint16.d.mts#L31)
    - [NonZeroUint16](./src/branded-types/uint16.d.mts#L46)
    - [Uint16WithSmallInt](./src/branded-types/uint16.d.mts#L52)
    - [PositiveUint16WithSmallInt](./src/branded-types/uint16.d.mts#L58)
    - [NonZeroUint16WithSmallInt](./src/branded-types/uint16.d.mts#L65)
- src/branded-types/uint32.d.mts
    - [Uint32](./src/branded-types/uint32.d.mts#L17)
    - [PositiveUint32](./src/branded-types/uint32.d.mts#L31)
    - [NonZeroUint32](./src/branded-types/uint32.d.mts#L46)
    - [Uint32WithSmallInt](./src/branded-types/uint32.d.mts#L52)
    - [PositiveUint32WithSmallInt](./src/branded-types/uint32.d.mts#L58)
    - [NonZeroUint32WithSmallInt](./src/branded-types/uint32.d.mts#L65)
- src/condition/eq.d.mts
    - [TypeEq](./src/condition/eq.d.mts#L23)
- src/condition/extends.d.mts
    - [TypeExtends](./src/condition/extends.d.mts#L45)
- src/condition/is-fixed-length-list.d.mts
    - [IsFixedLengthList](./src/condition/is-fixed-length-list.d.mts#L19)
    - [IsNotFixedLengthList](./src/condition/is-fixed-length-list.d.mts#L37)
- src/condition/is-never.d.mts
    - [IsNever](./src/condition/is-never.d.mts#L18)
- src/condition/is-union.d.mts
    - [IsUnion](./src/condition/is-union.d.mts#L26)
- src/constants/alphabet.d.mts
    - [LowerAlphabet](./src/constants/alphabet.d.mts#L22)
    - [UpperAlphabet](./src/constants/alphabet.d.mts#L50)
    - [Alphabet](./src/constants/alphabet.d.mts#L77)
- src/constants/falsy-value.d.mts
    - [FalsyValue](./src/constants/falsy-value.d.mts#L45)
- src/constants/int-enum.d.mts
    - [Uint8](./src/constants/int-enum.d.mts#L18)
    - [Uint9](./src/constants/int-enum.d.mts#L36)
    - [Uint10](./src/constants/int-enum.d.mts#L55)
    - [Int8](./src/constants/int-enum.d.mts#L61)
    - [Int9](./src/constants/int-enum.d.mts#L67)
    - [Int10](./src/constants/int-enum.d.mts#L73)
    - [MonthEnum](./src/constants/int-enum.d.mts#L95)
    - [MonthIndexEnum](./src/constants/int-enum.d.mts#L117)
    - [DateEnum](./src/constants/int-enum.d.mts#L123)
    - [DayOfWeekIndex](./src/constants/int-enum.d.mts#L129)
    - [DayOfWeekName](./src/constants/int-enum.d.mts#L135)
    - [HoursEnum](./src/constants/int-enum.d.mts#L164)
    - [MinutesEnum](./src/constants/int-enum.d.mts#L170)
    - [SecondsEnum](./src/constants/int-enum.d.mts#L176)
    - [MillisecondsEnum](./src/constants/int-enum.d.mts#L182)
    - [Sexagesimal](./src/constants/int-enum.d.mts#L188)
    - [Percent](./src/constants/int-enum.d.mts#L217)
- src/constants/primitive.d.mts
    - [Primitive](./src/constants/primitive.d.mts#L24)
- src/constants/record.d.mts
    - [UnknownRecord](./src/constants/record.d.mts#L34)
- src/constants/web.d.mts
    - [HTTPRequestMethod](./src/constants/web.d.mts#L45)
- src/index.d.mts
- src/others/bivariant-hack.d.mts
    - [BivariantHack](./src/others/bivariant-hack.d.mts#L26)
- src/others/boolean.d.mts
    - [BoolNot](./src/others/boolean.d.mts#L24)
    - [BoolAnd](./src/others/boolean.d.mts#L57)
    - [BoolOr](./src/others/boolean.d.mts#L100)
    - [BoolEq](./src/others/boolean.d.mts#L126)
    - [BoolNand](./src/others/boolean.d.mts#L151)
    - [BoolNor](./src/others/boolean.d.mts#L163)
    - [BoolNeq](./src/others/boolean.d.mts#L176)
- src/others/json.d.mts
    - [JsonPrimitive](./src/others/json.d.mts#L15)
    - [MutableJsonValue](./src/others/json.d.mts#L44)
    - [JsonValue](./src/others/json.d.mts#L81)
    - [JsonObject](./src/others/json.d.mts#L107)
    - [MutableJsonObject](./src/others/json.d.mts#L125)
- src/others/mutable.d.mts
    - [Mutable](./src/others/mutable.d.mts#L30)
    - [ToMutableMap](./src/others/mutable.d.mts#L51)
    - [ToMutableSet](./src/others/mutable.d.mts#L73)
    - [MutableSet](./src/others/mutable.d.mts#L90)
    - [MutableMap](./src/others/mutable.d.mts#L107)
- src/others/utils.d.mts
    - [ToString](./src/others/utils.d.mts#L10)
    - [ToNumber](./src/others/utils.d.mts#L21)
    - [ValueOf](./src/others/utils.d.mts#L31)
    - [Length](./src/others/utils.d.mts#L43)
    - [FunctionType](./src/others/utils.d.mts#L51)
    - [Fn](./src/others/utils.d.mts#L59)
    - [MonoTypeFunction](./src/others/utils.d.mts#L65)
    - [Reducer](./src/others/utils.d.mts#L73)
    - [UnionToIntersection](./src/others/utils.d.mts#L81)
    - [MergeIntersection](./src/others/utils.d.mts#L94)
    - [ExcludeFalsyValue](./src/others/utils.d.mts#L103)
    - [Intersection](./src/others/utils.d.mts#L111)
- src/others/widen-literal.d.mts
    - [WidenLiteral](./src/others/widen-literal.d.mts#L47)
- src/record/deep.d.mts
    - [DeepReadonly](./src/record/deep.d.mts#L17)
    - [DeepMutable](./src/record/deep.d.mts#L46)
    - [DeepPartial](./src/record/deep.d.mts#L82)
    - [DeepRequired](./src/record/deep.d.mts#L112)
- src/record/partial.d.mts
    - [PartiallyPartial](./src/record/partial.d.mts#L12)
    - [PartiallyOptional](./src/record/partial.d.mts#L26)
    - [PartiallyNullable](./src/record/partial.d.mts#L39)
    - [PartiallyRequired](./src/record/partial.d.mts#L54)
    - [PickUndefined](./src/record/partial.d.mts#L66)
    - [MapToNever](./src/record/partial.d.mts#L77)
    - [OptionalKeys](./src/record/partial.d.mts#L98)
    - [RequiredKeys](./src/record/partial.d.mts#L116)
- src/record/record-path.d.mts
    - [RecordPathsWithIndex](./src/record/record-path.d.mts#L11)
    - [RecordPaths](./src/record/record-path.d.mts#L25)
    - [RecordPathAndValueTypeTuple](./src/record/record-path.d.mts#L69)
    - [RecordLeafPaths](./src/record/record-path.d.mts#L82)
    - [RecordLeafPathsWithIndex](./src/record/record-path.d.mts#L135)
    - [RecordUpdated](./src/record/record-path.d.mts#L192)
    - [RecordValueAtPath](./src/record/record-path.d.mts#L262)
    - [RecordValueAtPathWithIndex](./src/record/record-path.d.mts#L286)
- src/record/std.d.mts
    - [StrictExtract](./src/record/std.d.mts#L16)
    - [RelaxedExtract](./src/record/std.d.mts#L33)
    - [StrictPick](./src/record/std.d.mts#L50)
    - [RelaxedPick](./src/record/std.d.mts#L69)
    - [StrictExclude](./src/record/std.d.mts#L86)
    - [RelaxedExclude](./src/record/std.d.mts#L103)
    - [StrictOmit](./src/record/std.d.mts#L120)
    - [RelaxedOmit](./src/record/std.d.mts#L137)
    - [ReadonlyRecord](./src/record/std.d.mts#L155)
    - [MutableRecord](./src/record/std.d.mts#L176)
- src/tuple-and-list/array.d.mts
    - [MutableNonEmptyArray](./src/tuple-and-list/array.d.mts#L12)
    - [NonEmptyArray](./src/tuple-and-list/array.d.mts#L24)
    - [ArrayElement](./src/tuple-and-list/array.d.mts#L37)
    - [ArrayOfLength](./src/tuple-and-list/array.d.mts#L51)
    - [MutableArrayOfLength](./src/tuple-and-list/array.d.mts#L61)
    - [MutableArrayAtLeastLen](./src/tuple-and-list/array.d.mts#L80)
    - [ArrayAtLeastLen](./src/tuple-and-list/array.d.mts#L95)
- src/tuple-and-list/index-of-tuple.d.mts
    - [IndexOfTuple](./src/tuple-and-list/index-of-tuple.d.mts#L14)
- src/tuple-and-list/list.d.mts
    - [List.Head](./src/tuple-and-list/list.d.mts#L15)
    - [List.Last](./src/tuple-and-list/list.d.mts#L28)
    - [List.ButLast](./src/tuple-and-list/list.d.mts#L41)
    - [List.Tail](./src/tuple-and-list/list.d.mts#L54)
    - [List.Reverse](./src/tuple-and-list/list.d.mts#L67)
    - [List.Take](./src/tuple-and-list/list.d.mts#L87)
    - [List.Skip](./src/tuple-and-list/list.d.mts#L102)
    - [List.TakeLast](./src/tuple-and-list/list.d.mts#L117)
    - [List.SkipLast](./src/tuple-and-list/list.d.mts#L132)
    - [List.SetAt](./src/tuple-and-list/list.d.mts#L148)
    - [List.Flatten](./src/tuple-and-list/list.d.mts#L163)
    - [List.Concat](./src/tuple-and-list/list.d.mts#L176)
    - [List.Zip](./src/tuple-and-list/list.d.mts#L195)
    - [List.Partition](./src/tuple-and-list/list.d.mts#L221)
- src/tuple-and-list/make-tuple.d.mts
    - [MakeTuple](./src/tuple-and-list/make-tuple.d.mts#L13)
- src/tuple-and-list/tuple.d.mts
    - [Tuple.Head](./src/tuple-and-list/tuple.d.mts#L13)
    - [Tuple.Last](./src/tuple-and-list/tuple.d.mts#L30)
    - [Tuple.ButLast](./src/tuple-and-list/tuple.d.mts#L48)
    - [Tuple.Tail](./src/tuple-and-list/tuple.d.mts#L66)
    - [Tuple.Reverse](./src/tuple-and-list/tuple.d.mts#L80)
    - [Tuple.Take](./src/tuple-and-list/tuple.d.mts#L107)
    - [Tuple.Skip](./src/tuple-and-list/tuple.d.mts#L122)
    - [Tuple.TakeLast](./src/tuple-and-list/tuple.d.mts#L137)
    - [Tuple.SkipLast](./src/tuple-and-list/tuple.d.mts#L152)
    - [Tuple.SetAt](./src/tuple-and-list/tuple.d.mts#L167)
    - [Tuple.Flatten](./src/tuple-and-list/tuple.d.mts#L182)
    - [Tuple.Concat](./src/tuple-and-list/tuple.d.mts#L195)
    - [Tuple.Zip](./src/tuple-and-list/tuple.d.mts#L212)
    - [Tuple.Partition](./src/tuple-and-list/tuple.d.mts#L231)
    - [Tuple.ReverseImpl](./src/tuple-and-list/tuple.d.mts#L243)
    - [Tuple.TakeImpl](./src/tuple-and-list/tuple.d.mts#L256)
    - [Tuple.SkipImpl](./src/tuple-and-list/tuple.d.mts#L271)
    - [Tuple.TakeLastImpl](./src/tuple-and-list/tuple.d.mts#L287)
    - [Tuple.SkipLastImpl](./src/tuple-and-list/tuple.d.mts#L303)
    - [Tuple.SetAtImpl](./src/tuple-and-list/tuple.d.mts#L320)
    - [Tuple.FlattenImpl](./src/tuple-and-list/tuple.d.mts#L341)
    - [Tuple.ConcatImpl](./src/tuple-and-list/tuple.d.mts#L359)
    - [Tuple.PartitionImpl](./src/tuple-and-list/tuple.d.mts#L376)
- src/type-level-integer/abs.d.mts
    - [AbsoluteValue](./src/type-level-integer/abs.d.mts#L15)
    - [Abs](./src/type-level-integer/abs.d.mts#L32)
- src/type-level-integer/increment.d.mts
    - [Increment](./src/type-level-integer/increment.d.mts#L35)
    - [Decrement](./src/type-level-integer/increment.d.mts#L69)
- src/type-level-integer/index-type.d.mts
    - [Index](./src/type-level-integer/index-type.d.mts#L13)
    - [IndexInclusive](./src/type-level-integer/index-type.d.mts#L26)
    - [NegativeIndex](./src/type-level-integer/index-type.d.mts#L40)
- src/type-level-integer/max.d.mts
    - [Max](./src/type-level-integer/max.d.mts#L13)
- src/type-level-integer/min.d.mts
    - [Min](./src/type-level-integer/min.d.mts#L12)
- src/type-level-integer/seq.d.mts
    - [Seq](./src/type-level-integer/seq.d.mts#L12)
- src/type-level-integer/uint-range.d.mts
    - [UintRange](./src/type-level-integer/uint-range.d.mts#L13)
    - [UintRangeInclusive](./src/type-level-integer/uint-range.d.mts#L30)

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
/// <reference types="ts-type-forge" />

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
    expectType<typeof numbers, ArrayAtLeastLen<2, number>>('=');
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
