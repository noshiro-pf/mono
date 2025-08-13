# ts-fortress

TypeScript-first schema validation library with static type inference.

ts-fortress is a runtime validation library similar to [io-ts](https://github.com/gcanti/io-ts) and [zod](https://github.com/colinhacks/zod), designed to provide type-safe schema validation with excellent TypeScript integration and static type inference.

## Features

- 🔒 **Type-safe validation** - Full TypeScript support with static type inference
- 🏗️ **Composable schemas** - Build complex validation schemas from simple building blocks
- 🎯 **Zero-runtime overhead** - Type information is inferred at compile time
- 🔄 **Result-based error handling** - Structured error reporting with `Result<T, Error[]>`
- 🏷️ **Branded types** - Rich collection of branded number types (Int, SafeInt, PositiveInt, etc.)
- ⚡ **Performance focused** - Minimal runtime overhead and optimized validation
- 🧩 **Functional composition** - Union, intersection, and merge operations for schema composition

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
// ↑ { id: string; name: string; age: number; email: string; isActive: boolean }

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

// Get validation result with error details
const result = User.validate(userData);
if (result.isOk()) {
    const user = result.value; // typed as User
} else {
    console.error('Validation errors:', result.value); // string[] of error messages
}
```

## Core Concepts

### Type Interface

Every validator in ts-fortress implements the `Type<A>` interface:

```typescript
interface Type<A> {
    typeName: string; // Human-readable type name
    defaultValue: A; // Default value for this type
    is: (a: unknown) => a is A; // Type guard function
    assertIs: (a: unknown) => asserts a is A; // Type assertion
    cast: (a: unknown) => A; // Cast with fallback to default
    fill: (a: unknown) => A; // Fill missing values with defaults
    validate: (a: unknown) => Result<A, string[]>; // Detailed validation
}
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
if (userIdResult.isOk()) {
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
const ColorEnum = t.enum(['red', 'green', 'blue'] as const);
type Color = t.TypeOf<typeof ColorEnum>; // 'red' | 'green' | 'blue'

// Numeric ranges
const DiceRoll = t.uintRange(1, 6, 1); // integers from 1 to 6
type DiceRoll = t.TypeOf<typeof DiceRoll>; // 1 | 2 | 3 | 4 | 5 | 6
```

## Error Handling

ts-fortress uses `Result<T, string[]>` for structured error handling:

```typescript
const UserType = t.record({
    name: t.string(''),
    age: t.number(0),
});

const invalidData = { name: 123, age: 'not a number' };

const result = UserType.validate(invalidData);
if (result.isErr()) {
    console.log(result.value);
    // Array of error messages:
    // ['Expected string at name, got number', 'Expected number at age, got string']
}

// Using assertions (throws on invalid data)
try {
    UserType.assertIs(invalidData);
} catch (error) {
    console.error('Validation failed:', error.message);
}
```

## Migration from io-ts

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
- **Error handling**: Built-in `Result` type instead of `Either`
- **Branded types**: Rich collection of pre-built branded number types

## API Reference

### Primitives

- `t.string(defaultValue)` - String validation
- `t.number(defaultValue)` - Number validation
- `t.boolean(defaultValue)` - Boolean validation
- `t.nullType` / `t.undefinedType` - Null/undefined validation
- `t.stringLiteral(value)` - Literal string types

### Collections

- `t.array(elementType, options?)` - Array validation
- `t.nonEmptyArray(elementType, options?)` - Non-empty array validation
- `t.tuple([...types])` - Fixed-length tuple validation
- `t.arrayOfLength(elementType, length, options?)` - Fixed-length array validation

### Objects

- `t.record(schema, options?)` - Object validation
- `t.partial(recordType)` - Make all fields optional
- `t.optional(type)` - Optional field wrapper
- `t.pick(recordType, keys)` - Pick specific fields
- `t.omit(recordType, keys)` - Omit specific fields

### Composition

- `t.union(types, options?)` - Union type validation
- `t.intersection(types)` - Intersection type validation
- `t.mergeRecords(recordTypes)` - Merge multiple record types

### Branded Types

- `t.simpleBrandedString(brandName, defaultValue)` - Simple string branding
- `t.simpleBrandedNumber(brandName, defaultValue)` - Simple number branding
- Number types: `t.int()`, `t.safeInt()`, `t.positiveInt()`, `t.uint16()`, etc.

### Utilities

- `t.TypeOf<T>` - Extract TypeScript type from validator
- `t.enum(values)` - Enum validation
- `t.uintRange(min, max, defaultValue)` - Integer range validation

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
