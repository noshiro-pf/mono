**ts-fortress**

---

# ts-fortress

TypeScript-first schema validation library with static type inference.

[![npm version](https://img.shields.io/npm/v/ts-fortress.svg)](https://www.npmjs.com/package/ts-fortress)
[![npm downloads](https://img.shields.io/npm/dm/ts-fortress.svg)](https://www.npmjs.com/package/ts-fortress)
[![License](https://img.shields.io/npm/l/ts-fortress.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-fortress/graph/badge.svg?token=Y522SWQTPB)](https://codecov.io/gh/noshiro-pf/ts-fortress)

**ts-fortress** is a runtime validation library similar to [io-ts](https://github.com/gcanti/io-ts) and [zod](https://github.com/colinhacks/zod), designed to provide type-safe schema validation with excellent TypeScript integration and static type inference.

## Features

- 🔒 **Type-safe validation** - Full TypeScript support with static type inference
- 🏗️ **Composable schemas** - Build complex validation schemas from simple building blocks
- 🔄 **Result-based error handling** - Structured error reporting with `Result<T, readonly ValidationError[]>`
- 🏷️ **Branded types** - Rich collection of branded number types (Int, SafeInt, PositiveInt, etc.)
- ⚡ **Performance focused** - Optimized validation with minimal runtime overhead (negligible impact on application performance)
- 🧩 **Functional composition** - Union, intersection, and merge operations for schema composition
- 🛠️ **Required default values** - All schemas require explicit default values, enabling automatic data filling via `fill()` function

## Installation

```bash
npm install ts-fortress
```

```bash
yarn add ts-fortress
```

```bash
pnpm add ts-fortress
```

## Quick Start

```typescript
import * as t from 'ts-fortress';

// Define a schema
const User = t.record({
    id: t.string(''),
    name: t.string(''),
    age: t.number(0),
    email: t.string(''),
    isActive: t.boolean(true),
});

// Infer TypeScript type
type User = t.TypeOf<typeof User>;
// ↑ Readonly<{
//     id: string;
//     name: string;
//     age: number;
//     email: string;
//     isActive: boolean
//   }>

// Validate data
const userData = {
    id: '123',
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    isActive: true,
};

if (User.is(userData)) {
    // userData is now typed as User
    console.log(`User: ${userData.name}, Age: ${userData.age}`);
}

import { Result } from 'ts-data-forge';

// Get validation result with error details
const result = User.validate(userData);
if (Result.isOk(result)) {
    const user = result.value; // typed as User
} else {
    console.error('Validation errors:', result.value); // readonly ValidationError[] showing error information
}
```

## Default Values and Data Filling

One of ts-fortress's key design decisions is **requiring explicit default values** for all schema types. This enables powerful data filling capabilities:

```typescript
import * as t from 'ts-fortress';

// Every type requires a default value
const UserProfile = t.record({
    name: t.string('Anonymous'), // Default: 'Anonymous'
    age: t.number(0), // Default: 0
    email: t.optional(t.string('')), // Optional field with default ''
    preferences: t.record({
        theme: t.string('light'), // Default: 'light'
        notifications: t.boolean(true), // Default: true
    }),
    tags: t.array(t.string('')), // Default: empty array []
});

// The fill() function automatically provides missing values
const partialData = {
    name: 'John Doe',
    preferences: {
        theme: 'dark',
        // notifications missing - will be filled with default
    },
    // age, email, tags missing - will be filled with defaults
};

const filledData = UserProfile.fill(partialData);
console.log(filledData);
// Output: {
//   name: 'John Doe',
//   age: 0,                    // ← Filled with default
//   email: '',                 // ← Filled with default
//   preferences: {
//     theme: 'dark',
//     notifications: true,     // ← Filled with default
//   },
//   tags: [],                  // ← Filled with default
// }

// fill() is type-safe and always returns a complete object
type UserProfile = t.TypeOf<typeof UserProfile>;
const completeUser: UserProfile = UserProfile.fill(anyPartialData);

// Important: Default value filling only occurs when fill() is called
// The is() and validate() functions can still detect missing keys
console.log(UserProfile.is(partialData)); // false - missing required keys
const result = UserProfile.validate(partialData);
if (Result.isErr(result)) {
    console.log(result.value); // ValidationError[] showing missing keys
}
```

### Benefits of Required Default Values

- **Consolidated definitions**: Type definitions and default values are defined in one place, eliminating the need to maintain separate default objects
- **Data integrity**: Never worry about missing required fields
- **API resilience**: Handle incomplete data gracefully from external APIs
- **Form handling**: Easily initialize forms with default values
- **Configuration**: Provide sensible defaults for optional configuration
- **Testing**: Generate complete test data from partial fixtures

```typescript
// Real-world example: API response handling
const ApiResponse = t.record({
    data: t.array(t.string('')),
    pagination: t.record({
        page: t.number(1),
        limit: t.number(10),
        total: t.number(0),
    }),
    meta: t.record({
        timestamp: t.number(Date.now()),
        version: t.string('1.0.0'),
    }),
});

// Handle incomplete API responses gracefully
const incompleteResponse = { data: ['item1', 'item2'] };
const completeResponse = ApiResponse.fill(incompleteResponse);
// All missing fields are automatically filled with their defaults
```

## Why ts-fortress over Zod and io-ts?

While ts-fortress, [Zod](https://github.com/colinhacks/zod), and [io-ts](https://github.com/gcanti/io-ts) are all excellent TypeScript validation libraries, ts-fortress provides enhanced type safety during validator construction and addresses critical runtime consistency issues found in io-ts.

### Type Safety in Schema Definition

**Problem with Zod**: The following code compiles without errors but creates an invalid schema:

```typescript
import * as z from 'zod';

// ❌ This compiles but is incorrect!
export const SomeObject = z.object({
    key1: 1, // Should be z.literal(1)
    key2: 'string', // Should be z.string()
});

export type SomeObject = z.infer<typeof SomeObject>; // inferred as { key1: unknown, key2: unknown }
```

The above Zod schema will fail at runtime because raw values (`1`, `'string'`) are not valid Zod validators.

**Correct Zod usage** requires remembering to wrap all values:

```typescript
// ✅ Correct Zod usage
export const SomeObject = z.object({
    key1: z.literal(1),
    key2: z.string(),
});
```

**ts-fortress prevents this error at compile time**:

```typescript
import * as t from 'ts-fortress';

// ❌ TypeScript error - this won't compile!
export const SomeObject = t.record({
    key1: 1, // Error: number is not assignable to Type<unknown>
    key2: 'string', // Error: string is not assignable to Type<unknown>
});

// ✅ Correct ts-fortress usage - enforced by TypeScript
export const SomeObject = t.record({
    key1: t.numberLiteral(1), // or t.number(1) with default
    key2: t.string(''),
});
```

### Benefits

- **Compile-time safety**: TypeScript catches invalid schema definitions immediately
- **IDE support**: Better autocomplete and error highlighting during development
- **Reduced runtime errors**: Impossible to create invalid schemas that fail at runtime
- **Self-documenting**: The type system guides you toward correct usage

### Deep Readonly Types by Default

**ts-fortress generates deeply readonly types**, promoting immutability and preventing accidental mutations:

```typescript
import * as t from 'ts-fortress';

const UserType = t.record({
    name: t.string(''),
    address: t.record({
        street: t.string(''),
        city: t.string(''),
    }),
    tags: t.array(t.string('')),
});

type User = t.TypeOf<typeof UserType>;
// ↑ Readonly<{
//     name: string;
//     address: Readonly<{
//       street: string;
//       city: string;
//     }>;
//     tags: readonly string[];
//   }>

const user: User = UserType.cast(someData);

// ❌ All of these produce TypeScript errors:
user.name = 'new name'; // Cannot assign to 'name' because it is read-only
user.address.street = 'new street'; // Cannot assign to 'street' because it is read-only
user.tags.push('new tag'); // Property 'push' does not exist on readonly array
user.tags[0] = 'modified'; // Index signature in type 'readonly string[]' only permits reading
```

**In contrast, Zod types are mutable by default**:

```typescript
import * as z from 'zod';

const UserSchema = z.object({
    name: z.string(),
    address: z.object({
        street: z.string(),
        city: z.string(),
    }),
    tags: z.array(z.string()),
});

type User = z.infer<typeof UserSchema>;
// ↑ {
//     name: string;
//     address: {
//       street: string;
//       city: string;
//     };
//     tags: string[];
//   }

const user: User = UserSchema.parse(someData);

// ✅ These all work in Zod (but may not be desirable):
user.name = 'new name'; // No error
user.address.street = 'new street'; // No error
user.tags.push('new tag'); // No error
user.tags[0] = 'modified'; // No error
```

### Benefits of Deep Readonly

- **Immutability by default**: Prevents accidental mutations that can lead to bugs
- **Functional programming support**: Encourages functional programming patterns
- **Predictable data flow**: Ensures data integrity throughout your application
- **Thread safety**: Immutable data is inherently safe to share between contexts

### Runtime-Type Consistency Issues in io-ts

**io-ts has several long-standing bugs** where runtime behavior doesn't match TypeScript types, which have remained unfixed for years:

#### 1. Keyof Type Mismatch ([Issue #697](https://github.com/gcanti/io-ts/issues/697))

```typescript
import * as t from 'io-ts';

const T = t.keyof({
    0: undefined,
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
});

// ❌ Runtime behavior is inconsistent with TypeScript types!
console.log(T.decode(0)); // Left (fails) - number 0 is rejected
console.log(T.decode('0')); // Right (succeeds) - string "0" is accepted

type T = t.TypeOf<typeof T>;
// ↑ TypeScript infers: 0 | 1 | 2 | 3 | 4 (number literals)
// But should be: "0" | "1" | "2" | "3" | "4" (string literals)

// The runtime validator only accepts strings, but TypeScript thinks it accepts numbers!
```

#### 2. Union + Undefined Decode Issues ([Issue #677](https://github.com/gcanti/io-ts/issues/677))

```typescript
import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';

const A = t.type({
    A: t.union([t.number, t.undefined, t.null]),
});

const B = t.type({
    B: t.union([t.number, t.undefined, t.null]),
});

const C = t.partial({
    C: t.union([t.number, t.null]),
});

// ❌ Case 1: Union decode adds unexpected fields
{
    const UnionBA = t.union([B, A]);
    const res = UnionBA.decode({ A: 1 });

    if (isRight(res)) {
        console.log(res.right); // { A: 1, B: undefined } <- NG (expected: { A: 1 })
        console.log(A.is(res.right)); // true  <- ok
        console.log(B.is(res.right)); // true  <- NG (expected: false)
    }
}

// ❌ Case 2: Union decode produces inconsistent results
{
    const UnionCA = t.union([C, A]);
    const res = UnionCA.decode({ A: 1 });

    if (isRight(res)) {
        console.log(res.right); // { A: 1 } <- NG (expected: {})
        console.log(A.is(res.right)); // true  <- ok
        console.log(C.is(res.right)); // true  <- ok
    }
}
```

**ts-fortress eliminates these problems** by ensuring strict runtime-type consistency:

```typescript
import * as t from 'ts-fortress';

// ✅ ts-fortress: Runtime and types always match
const T = t.keyof(
    t.record({
        0: t.undefinedType,
        1: t.undefinedType,
        2: t.undefinedType,
        3: t.undefinedType,
        4: t.undefinedType,
    }),
);

type T = t.TypeOf<typeof T>;
// ↑ TypeScript correctly infers: "0" | "1" | "2" | "3" | "4" (string literals)

// ✅ Runtime behavior matches TypeScript types exactly
console.log(T.validate(0)); // ❌ Fails correctly - number 0 is rejected
console.log(T.validate('0')); // ✅ Success - string "0" is accepted

// ✅ Complex union types work reliably without unexpected behavior
const A = t.record({
    A: t.union([t.number(0), t.undefinedType, t.nullType]),
});

const B = t.record({
    B: t.union([t.number(0), t.undefinedType, t.nullType]),
});

const C = t.partial(
    t.record({
        C: t.union([t.number(0), t.nullType]),
    }),
);

// ✅ Case 1: Union validation is predictable and correct
{
    const UnionBA = t.union([B, A]);
    const result = UnionBA.validate({ A: 1 });

    if (Result.isOk(result)) {
        console.log(result.value); // { A: 1 } <- ✅ Correct! No unexpected fields
        console.log(A.is(result.value)); // true  <- ✅ Correct
        console.log(B.is(result.value)); // false <- ✅ Correct! B requires field B
    }
}

// ✅ Case 2: Consistent validation behavior
{
    const UnionCA = t.union([C, A]);
    const result = UnionCA.validate({ A: 1 });

    if (Result.isOk(result)) {
        console.log(result.value); // { A: 1 } <- ✅ Correct and consistent
        console.log(A.is(result.value)); // true  <- ✅ Correct
        console.log(C.is(result.value)); // true  <- ✅ Consistent! ts-fortress partial types allow extra fields
    }
}
```

This makes ts-fortress especially valuable in large codebases where schema correctness is critical and runtime failures need to be minimized.

### Migration from io-ts

If you're coming from io-ts, here's how common patterns translate:

```typescript
// io-ts style
import * as t from 'io-ts';

const UserCodec = t.type({
    id: t.string,
    name: t.string,
    age: t.number,
});

type User = t.TypeOf<typeof UserCodec>;

// ts-fortress style
import * as t from 'ts-fortress';

const UserType = t.record({
    id: t.string(''),
    name: t.string(''),
    age: t.number(0),
});

type User = t.TypeOf<typeof UserType>;
```

Key differences:

- **Default values**: ts-fortress requires explicit default values for better type safety
- **Naming**: `record` instead of `type`, more explicit function names
- **Error handling**: `Result` type instead of `Either`
- **Branded types**: Rich collection of pre-built branded number types

## Core Concepts

### Type Interface

Every validator in ts-fortress implements the `Type<A>` interface:

```typescript
type Type<A> = Readonly<{
    typeName: string; // Human-readable type name
    defaultValue: A; // Default value for this type
    is: (a: unknown) => a is A; // Type guard function
    assertIs: (a: unknown) => asserts a is A; // Type assertion
    cast: (a: unknown) => A; // Cast with fallback to default
    fill: (a: unknown) => A; // Fill missing values with defaults
    validate: (a: unknown) => Result<A, readonly ValidationError[]>; // Detailed validation
}>;
```

### Primitive Types

```typescript
import * as t from 'ts-fortress';

// Basic primitives
const stringType = t.string('default');
const numberType = t.number(0);
const booleanType = t.boolean(false);
const nullType = t.nullType;
const undefinedType = t.undefinedType;

// Literal types
const statusType = t.stringLiteral('active');
const versionType = t.number(1);

// Arrays
const stringArrayType = t.array(t.string(''));
const nonEmptyArrayType = t.nonEmptyArray(t.number(0));

// Tuples
const coordinateType = t.tuple([t.number(0), t.number(0)]);
```

### Record Types

```typescript
// Define object schemas
const PersonType = t.record({
    firstName: t.string(''),
    lastName: t.string(''),
    age: t.number(0),
    address: t.record({
        street: t.string(''),
        city: t.string(''),
        zipCode: t.string(''),
    }),
});

type Person = t.TypeOf<typeof PersonType>;

// Optional fields
const UserProfileType = t.record({
    username: t.string(''),
    bio: t.optional(t.string('')), // Optional field
    settings: t.partial(
        t.record({
            // Partial record (all fields optional)
            theme: t.string('light'),
            notifications: t.boolean(true),
        }),
    ),
});

// Strict validation (disallow excess properties)
const StrictUserType = t.record(
    {
        id: t.string(''),
        name: t.string(''),
    },
    {
        allowExcessProperties: false, // Reject any properties not defined in schema
    },
);

// Alternatively, use the strictRecord alias for cleaner syntax
const StrictUserTypeAlias = t.strictRecord({
    id: t.string(''),
    name: t.string(''),
});

// Permissive validation (allow excess properties) - this is the default
const PermissiveUserType = t.record(
    {
        id: t.string(''),
        name: t.string(''),
    },
    {
        allowExcessProperties: true, // Allow additional properties (default behavior)
    },
);

// Example usage - both StrictUserType and StrictUserTypeAlias behave identically
const strictData = { id: '123', name: 'John', extra: 'not allowed' };
console.log(StrictUserType.is(strictData)); // false - 'extra' property causes rejection
console.log(StrictUserTypeAlias.is(strictData)); // false - same as above

const permissiveData = { id: '123', name: 'John', extra: 'allowed' };
console.log(PermissiveUserType.is(permissiveData)); // true - 'extra' property is allowed

// strictRecord provides cleaner syntax for strict validation
const UserSchema = t.strictRecord({
    name: t.string(''),
    email: t.string(''),
    age: t.number(0),
});

// Validation examples
UserSchema.is({ name: 'John', email: 'john@example.com', age: 30 }); // ✅ true
UserSchema.is({
    name: 'John',
    email: 'john@example.com',
    age: 30,
    role: 'admin',
}); // ❌ false - excess property
```

### Branded Types

ts-fortress provides extensive support for branded types to create domain-specific validation:

```typescript
// Simple branded types
const UserId = t.simpleBrandedString('UserId', '');
const Weight = t.simpleBrandedNumber('Weight', 0);

type UserId = t.TypeOf<typeof UserId>; // Brand<string, 'UserId'>
type Weight = t.TypeOf<typeof Weight>; // Brand<number, 'Weight'>

// Rich number validation types
const PositiveInt = t.positiveInt(1);
const SafeInt = t.safeInt(0);
const UInt16 = t.uint16(0);

// Usage
const userIdResult = UserId.validate('user_123');
if (Result.isOk(userIdResult)) {
    const id: UserId = userIdResult.value;
}
```

### Union and Intersection Types

```typescript
// Union types
const StatusType = t.union([
    t.stringLiteral('pending'),
    t.stringLiteral('completed'),
    t.stringLiteral('failed'),
]);

// Complex unions
const IdType = t.union([t.string(''), t.number(0)]);

// Intersection types
const TimestampedType = t.intersection([
    t.record({ data: t.string('') }),
    t.record({
        createdAt: t.number(Date.now()),
        updatedAt: t.number(Date.now()),
    }),
]);

// Merge records (similar to intersection but more specific)
const ExtendedUserType = t.mergeRecords([
    PersonType,
    t.record({
        id: t.string(''),
        email: t.string(''),
    }),
]);
```

### Enums

```typescript
// String enums
const ColorEnum = t.enumType(['red', 'green', 'blue']);
type Color = t.TypeOf<typeof ColorEnum>; // 'red' | 'green' | 'blue'

// Numeric ranges
const DiceRoll = t.uintRange({
    start: 1,
    end: 7,
    defaultValue: 1,
}); // integers from 1 to 6
type DiceRoll = t.TypeOf<typeof DiceRoll>; // 1 | 2 | 3 | 4 | 5 | 6
```

## Error Handling

ts-fortress uses `Result<T, readonly ValidationError[]>` for structured error handling with detailed error information:

```typescript
const UserType = t.record({
    name: t.string(''),
    age: t.number(0),
});

const invalidData = { name: 123, age: 'not a number' };

const result = UserType.validate(invalidData);
if (Result.isErr(result)) {
    // result.value is an array of ValidationError objects
    for (const error of result.value) {
        console.log('Path:', error.path); // ['name'] or ['age']
        console.log('Expected:', error.expectedType); // 'string' or 'number'
        console.log('Actual:', error.actualValue); // 123 or 'not a number'
        console.log('Type:', error.typeName); // type being validated
    }

    // Convert to string messages
    const messages = t.validationErrorsToMessages(result.value);
    console.log(messages);
    // ['Expected string at name, got number', 'Expected number at age, got string']
}

// Using assertions (throws on invalid data)
try {
    UserType.assertIs(invalidData);
} catch (error) {
    console.error('Validation failed:', error.message);
}

// Excess property validation example
const StrictType = t.record(
    {
        name: t.string(''),
        age: t.number(0),
    },
    {
        allowExcessProperties: false,
    },
);

const dataWithExcess = { name: 'John', age: 30, extra: 'not allowed' };
const strictResult = StrictType.validate(dataWithExcess);

if (Result.isErr(strictResult)) {
    console.log(strictResult.value);
    // [{
    //   path: ['extra'],
    //   actualValue: 'not allowed',
    //   expectedType: '{ name: string, age: number }',
    //   message: 'Excess property "extra" is not allowed',
    //   typeName: '{ name: string, age: number }'
    // }]
}
```

### ValidationError Structure

Each validation error provides detailed information:

```typescript
type ValidationError = Readonly<{
    path: readonly string[];
    actualValue: unknown; // The actual value that failed validation
    expectedType: string; // The expected type or constraint
    message: string | undefined; // Optional custom error message
    typeName: string; // Name of the type being validated
}>;
```

## API Reference

### Primitives

- `t.string(defaultValue)` - String validation
- `t.number(defaultValue)` - Number validation
- `t.boolean(defaultValue)` - Boolean validation
- `t.nullType` / `t.undefinedType` - Null/undefined validation
- `t.stringLiteral(value)` - Literal string types

### Collections

- `t.array(elementType)` - Array validation
- `t.nonEmptyArray(elementType)` - Non-empty array validation
- `t.tuple([t1, t2, ..., tN])` - Fixed-length tuple validation
- `t.arrayOfLength(size, elementType)` - Fixed-length array validation

### Objects

- `t.record(schema, options?)` - Object validation
    - `options.allowExcessProperties?: boolean` - Allow properties not defined in schema (default: true)
- `t.strictRecord(schema, options?)` - Object validation with strict mode (alias for `record` with `allowExcessProperties: false`)
- `t.keyValueRecord(keyType, valueType)` - Corresponding to the `Record<K, V>` type
- `t.partial(recordType)` - Make all fields optional
- `t.optional(type)` - Optional field wrapper
- `t.pick(recordType, keys)` - Pick specific fields
- `t.omit(recordType, keys)` - Omit specific fields
- `t.keyof(recordType)` - Key of the record type.

### Composition

- `t.union(types)` - Union type validation
- `t.intersection(types, defaultType)` - Intersection type validation
- `t.mergeRecords(recordTypes)` - Merge multiple record types

### Branded Types

- `t.simpleBrandedString(brandName, defaultValue)` - Simple string branding
- `t.simpleBrandedNumber(brandName, defaultValue)` - Simple number branding
- Number types: `t.int()`, `t.safeInt()`, `t.positiveInt()`, `t.uint16()`, etc.

### Utilities

- `t.TypeOf<T>` - Extract TypeScript type from validator
- `t.enumType(values)` - Enum validation
- `t.uintRange({ start, end, defaultValue? })` - Integer range validation
- `t.unknown` - Unknown Type

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](_media/LICENSE) file for details.

## Modules

- [array](array.md)
- [array/array](array/array.md)
- [array/array-of-length](array/array-of-length.md)
- [array/non-empty-array](array/non-empty-array.md)
- [array/tuple](array/tuple.md)
- [branded](branded.md)
- [branded/brand](branded/brand.md)
- [branded/number](branded/number.md)
- [branded/number/finite-number](branded/number/finite-number.md)
- [branded/number/int](branded/number/int.md)
- [branded/number/int16](branded/number/int16.md)
- [branded/number/int32](branded/number/int32.md)
- [branded/number/non-negative-finite-number](branded/number/non-negative-finite-number.md)
- [branded/number/non-zero-finite-number](branded/number/non-zero-finite-number.md)
- [branded/number/non-zero-int](branded/number/non-zero-int.md)
- [branded/number/non-zero-safe-int](branded/number/non-zero-safe-int.md)
- [branded/number/positive-finite-number](branded/number/positive-finite-number.md)
- [branded/number/positive-int](branded/number/positive-int.md)
- [branded/number/positive-safe-int](branded/number/positive-safe-int.md)
- [branded/number/safe-int](branded/number/safe-int.md)
- [branded/number/safe-uint](branded/number/safe-uint.md)
- [branded/number/uint](branded/number/uint.md)
- [branded/number/uint16](branded/number/uint16.md)
- [branded/number/uint32](branded/number/uint32.md)
- [branded/simple-branded-number](branded/simple-branded-number.md)
- [branded/simple-branded-string](branded/simple-branded-string.md)
- [compose](compose.md)
- [compose/intersection](compose/intersection.md)
- [compose/merge-records](compose/merge-records.md)
- [compose/union](compose/union.md)
- [enum](enum.md)
- [enum/enum](enum/enum.md)
- [enum/uint-range](enum/uint-range.md)
- [globals](globals.md)
- [primitives](primitives.md)
- [primitives/bigint](primitives/bigint.md)
- [primitives/boolean](primitives/boolean.md)
- [primitives/null](primitives/null.md)
- [primitives/number](primitives/number.md)
- [primitives/string](primitives/string.md)
- [primitives/symbol](primitives/symbol.md)
- [primitives/undefined](primitives/undefined.md)
- [record](record.md)
- [record/key-value-record](record/key-value-record.md)
- [record/keyof](record/keyof.md)
- [record/omit](record/omit.md)
- [record/optional](record/optional.md)
- [record/partial](record/partial.md)
- [record/pick](record/pick.md)
- [record/record](record/record.md)
- [type](type.md)
- [unknown](unknown.md)
- [utils](utils.md)
- [utils/create-assert-fn](utils/create-assert-fn.md)
- [utils/create-cast-fn](utils/create-cast-fn.md)
- [utils/create-is-fn](utils/create-is-fn.md)
- [utils/create-primitive-type](utils/create-primitive-type.md)
- [utils/create-type](utils/create-type.md)
- [utils/validation-error](utils/validation-error.md)
