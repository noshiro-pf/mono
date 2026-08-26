# ts-type-forge

[![npm version](https://img.shields.io/npm/v/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)

## Documentation

- API reference: <https://noshiro-pf.github.io/ts-type-forge/>

[![npm downloads](https://img.shields.io/npm/dm/ts-type-forge.svg)](https://www.npmjs.com/package/ts-type-forge)
[![License](https://img.shields.io/npm/l/ts-type-forge.svg)](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/LICENSE)

**ts-type-forge** is a comprehensive TypeScript type utility library that provides powerful type-level operations with zero runtime cost. It enhances TypeScript development by offering advanced type manipulations, strict type checking utilities, and comprehensive type safety features.

## Features

This library offers a comprehensive suite of type-level utilities, including:

- **Advanced Type Utilities**: Enhanced versions of built-in types like [`StrictExclude`](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L86), [`StrictOmit`](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L120), [`ReadonlyRecord`](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L158), and many more.
- **Compile-Time Type Checking**: Assert type relationships at compile time with comprehensive condition types.
- **Branded Types**: Extensive collection of branded number types (`Int`, `Uint`, `SafeInt`, `FiniteNumber`, etc.) for enhanced type safety.
- **Array and Tuple Utilities**: Type-safe operations with `List` and `Tuple` namespaces for complex array manipulations.
- **Record Manipulation**: Deep operations like `DeepReadonly`, `DeepPartial`, and advanced path-based record updates.
- **Type-Level Arithmetic**: Integer operations, ranges (`UintRange`), and mathematical type computations.
- **Global Type Availability**: **No need for import statements** when the ambient globals are loaded, through either `compilerOptions.types` or a Triple-Slash Directive.
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

2. **Ambient Access (opt-in):**
   When you prefer ambient access, load the `ts-type-forge/global` subpath. This makes every type provided by `ts-type-forge` globally available throughout your project — useful for prototyping or for projects that already rely on ambient typings. There are two ways to load it, and they are equivalent: `ts-type-forge/global` is resolved as a type reference either way.

    **a. `compilerOptions.types` in tsconfig.json** — a single entry, with no source file to add:

    ```json
    {
        "compilerOptions": {
            "moduleResolution": "nodenext",
            "types": ["ts-type-forge/global"]
        }
    }
    ```

    ```ts
    // src/types/dice.ts
    // No import needed
    export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
    ```

    Note that `types` replaces TypeScript's automatic `@types` inclusion with exactly what you list, so keep the other ambient packages your project relies on in the array — for example `"types": ["node", "ts-type-forge/global"]`.

    **b. Triple-slash directive** — add `/// <reference types="ts-type-forge/global" />` to any `.ts` file in your project (e.g., `globals.d.ts` or at the top of a frequently used file included in the tsconfig.json). Reach for this when the opt-in should be visible in the source, or when the tsconfig is out of your hands.

    ```ts
    // src/globals.d.ts or any other .ts file
    /// <reference types="ts-type-forge/global" />

    // src/types/dice.ts
    // No import needed
    export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
    ```

    Either form needs a `moduleResolution` that reads the package's `exports` map — `node16`, `nodenext` or `bundler`. The legacy `node` (`node10`) resolution does not see the `./global` subpath and reports `TS2688: Cannot find type definition file for 'ts-type-forge/global'`.

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

For detailed information on all types, see the [Full API Reference](https://noshiro-pf.github.io/ts-type-forge/).

### Overview of All Types (with source code links)

<!-- AUTO-GENERATED TYPES START -->

- src/branded-types/brand.mts
    - [UnknownBrand](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L8)
    - [Brand](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L57)
    - [UnwrapBrandTrueKeys](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L78)
    - [UnwrapBrandFalseKeys](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L92)
    - [UnwrapBrandBooleanKeys](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L109)
    - [UnwrapBrandKeys](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L124)
    - [GetBrandKeysPart](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L139)
    - [GetBrandValuePart](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L159)
    - [ExtendBrand](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L190)
    - [ChangeBaseBrand](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L221)
    - [IntersectBrand](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L248)
    - [NormalizeBrandUnion](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/brand.mts#L273)
- src/branded-types/predefined-arrays/length-constrained-array-bounds.mts
    - [HasLengthConstraint](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L37)
    - [LengthConstraintBrandOf](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L52)
    - [MinLengthOf](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L81)
    - [MaxLengthOf](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L111)
    - [ChangeArrayElement](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-bounds.mts#L172)
- src/branded-types/predefined-arrays/length-constrained-array-ops.mts
    - [ConstrainedList.Reverse](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L106)
    - [ConstrainedList.SetAt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L119)
    - [ConstrainedList.Tail](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L129)
    - [ConstrainedList.ButLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L139)
    - [ConstrainedList.Take](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L152)
    - [ConstrainedList.TakeLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L166)
    - [ConstrainedList.Skip](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L183)
    - [ConstrainedList.SkipLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L197)
    - [ConstrainedList.Concat](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L214)
    - [ConstrainedList.Zip](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L234)
    - [ConstrainedList.Head](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L259)
    - [ConstrainedList.Last](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L275)
    - [ConstrainedList.Partition](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L290)
    - [FromBounds](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L357)
    - [NormalizeLengthConstraint](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array-ops.mts#L418)
- src/branded-types/predefined-arrays/length-constrained-array.mts
    - [StructuralPrefixCap](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L29)
    - [StructuralPrefixLength](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L39)
    - [MaxLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L97)
    - [MutableMaxLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L136)
    - [MinLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L200)
    - [MutableMinLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L240)
    - [BoundedLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L281)
    - [MutableBoundedLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L316)
    - [FixedLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L354)
    - [MutableFixedLengthArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-arrays/length-constrained-array.mts#L391)
- src/branded-types/predefined-numbers/bigint.mts
    - [BigInt64](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/bigint.mts#L18)
    - [BigUint64](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/bigint.mts#L33)
- src/branded-types/predefined-numbers/core.mts
    - [NaNType](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/core.mts#L58)
    - [ValidNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/core.mts#L81)
    - [NonZeroNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/core.mts#L101)
    - [NonNegativeNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/core.mts#L121)
    - [PositiveNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/core.mts#L140)
    - [NonPositiveNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/core.mts#L160)
    - [NegativeNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/core.mts#L179)
- src/branded-types/predefined-numbers/finite-number.mts
    - [FiniteNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L30)
    - [InfiniteNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L50)
    - [POSITIVE_INFINITY](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L71)
    - [NEGATIVE_INFINITY](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L92)
    - [NonNegativeFiniteNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L111)
    - [PositiveFiniteNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L129)
    - [NegativeFiniteNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L146)
    - [NonZeroFiniteNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L161)
    - [NonPositiveFiniteNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/finite-number.mts#L175)
- src/branded-types/predefined-numbers/float.mts
    - [Float16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/float.mts#L22)
    - [Float32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/float.mts#L43)
    - [Float64](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/float.mts#L61)
- src/branded-types/predefined-numbers/int.mts
    - [Int](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L34)
    - [NonZeroInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L50)
    - [NonNegativeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L65)
    - [Uint](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L80)
    - [PositiveInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L96)
    - [NegativeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L111)
    - [NonPositiveInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L126)
    - [IntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L132)
    - [NonZeroIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L138)
    - [NonNegativeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L144)
    - [UintWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L151)
    - [PositiveIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L157)
    - [NegativeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L163)
    - [NonPositiveIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int.mts#L169)
- src/branded-types/predefined-numbers/int16.mts
    - [Int16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L28)
    - [NonZeroInt16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L46)
    - [NonNegativeInt16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L61)
    - [PositiveInt16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L76)
    - [NegativeInt16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L91)
    - [NonPositiveInt16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L106)
    - [Int16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L112)
    - [NonZeroInt16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L118)
    - [NonNegativeInt16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L124)
    - [PositiveInt16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L130)
    - [NegativeInt16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L136)
    - [NonPositiveInt16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int16.mts#L142)
- src/branded-types/predefined-numbers/int32.mts
    - [Int32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L29)
    - [NonZeroInt32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L47)
    - [NonNegativeInt32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L62)
    - [PositiveInt32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L77)
    - [NegativeInt32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L92)
    - [NonPositiveInt32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L107)
    - [Int32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L113)
    - [NonZeroInt32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L119)
    - [NonNegativeInt32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L125)
    - [PositiveInt32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L131)
    - [NegativeInt32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L137)
    - [NonPositiveInt32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/int32.mts#L143)
- src/branded-types/predefined-numbers/safe-int.mts
    - [SafeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L31)
    - [NonZeroSafeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L46)
    - [SafeUint](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L61)
    - [NonNegativeSafeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L67)
    - [PositiveSafeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L82)
    - [NegativeSafeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L96)
    - [NonPositiveSafeInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L110)
    - [SafeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L116)
    - [NonZeroSafeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L122)
    - [SafeUintWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L128)
    - [NonNegativeSafeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L135)
    - [PositiveSafeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L141)
    - [NegativeSafeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L147)
    - [NonPositiveSafeIntWithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/safe-int.mts#L153)
- src/branded-types/predefined-numbers/small-int.mts
    - [SmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/small-int.mts#L44)
    - [SmallUint](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/small-int.mts#L72)
    - [WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/small-int.mts#L101)
    - [ExcludeSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/small-int.mts#L139)
- src/branded-types/predefined-numbers/uint16.mts
    - [Uint16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint16.mts#L22)
    - [PositiveUint16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint16.mts#L40)
    - [NonZeroUint16](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint16.mts#L55)
    - [Uint16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint16.mts#L61)
    - [PositiveUint16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint16.mts#L67)
    - [NonZeroUint16WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint16.mts#L74)
- src/branded-types/predefined-numbers/uint32.mts
    - [Uint32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint32.mts#L23)
    - [PositiveUint32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint32.mts#L38)
    - [NonZeroUint32](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint32.mts#L53)
    - [Uint32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint32.mts#L59)
    - [PositiveUint32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint32.mts#L65)
    - [NonZeroUint32WithSmallInt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-numbers/uint32.mts#L72)
- src/branded-types/predefined-strings/length-constrained-string.mts
    - [MaxLengthString](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-strings/length-constrained-string.mts#L43)
    - [MinLengthString](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-strings/length-constrained-string.mts#L84)
    - [BoundedLengthString](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-strings/length-constrained-string.mts#L117)
    - [FixedLengthString](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-strings/length-constrained-string.mts#L138)
- src/branded-types/predefined-strings/non-empty-string.mts
    - [NonEmptyString](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/predefined-strings/non-empty-string.mts#L21)
- src/branded-types/supported-length.mts
    - [SupportedLengthCap](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/supported-length.mts#L18)
    - [SupportedLength](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/branded-types/supported-length.mts#L35)
- src/condition/eq.mts
    - [TypeEq](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/eq.mts#L25)
- src/condition/extends.mts
    - [TypeExtends](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/extends.mts#L45)
- src/condition/is-any.mts
    - [IsAny](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-any.mts#L23)
    - [IsNotAny](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-any.mts#L39)
- src/condition/is-fixed-length-list.mts
    - [IsFixedLengthList](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-fixed-length-list.mts#L23)
    - [IsNotFixedLengthList](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-fixed-length-list.mts#L43)
- src/condition/is-never.mts
    - [IsNever](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-never.mts#L22)
- src/condition/is-union.mts
    - [IsUnion](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-union.mts#L32)
- src/condition/is-unknown.mts
    - [IsUnknown](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-unknown.mts#L23)
    - [IsNotUnknown](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/condition/is-unknown.mts#L40)
- src/constants/alphabet.mts
    - [LowerAlphabet](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/alphabet.mts#L21)
    - [UpperAlphabet](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/alphabet.mts#L48)
    - [Alphabet](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/alphabet.mts#L74)
- src/constants/falsy-value.mts
    - [FalsyValue](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/falsy-value.mts#L43)
- src/constants/int-enum.mts
    - [Uint8](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L23)
    - [Uint9](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L40)
    - [Uint10](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L58)
    - [Uint11](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L67)
    - [Int8](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L73)
    - [Int9](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L79)
    - [Int10](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L85)
    - [Int11](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L94)
    - [MonthEnum](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L128)
    - [MonthIndexEnum](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L150)
    - [DateEnum](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L156)
    - [DayOfWeekIndex](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L162)
    - [DayOfWeekName](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L168)
    - [HoursEnum](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L197)
    - [MinutesEnum](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L203)
    - [SecondsEnum](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L209)
    - [MillisecondsEnum](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L215)
    - [Sexagesimal](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L221)
    - [Percent](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/int-enum.mts#L250)
- src/constants/primitive.mts
    - [Primitive](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/primitive.mts#L23)
- src/constants/record.mts
    - [UnknownRecord](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/record.mts#L36)
- src/constants/web.mts
    - [HTTPRequestMethod](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/constants/web.mts#L45)
- src/entry-point.mts
- src/others/bivariant-hack.mts
    - [BivariantHack](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/bivariant-hack.mts#L32)
- src/others/boolean.mts
    - [BoolNot](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/boolean.mts#L63)
    - [BoolAnd](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/boolean.mts#L96)
    - [BoolOr](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/boolean.mts#L139)
    - [BoolEq](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/boolean.mts#L167)
    - [BoolNand](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/boolean.mts#L194)
    - [BoolNor](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/boolean.mts#L210)
    - [BoolNeq](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/boolean.mts#L227)
- src/others/json.mts
    - [JsonPrimitive](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/json.mts#L17)
    - [MutableJsonValue](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/json.mts#L55)
    - [JsonValue](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/json.mts#L91)
    - [JsonObject](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/json.mts#L117)
    - [MutableJsonObject](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/json.mts#L135)
- src/others/mutable.mts
    - [Mutable](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/mutable.mts#L30)
    - [ToMutableMap](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/mutable.mts#L51)
    - [ToMutableSet](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/mutable.mts#L72)
    - [MutableSet](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/mutable.mts#L89)
    - [MutableMap](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/mutable.mts#L106)
- src/others/std.mts
    - [StrictExtract](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L16)
    - [RelaxedExtract](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L33)
    - [StrictPick](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L50)
    - [RelaxedPick](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L69)
    - [StrictExclude](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L86)
    - [RelaxedExclude](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L103)
    - [StrictOmit](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L120)
    - [RelaxedOmit](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L140)
    - [ReadonlyRecord](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L158)
    - [MutableRecord](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/std.mts#L179)
- src/others/utils.mts
    - [ToString](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L15)
    - [ToNumber](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L28)
    - [ValueOf](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L39)
    - [Length](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L56)
    - [FunctionType](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L64)
    - [Fn](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L72)
    - [MonoTypeFunction](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L78)
    - [Reducer](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L86)
    - [AnyFn](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L96)
    - [UnionToIntersection](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L106)
    - [MergeIntersection](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L121)
    - [ExcludeFalsyValue](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L130)
    - [Intersection](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/utils.mts#L140)
- src/others/widen-literal.mts
    - [WidenLiteral](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/others/widen-literal.mts#L47)
- src/record/deep-pick-omit.mts
    - [DeepPick](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/deep-pick-omit.mts#L23)
    - [DeepOmit](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/deep-pick-omit.mts#L50)
- src/record/deep.mts
    - [DeepReadonly](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/deep.mts#L33)
    - [DeepMutable](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/deep.mts#L69)
    - [DeepPartial](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/deep.mts#L112)
    - [DeepRequired](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/deep.mts#L149)
- src/record/partial.mts
    - [PartiallyPartial](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/partial.mts#L22)
    - [PartiallyOptional](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/partial.mts#L38)
    - [PartiallyNullable](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/partial.mts#L53)
    - [PartiallyRequired](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/partial.mts#L70)
    - [OptionalKeys](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/partial.mts#L118)
    - [RequiredKeys](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/partial.mts#L139)
- src/record/record-path.mts
    - [RecordPathsWithIndex](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L37)
    - [RecordPaths](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L53)
    - [RecordPathAndValueTypeTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L70)
    - [RecordLeafPaths](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L87)
    - [RecordLeafPathsWithIndex](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L105)
    - [RecordUpdated](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L126)
    - [RecordValueAtPath](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L152)
    - [RecordValueAtPathWithIndex](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/record/record-path.mts#L178)
- src/tuple-and-list/array.mts
    - [MutableNonEmptyTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/array.mts#L20)
    - [NonEmptyTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/array.mts#L35)
    - [NonEmptyArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/array.mts#L52)
    - [MutableNonEmptyArray](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/array.mts#L62)
    - [ArrayElement](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/array.mts#L77)
- src/tuple-and-list/index-of-tuple.mts
    - [IndexOfTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/index-of-tuple.mts#L19)
    - [NegativeIndexOfTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/index-of-tuple.mts#L56)
- src/tuple-and-list/length-constrained-tuple.mts
    - [FixedLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L20)
    - [MutableFixedLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L32)
    - [MutableMinLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L53)
    - [MinLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L70)
    - [BoundedLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L119)
    - [MutableBoundedLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L137)
    - [MaxLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L163)
    - [MutableMaxLengthTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/length-constrained-tuple.mts#L180)
- src/tuple-and-list/list.mts
    - [List.Head](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L21)
    - [List.Last](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L36)
    - [List.ButLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L51)
    - [List.Tail](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L66)
    - [List.Reverse](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L81)
    - [List.Take](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L103)
    - [List.Skip](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L120)
    - [List.TakeLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L137)
    - [List.SkipLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L154)
    - [List.SetAt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L172)
    - [List.Flatten](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L189)
    - [List.Concat](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L205)
    - [List.Zip](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L226)
    - [List.Partition](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/list.mts#L255)
- src/tuple-and-list/make-tuple.mts
    - [MakeTuple](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/make-tuple.mts#L15)
- src/tuple-and-list/tuple.mts
    - [Tuple.Head](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L20)
    - [Tuple.Last](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L47)
    - [Tuple.ButLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L67)
    - [Tuple.Tail](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L87)
    - [Tuple.Reverse](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L103)
    - [Tuple.Take](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L124)
    - [Tuple.Skip](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L145)
    - [Tuple.TakeLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L166)
    - [Tuple.SkipLast](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L187)
    - [Tuple.SetAt](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L214)
    - [Tuple.Flatten](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L236)
    - [Tuple.Concat](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L262)
    - [Tuple.Zip](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L281)
    - [Tuple.Partition](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L306)
    - [Tuple.MapTo](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/tuple-and-list/tuple.mts#L353)
- src/type-level-integer/abs.mts
    - [AbsoluteValue](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/abs.mts#L19)
    - [Abs](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/abs.mts#L38)
- src/type-level-integer/increment.mts
    - [Increment](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/increment.mts#L37)
    - [Decrement](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/increment.mts#L80)
- src/type-level-integer/index-type.mts
    - [Index](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/index-type.mts#L18)
    - [IndexInclusive](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/index-type.mts#L33)
    - [NegativeIndex](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/index-type.mts#L51)
- src/type-level-integer/int-range.mts
    - [IntRange](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/int-range.mts#L34)
    - [IntRangeInclusive](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/int-range.mts#L83)
- src/type-level-integer/max.mts
    - [Max](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/max.mts#L18)
- src/type-level-integer/min.mts
    - [Min](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/min.mts#L17)
- src/type-level-integer/seq.mts
    - [Seq](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/seq.mts#L17)
- src/type-level-integer/uint-range.mts
    - [UintRange](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/uint-range.mts#L24)
    - [UintRangeInclusive](https://github.com/noshiro-pf/mono/blob/main/libs/ts-type-forge/src/type-level-integer/uint-range.mts#L52)

<!-- AUTO-GENERATED TYPES END -->

## Important Notes

- This library is **type-level only** with zero runtime dependencies and no runtime cost.
- All types are designed to work seamlessly with TypeScript's strict mode settings.
- The library supports both explicit imports and global type availability via the `ts-type-forge/global` subpath (`compilerOptions.types` or a triple-slash directive).
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
if (Arr.isMinLengthArray(2, numbers)) {
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
