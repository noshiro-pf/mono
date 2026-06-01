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

const myBlog: Blog = {
    name: 'My Tech Journey',
    posts: [
        // This array must have at least one element
        { title: 'First Post', content: 'Hello world!' },
        { title: 'Understanding TypeScript', content: '...' },
    ],
};

// This would cause a type error:
const emptyBlog: Blog = {
    name: 'Empty Thoughts',
    // @ts-expect-error Source has 0 element(s) but target requires 1
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

- src/branded-types/bigint.mts
    - [BigInt64](./src/branded-types/bigint.mts#L18)
    - [BigUint64](./src/branded-types/bigint.mts#L33)
- src/branded-types/brand.mts
    - [UnknownBrand](./src/branded-types/brand.mts#L12)
    - [Brand](./src/branded-types/brand.mts#L61)
    - [UnwrapBrandTrueKeys](./src/branded-types/brand.mts#L82)
    - [UnwrapBrandFalseKeys](./src/branded-types/brand.mts#L96)
    - [UnwrapBrandBooleanKeys](./src/branded-types/brand.mts#L113)
    - [UnwrapBrandKeys](./src/branded-types/brand.mts#L128)
    - [GetBrandKeysPart](./src/branded-types/brand.mts#L145)
    - [GetBrandValuePart](./src/branded-types/brand.mts#L165)
    - [ExtendBrand](./src/branded-types/brand.mts#L196)
    - [ChangeBaseBrand](./src/branded-types/brand.mts#L227)
    - [IntersectBrand](./src/branded-types/brand.mts#L254)
    - [NormalizeBrandUnion](./src/branded-types/brand.mts#L279)
- src/branded-types/core.mts
    - [NaNType](./src/branded-types/core.mts#L58)
    - [ValidNumber](./src/branded-types/core.mts#L78)
    - [NonZeroNumber](./src/branded-types/core.mts#L98)
    - [NonNegativeNumber](./src/branded-types/core.mts#L117)
    - [PositiveNumber](./src/branded-types/core.mts#L136)
    - [NegativeNumber](./src/branded-types/core.mts#L152)
- src/branded-types/finite-number.mts
    - [FiniteNumber](./src/branded-types/finite-number.mts#L26)
    - [InfiniteNumber](./src/branded-types/finite-number.mts#L46)
    - [POSITIVE_INFINITY](./src/branded-types/finite-number.mts#L66)
    - [NEGATIVE_INFINITY](./src/branded-types/finite-number.mts#L86)
    - [NonNegativeFiniteNumber](./src/branded-types/finite-number.mts#L105)
    - [PositiveFiniteNumber](./src/branded-types/finite-number.mts#L123)
    - [NegativeFiniteNumber](./src/branded-types/finite-number.mts#L138)
    - [NonZeroFiniteNumber](./src/branded-types/finite-number.mts#L153)
- src/branded-types/float.mts
    - [Float32](./src/branded-types/float.mts#L22)
    - [Float64](./src/branded-types/float.mts#L40)
- src/branded-types/int.mts
    - [Int](./src/branded-types/int.mts#L27)
    - [NonZeroInt](./src/branded-types/int.mts#L45)
    - [NonNegativeInt](./src/branded-types/int.mts#L60)
    - [Uint](./src/branded-types/int.mts#L78)
    - [PositiveInt](./src/branded-types/int.mts#L95)
    - [NegativeInt](./src/branded-types/int.mts#L110)
    - [IntWithSmallInt](./src/branded-types/int.mts#L116)
    - [NonZeroIntWithSmallInt](./src/branded-types/int.mts#L122)
    - [NonNegativeIntWithSmallInt](./src/branded-types/int.mts#L128)
    - [UintWithSmallInt](./src/branded-types/int.mts#L135)
    - [PositiveIntWithSmallInt](./src/branded-types/int.mts#L141)
    - [NegativeIntWithSmallInt](./src/branded-types/int.mts#L147)
- src/branded-types/int16.mts
    - [Int16](./src/branded-types/int16.mts#L25)
    - [NonZeroInt16](./src/branded-types/int16.mts#L42)
    - [NonNegativeInt16](./src/branded-types/int16.mts#L56)
    - [PositiveInt16](./src/branded-types/int16.mts#L70)
    - [NegativeInt16](./src/branded-types/int16.mts#L84)
    - [Int16WithSmallInt](./src/branded-types/int16.mts#L90)
    - [NonZeroInt16WithSmallInt](./src/branded-types/int16.mts#L96)
    - [NonNegativeInt16WithSmallInt](./src/branded-types/int16.mts#L102)
    - [PositiveInt16WithSmallInt](./src/branded-types/int16.mts#L108)
    - [NegativeInt16WithSmallInt](./src/branded-types/int16.mts#L114)
- src/branded-types/int32.mts
    - [Int32](./src/branded-types/int32.mts#L29)
    - [NonZeroInt32](./src/branded-types/int32.mts#L46)
    - [NonNegativeInt32](./src/branded-types/int32.mts#L60)
    - [PositiveInt32](./src/branded-types/int32.mts#L74)
    - [NegativeInt32](./src/branded-types/int32.mts#L88)
    - [Int32WithSmallInt](./src/branded-types/int32.mts#L94)
    - [NonZeroInt32WithSmallInt](./src/branded-types/int32.mts#L100)
    - [NonNegativeInt32WithSmallInt](./src/branded-types/int32.mts#L106)
    - [PositiveInt32WithSmallInt](./src/branded-types/int32.mts#L112)
    - [NegativeInt32WithSmallInt](./src/branded-types/int32.mts#L118)
- src/branded-types/safe-int.mts
    - [SafeInt](./src/branded-types/safe-int.mts#L28)
    - [NonZeroSafeInt](./src/branded-types/safe-int.mts#L43)
    - [SafeUint](./src/branded-types/safe-int.mts#L58)
    - [PositiveSafeInt](./src/branded-types/safe-int.mts#L73)
    - [NegativeSafeInt](./src/branded-types/safe-int.mts#L87)
    - [NonNegativeSafeInt](./src/branded-types/safe-int.mts#L94)
    - [SafeIntWithSmallInt](./src/branded-types/safe-int.mts#L100)
    - [NonZeroSafeIntWithSmallInt](./src/branded-types/safe-int.mts#L106)
    - [NonNegativeSafeIntWithSmallInt](./src/branded-types/safe-int.mts#L112)
    - [SafeUintWithSmallInt](./src/branded-types/safe-int.mts#L119)
    - [PositiveSafeIntWithSmallInt](./src/branded-types/safe-int.mts#L125)
    - [NegativeSafeIntWithSmallInt](./src/branded-types/safe-int.mts#L131)
- src/branded-types/small-int.mts
    - [SmallInt](./src/branded-types/small-int.mts#L45)
    - [SmallUint](./src/branded-types/small-int.mts#L73)
    - [WithSmallInt](./src/branded-types/small-int.mts#L102)
    - [ExcludeSmallInt](./src/branded-types/small-int.mts#L140)
- src/branded-types/uint16.mts
    - [Uint16](./src/branded-types/uint16.mts#L20)
    - [PositiveUint16](./src/branded-types/uint16.mts#L37)
    - [NonZeroUint16](./src/branded-types/uint16.mts#L52)
    - [Uint16WithSmallInt](./src/branded-types/uint16.mts#L58)
    - [PositiveUint16WithSmallInt](./src/branded-types/uint16.mts#L64)
    - [NonZeroUint16WithSmallInt](./src/branded-types/uint16.mts#L71)
- src/branded-types/uint32.mts
    - [Uint32](./src/branded-types/uint32.mts#L23)
    - [PositiveUint32](./src/branded-types/uint32.mts#L37)
    - [NonZeroUint32](./src/branded-types/uint32.mts#L52)
    - [Uint32WithSmallInt](./src/branded-types/uint32.mts#L58)
    - [PositiveUint32WithSmallInt](./src/branded-types/uint32.mts#L64)
    - [NonZeroUint32WithSmallInt](./src/branded-types/uint32.mts#L71)
- src/condition/eq.mts
    - [TypeEq](./src/condition/eq.mts#L23)
- src/condition/extends.mts
    - [TypeExtends](./src/condition/extends.mts#L45)
- src/condition/is-fixed-length-list.mts
    - [IsFixedLengthList](./src/condition/is-fixed-length-list.mts#L19)
    - [IsNotFixedLengthList](./src/condition/is-fixed-length-list.mts#L37)
- src/condition/is-never.mts
    - [IsNever](./src/condition/is-never.mts#L18)
- src/condition/is-union.mts
    - [IsUnion](./src/condition/is-union.mts#L30)
- src/constants/alphabet.mts
    - [LowerAlphabet](./src/constants/alphabet.mts#L22)
    - [UpperAlphabet](./src/constants/alphabet.mts#L50)
    - [Alphabet](./src/constants/alphabet.mts#L77)
- src/constants/falsy-value.mts
    - [FalsyValue](./src/constants/falsy-value.mts#L45)
- src/constants/int-enum.mts
    - [Uint8](./src/constants/int-enum.mts#L23)
    - [Uint9](./src/constants/int-enum.mts#L41)
    - [Uint10](./src/constants/int-enum.mts#L60)
    - [Int8](./src/constants/int-enum.mts#L66)
    - [Int9](./src/constants/int-enum.mts#L72)
    - [Int10](./src/constants/int-enum.mts#L78)
    - [MonthEnum](./src/constants/int-enum.mts#L100)
    - [MonthIndexEnum](./src/constants/int-enum.mts#L122)
    - [DateEnum](./src/constants/int-enum.mts#L128)
    - [DayOfWeekIndex](./src/constants/int-enum.mts#L134)
    - [DayOfWeekName](./src/constants/int-enum.mts#L140)
    - [HoursEnum](./src/constants/int-enum.mts#L176)
    - [MinutesEnum](./src/constants/int-enum.mts#L182)
    - [SecondsEnum](./src/constants/int-enum.mts#L188)
    - [MillisecondsEnum](./src/constants/int-enum.mts#L194)
    - [Sexagesimal](./src/constants/int-enum.mts#L200)
    - [Percent](./src/constants/int-enum.mts#L229)
- src/constants/primitive.mts
    - [Primitive](./src/constants/primitive.mts#L24)
- src/constants/record.mts
    - [UnknownRecord](./src/constants/record.mts#L36)
- src/constants/web.mts
    - [HTTPRequestMethod](./src/constants/web.mts#L45)
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
    - [MutableJsonValue](./src/others/json.mts#L46)
    - [JsonValue](./src/others/json.mts#L83)
    - [JsonObject](./src/others/json.mts#L109)
    - [MutableJsonObject](./src/others/json.mts#L127)
- src/others/mutable.mts
    - [Mutable](./src/others/mutable.mts#L30)
    - [ToMutableMap](./src/others/mutable.mts#L51)
    - [ToMutableSet](./src/others/mutable.mts#L73)
    - [MutableSet](./src/others/mutable.mts#L90)
    - [MutableMap](./src/others/mutable.mts#L107)
- src/others/utils.mts
    - [ToString](./src/others/utils.mts#L13)
    - [ToNumber](./src/others/utils.mts#L24)
    - [ValueOf](./src/others/utils.mts#L33)
    - [Length](./src/others/utils.mts#L45)
    - [FunctionType](./src/others/utils.mts#L53)
    - [Fn](./src/others/utils.mts#L61)
    - [MonoTypeFunction](./src/others/utils.mts#L67)
    - [Reducer](./src/others/utils.mts#L75)
    - [AnyFn](./src/others/utils.mts#L78)
    - [UnionToIntersection](./src/others/utils.mts#L86)
    - [MergeIntersection](./src/others/utils.mts#L99)
    - [ExcludeFalsyValue](./src/others/utils.mts#L108)
    - [Intersection](./src/others/utils.mts#L116)
- src/others/widen-literal.mts
    - [WidenLiteral](./src/others/widen-literal.mts#L47)
- src/record/deep-pick-omit.mts
    - [DeepPick](./src/record/deep-pick-omit.mts#L21)
    - [DeepOmit](./src/record/deep-pick-omit.mts#L48)
- src/record/deep.mts
    - [DeepReadonly](./src/record/deep.mts#L24)
    - [DeepMutable](./src/record/deep.mts#L53)
    - [DeepPartial](./src/record/deep.mts#L89)
    - [DeepRequired](./src/record/deep.mts#L119)
- src/record/partial.mts
    - [PartiallyPartial](./src/record/partial.mts#L15)
    - [PartiallyOptional](./src/record/partial.mts#L29)
    - [PartiallyNullable](./src/record/partial.mts#L42)
    - [PartiallyRequired](./src/record/partial.mts#L57)
    - [PickUndefined](./src/record/partial.mts#L69)
    - [MapToNever](./src/record/partial.mts#L80)
    - [OptionalKeys](./src/record/partial.mts#L101)
    - [RequiredKeys](./src/record/partial.mts#L121)
- src/record/record-path.mts
    - [RecordPathsWithIndex](./src/record/record-path.mts#L32)
    - [RecordPaths](./src/record/record-path.mts#L46)
    - [RecordPathAndValueTypeTuple](./src/record/record-path.mts#L61)
    - [RecordLeafPaths](./src/record/record-path.mts#L76)
    - [RecordLeafPathsWithIndex](./src/record/record-path.mts#L92)
    - [RecordUpdated](./src/record/record-path.mts#L111)
    - [RecordValueAtPath](./src/record/record-path.mts#L135)
    - [RecordValueAtPathWithIndex](./src/record/record-path.mts#L159)
- src/record/std.mts
    - [StrictExtract](./src/record/std.mts#L16)
    - [RelaxedExtract](./src/record/std.mts#L33)
    - [StrictPick](./src/record/std.mts#L50)
    - [RelaxedPick](./src/record/std.mts#L69)
    - [StrictExclude](./src/record/std.mts#L86)
    - [RelaxedExclude](./src/record/std.mts#L103)
    - [StrictOmit](./src/record/std.mts#L120)
    - [RelaxedOmit](./src/record/std.mts#L137)
    - [ReadonlyRecord](./src/record/std.mts#L155)
    - [MutableRecord](./src/record/std.mts#L176)
- src/tuple-and-list/array.mts
    - [MutableNonEmptyArray](./src/tuple-and-list/array.mts#L15)
    - [NonEmptyArray](./src/tuple-and-list/array.mts#L27)
    - [ArrayElement](./src/tuple-and-list/array.mts#L40)
    - [ArrayOfLength](./src/tuple-and-list/array.mts#L54)
    - [MutableArrayOfLength](./src/tuple-and-list/array.mts#L64)
    - [MutableArrayAtLeastLen](./src/tuple-and-list/array.mts#L83)
    - [ArrayAtLeastLen](./src/tuple-and-list/array.mts#L98)
    - [ArrayBoundedLen](./src/tuple-and-list/array.mts#L145)
    - [MutableArrayBoundedLen](./src/tuple-and-list/array.mts#L161)
    - [ArrayAtMostLen](./src/tuple-and-list/array.mts#L185)
    - [MutableArrayAtMostLen](./src/tuple-and-list/array.mts#L196)
- src/tuple-and-list/index-of-tuple.mts
    - [IndexOfTuple](./src/tuple-and-list/index-of-tuple.mts#L18)
    - [NegativeIndexOfTuple](./src/tuple-and-list/index-of-tuple.mts#L53)
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
    - [Tuple.Head](./src/tuple-and-list/tuple.mts#L15)
    - [Tuple.Last](./src/tuple-and-list/tuple.mts#L30)
    - [Tuple.ButLast](./src/tuple-and-list/tuple.mts#L48)
    - [Tuple.Tail](./src/tuple-and-list/tuple.mts#L66)
    - [Tuple.Reverse](./src/tuple-and-list/tuple.mts#L80)
    - [Tuple.Take](./src/tuple-and-list/tuple.mts#L107)
    - [Tuple.Skip](./src/tuple-and-list/tuple.mts#L123)
    - [Tuple.TakeLast](./src/tuple-and-list/tuple.mts#L139)
    - [Tuple.SkipLast](./src/tuple-and-list/tuple.mts#L154)
    - [Tuple.SetAt](./src/tuple-and-list/tuple.mts#L169)
    - [Tuple.Flatten](./src/tuple-and-list/tuple.mts#L184)
    - [Tuple.Concat](./src/tuple-and-list/tuple.mts#L200)
    - [Tuple.Zip](./src/tuple-and-list/tuple.mts#L217)
    - [Tuple.Partition](./src/tuple-and-list/tuple.mts#L236)
- src/type-level-integer/abs.mts
    - [AbsoluteValue](./src/type-level-integer/abs.mts#L17)
    - [Abs](./src/type-level-integer/abs.mts#L34)
- src/type-level-integer/increment.mts
    - [Increment](./src/type-level-integer/increment.mts#L37)
    - [Decrement](./src/type-level-integer/increment.mts#L74)
- src/type-level-integer/index-type.mts
    - [Index](./src/type-level-integer/index-type.mts#L16)
    - [IndexInclusive](./src/type-level-integer/index-type.mts#L29)
    - [NegativeIndex](./src/type-level-integer/index-type.mts#L45)
- src/type-level-integer/max.mts
    - [Max](./src/type-level-integer/max.mts#L16)
- src/type-level-integer/min.mts
    - [Min](./src/type-level-integer/min.mts#L15)
- src/type-level-integer/seq.mts
    - [Seq](./src/type-level-integer/seq.mts#L15)
- src/type-level-integer/uint-range.mts
    - [UintRange](./src/type-level-integer/uint-range.mts#L16)
    - [UintRangeInclusive](./src/type-level-integer/uint-range.mts#L33)

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
