**ts-fortress**

***

# ts-fortress

TypeScript-first schema validation library with static type inference.

[![npm version](https://img.shields.io/npm/v/ts-fortress.svg)](https://www.npmjs.com/package/ts-fortress)
[![npm downloads](https://img.shields.io/npm/dm/ts-fortress.svg)](https://www.npmjs.com/package/ts-fortress)
[![License](https://img.shields.io/npm/l/ts-fortress.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/ts-fortress/graph/badge.svg?token=Y522SWQTPB)](https://codecov.io/gh/noshiro-pf/ts-fortress)

**ts-fortress** is a runtime validation library similar to [io-ts](https://github.com/gcanti/io-ts) and [Zod](https://zod.dev/), designed to provide type-safe schema validation with excellent TypeScript integration and static type inference.

## Features

- 🔗 **Unified type and validator definition** - Define TypeScript types and corresponding runtime validators in a single declaration, ensuring consistency between compile-time types and runtime validation logic
- 🔒 **Type-safe validation** - Full TypeScript support with static type inference
- 📖 **Readonly by default** - All constructed types are fully readonly, preventing accidental mutations and promoting immutability
- ⚡ **Performance focused** - Optimized validation with minimal runtime overhead (negligible impact on application performance)
- 🛠️ **Required default values** - All schemas require explicit default values, enabling automatic data filling via `fill()` function
- 🏷️ **Branded types** - Rich collection of branded number types (Int, SafeInt, PositiveInt, etc.)
- 🔄 **Result-based error handling** - Structured error reporting with `Result<T, readonly ValidationError[]>`

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

```tsx
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

// Define a schema
const User = t.record({
    id: t.string(),
    name: t.string(),
    age: t.number(),
    email: t.optional(t.string()),
    isActive: t.boolean(),
});

// Infer TypeScript type
type User = t.TypeOf<typeof User>;

expectType<
    User,
    Readonly<{
        id: string;
        name: string;
        age: number;
        email?: string;
        isActive: boolean;
    }>
>('=');

// Validate data
const userData = {
    id: '123',
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    isActive: true,
} as const;

assert(User.is(userData));

if (User.is(userData)) {
    // userData is now typed as User
    userData satisfies User;

    assert.equal(
        `User: ${userData.name}, Age: ${userData.age}`,
        'User: John Doe, Age: 30',
    );
}

// Get validation result with error details
const result = User.validate(userData);
if (t.Result.isOk(result)) {
    result.value satisfies User; // typed as User
} else {
    console.error(
        'Validation errors:',
        result.value satisfies readonly t.ValidationError[],
    );
}
```

## Default Values and Data Filling

One of the key design decisions in ts-fortress is that **all schema types have explicit default values**, which allows for powerful data entry capabilities:

```tsx
import * as t from 'ts-fortress';

// Every type requires a default value
const UserProfile = t.record({
    name: t.string('Anonymous'), // Default: 'Anonymous'
    age: t.number(), // Default: 0
    email: t.optional(t.string()), // Optional field with default ''
    preferences: t.record({
        theme: t.string('light'), // Default: 'light'
        notifications: t.boolean(true), // Default: true
    }),
    tags: t.array(t.string()), // Default: empty array []
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

assert.deepStrictEqual(filledData, {
    name: 'John Doe',
    age: 0, // ← Filled with default
    email: '', // ← Filled with default
    preferences: {
        theme: 'dark',
        notifications: true, // ← Filled with default
    },
    tags: [], // ← Filled with default
});

// fill() is type-safe and always returns a complete object
type UserProfile = t.TypeOf<typeof UserProfile>;

// Important: Default value filling only occurs when fill() is called
// The is() and validate() functions can still detect missing keys
assert(!UserProfile.is(partialData)); // missing required keys

const result = UserProfile.validate(partialData);

assert(t.Result.isErr(result));

assert.deepStrictEqual(
    t.validationErrorsToMessages(
        result.value satisfies readonly t.ValidationError[],
    ),
    [
        `Missing required key "age" at age`,
        `Missing required key "notifications" at preferences.notifications`,
        `Missing required key "tags" at tags`,
    ],
);
```

### Benefits of Default Values

- **Consolidated definitions**: Type definitions and default values are defined in one place, eliminating the need to maintain separate default objects
- **Data integrity**: Never worry about missing required fields
- **API resilience**: Handle incomplete data gracefully from external APIs
- **Form handling**: Easily initialize forms with default values
- **Configuration**: Provide sensible defaults for optional configuration
- **Testing**: Generate complete test data from partial fixtures

### Convenient default values

Most ts-fortress types provide sensible defaults automatically, so you rarely need to specify explicit default values:

```tsx
import * as t from 'ts-fortress';

// Most common types have built-in defaults
const Schema = t.record({
    name: t.string(), // defaults to ""
    age: t.number(), // defaults to 0
    active: t.boolean(), // defaults to false
    tags: t.array(t.string()), // defaults to []
    config: t.record({
        debug: t.nullable(t.boolean()), // defaults to false
    }), // defaults to { debug: false }
});
```

You only need to specify explicit default values in two cases: when you want custom values, or when using `intersection` types:

```tsx
import * as t from 'ts-fortress';

// Custom default values
const ServerConfig = t.record({
    port: t.number(3000), // custom default: 3000
    host: t.string('localhost'), // custom default: 'localhost'
    retries: t.number(5), // custom default: 5
});

assert.deepStrictEqual(ServerConfig.defaultValue, {
    port: 3000,
    host: 'localhost',
    retries: 5,
} satisfies t.TypeOf<typeof ServerConfig>);

// Enum types have built-in defaults

const JobStatus = t.enumType(['started', 'scheduled', 'succeeded', 'failed']); // default: "started"

const JobFulfilledStatus = t.enumType(['succeeded', 'failed', 'cancelled']); // default: "succeeded"

// Intersection types require explicit defaults
const ReportStatus = t.intersection(
    [JobStatus, JobFulfilledStatus],
    t.enumType(['succeeded', 'failed']), // must provide combined default
);
```

This is because intersection types can be created from arbitrary types, making it impossible to automatically determine appropriate default values. However, when all constituent types are record types, you can use the `mergeRecords` function to avoid specifying defaults:

```tsx
import * as t from 'ts-fortress';

// Using mergeRecords for record-only intersections
const UserWithMetadata = t.mergeRecords([
    t.record({
        id: t.string(),
        name: t.string(),
    }),
    t.record({
        createdAt: t.number(),
        updatedAt: t.number(),
    }),
    // No explicit default needed - automatically combines defaults from both records
]);

assert.deepStrictEqual(UserWithMetadata.defaultValue, {
    id: '',
    name: '',
    createdAt: 0,
    updatedAt: 0,
} satisfies t.TypeOf<typeof UserWithMetadata>);
```

## Primitive Constraints

`t.string()`, `t.number()`, and `t.bigint()` accept optional constraint objects that refine both runtime validation and the inferred TypeScript type. Constraints are verified when the schema is created—invalid defaults throw immediately—and on every `is()`, `validate()`, and `cast()` call.

### String constraints

```tsx
import * as t from 'ts-fortress';

const Slug = t.string('feature-flag', {
    startsWith: 'feature',
    includes: '-',
    endsWith: 'flag',
    nonempty: true,
    minLength: 6,
    maxLength: 32,
    regex: /^[a-z-]+$/u,
});

Slug.is('feature-beta'); // true
Slug.is('Feature-Flag'); // false (fails regex)

type SlugType = t.TypeOf<typeof Slug>; // inferred as `feature${string}`
```

String constraints:

- `startsWith`, `endsWith`, `includes`
- `lowercase`, `uppercase`, `nonempty`
- `minLength`, `maxLength`
- `regex`

A negative `minLength` is ignored so you can enable or disable the bound dynamically without branching.

### Number constraints

```tsx
import * as t from 'ts-fortress';

const Percentage = t.number(100, {
    min: 0,
    max: 100,
    step: 5,
    nonNegative: true,
});

Percentage.is(75); // true
Percentage.is(72); // false (fails `step`)
Percentage.is(-5); // false (fails `min`/`nonNegative`)
```

Numeric constraints cover:

- Range: `gt`, `gte`, `min`, `lt`, `lte`, `max`
- Sign helpers: `positive`, `nonNegative`, `negative`, `nonPositive`
- Divisibility: `multipleOf`, `step`

### Bigint constraints

```tsx
import * as t from 'ts-fortress';

const PermissionsMask = t.bigint(0b11_1111n, {
    gte: 0n,
    lte: (1n << 6n) - 1n,
    multipleOf: 1n << 2n,
});

PermissionsMask.is(0b10_1100n); // true
PermissionsMask.is(0b10_1111n); // false (not divisible by 4)
```

Bigint constraints mirror the numeric API but operate on `bigint` literals. When `multipleOf` or `step` is `0n`, only `0n` passes the check.

> **Tip:** If a default value violates its constraints, `ts-fortress` throws during construction. This guards against invalid schemas ever reaching production.

## Why ts-fortress over Zod and io-ts?

While ts-fortress, [Zod](https://github.com/colinhacks/zod), and [io-ts](https://github.com/gcanti/io-ts) are all excellent TypeScript validation libraries, ts-fortress offers more readable and informative error messages than both, a more type-safe way of building validators than Zod, and addresses some critical runtime consistency issues found in io-ts.

For more information, please see [this documentation](_media/why-ts-fortress-over-zod-and-io-ts.md).

### Migration from io-ts

If you're coming from io-ts, here's how common patterns translate:

```tsx
// io-ts style
import * as t from 'io-ts';

const User = t.type({
    id: t.string,
    name: t.string,
    age: t.number,
});

type User = t.TypeOf<typeof User>;
```

```tsx
// ts-fortress style
import * as t from 'ts-fortress';

const User = t.record({
    id: t.string(),
    name: t.string(),
    age: t.number(20),
});

type User = t.TypeOf<typeof User>;
```

Key differences:

- **Default values**: ts-fortress types are functions to allow for explicit default values ​​etc.
- **Naming**: `record` instead of `type`, more explicit function names
- **Error handling**: `Result` type instead of `Either`

## Core Concepts

### Type Interface

Every validator in ts-fortress implements the `Type<A>` interface:

```tsx
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

#### API Method Usage

##### `validate` - Detailed validation with error reporting

The `validate` method performs comprehensive validation and returns a `Result` type. **When validation succeeds, it returns the original input object (same reference)**, preserving object identity:

```tsx
import * as t from 'ts-fortress';

const User = t.record({
    name: t.string(),
    age: t.number(),
});

// Success case - validates correctly
const validData = { name: 'Alice', age: 30 } as const;
const result = User.validate(validData);

assert(t.Result.isOk(result));
// In strip mode (default), a new object is created even without excess properties
assert.deepStrictEqual(result.value, { name: 'Alice', age: 30 });
assert.notEqual(result.value, validData);

// Error case - provides detailed error information
const invalidData = { name: 'Bob', age: 'thirty' } as const;
const errorResult = User.validate(invalidData);

assert(t.Result.isErr(errorResult));

assert.deepStrictEqual(errorResult.value, [
    {
        path: ['age'],
        actualValue: 'thirty',
        expectedType: 'number',
        typeName: 'number',
        details: undefined,
    },
]);

assert.deepStrictEqual(t.validationErrorsToMessages(errorResult.value), [
    'Expected <number> at age, got <string> type value "thirty".',
]);
```

##### `assertIs` - Type assertion with runtime checking

When using `assertIs`, you must assign it to a typed variable with an explicit type annotation due to TypeScript's limitations with assertion functions:

```tsx
import * as t from 'ts-fortress';

const numberType = t.number();

// ✅ Correct usage - explicit type annotation required
const assertIsNumber: (a: unknown) => asserts a is number = numberType.assertIs;

const processValue = (value: unknown): void => {
    assertIsNumber(value);

    // After assertion, TypeScript knows value is a number
    assertType<number>(value);
};

try {
    processValue(42); // Works
    processValue('not a number'); // Throws error
} catch (error) {
    assert.deepStrictEqual(
        error,
        new Error(
            `\nExpected <number>, got <string> type value "not a number".`,
        ),
    );
}

// Example with complex types
const User = t.record({
    id: t.string(),
    name: t.string(),
});

type User = t.TypeOf<typeof User>;

// Explicit type annotation for the assertion function
const assertIsUser: (a: unknown) => asserts a is User = User.assertIs;

const processUser = (data: unknown): void => {
    assertIsUser(data);

    // TypeScript now knows data is User type
    assertType<User>(data);
};
```

##### `cast` - Type casting with validation

The `cast` method validates the input and returns it if valid, otherwise **throws an Error** with validation details:

```tsx
import * as t from 'ts-fortress';

const Port = t.number(8080);

assert(Port.cast(3000) === 3000); // 3000 is a valid number

try {
    Port.cast('invalid'); // Throws Error!
} catch (error) {
    assert.deepStrictEqual(
        error,
        new Error('Expected <number>, got <string> type value "invalid".'),
    );
}
```

##### `fill` - Intelligent default value filling

The `fill` method attempts to preserve valid parts of the input while filling in missing or invalid values with defaults.

See [Default Values and Data Filling](#default-values-and-data-filling)

##### `defaultValue` - Accessing the default value

Every type has a `defaultValue` property that can be used for initialization:

```tsx
import * as t from 'ts-fortress';

const User = t.record({
    id: t.string(),
    name: t.string('Guest'),
    score: t.number(),
});

type User = t.TypeOf<typeof User>;

// Use defaultValue for initialization
const newUser: User = { ...User.defaultValue, id: 'user-123' };
// This default value filling process can also be written as follows:
const newUser2: User = User.fill({ id: 'user-456' });

assert.deepStrictEqual(newUser, { id: 'user-123', name: 'Guest', score: 0 });

assert.deepStrictEqual(newUser2, { id: 'user-456', name: 'Guest', score: 0 });

// Useful for React state initialization
const UserForm = () => {
    const [formData, setFormData] = useState<User>(User.defaultValue);
    // ...
};
```

### Primitive Types

```tsx
import * as t from 'ts-fortress';

// Basic primitives
const stringType = t.string('default');
const numberType = t.number();
const booleanType = t.boolean(false);
const nullType = t.nullType;
const undefinedType = t.undefinedType;

// Literal types
const statusType = t.literal('active');
const versionType = t.literal(1);

// Arrays
const stringArrayType = t.array(t.string());
const nonEmptyArrayType = t.nonEmptyArray(t.number());

// Tuples
const coordinateType = t.tuple([t.number(), t.number()]);
```

### Record Types

```tsx
import * as t from 'ts-fortress';

// Define object schemas
const Person = t.record({
    firstName: t.string(),
    lastName: t.string(),
    age: t.number(),
    address: t.record({
        street: t.string(),
        city: t.string(),
        zipCode: t.string(),
    }),
});

type Person = t.TypeOf<typeof Person>;

// Optional fields
const UserProfile = t.record({
    username: t.string(),
    bio: t.optional(t.string()), // Optional field
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
        id: t.string(),
        name: t.string(),
    },
    {
        excessPropertyValidation: 'error', // Reject any properties not defined in schema
        excessPropertyFill: 'strip',
    },
);

// Alternatively, use the strictRecord alias for cleaner syntax
const StrictUserTypeAlias = t.strictRecord({
    id: t.string(),
    name: t.string(),
});

// Permissive validation (allow excess properties) - this is the default
const PermissiveUserType = t.record(
    {
        id: t.string(),
        name: t.string(),
    },
    {
        excessPropertyValidation: 'allow', // Allow additional properties (default behavior)
        excessPropertyFill: 'allow',
    },
);

// Example usage - both StrictUserType and StrictUserTypeAlias behave identically
const strictData = { id: '123', name: 'John', extra: 'not allowed' };
assert(!StrictUserType.is(strictData)); // 'extra' property causes rejection
assert(!StrictUserTypeAlias.is(strictData)); // same as above

const permissiveData = { id: '123', name: 'John', extra: 'allowed' };
assert(PermissiveUserType.is(permissiveData)); // 'extra' property is allowed

// strictRecord provides cleaner syntax for strict validation
const UserSchema = t.strictRecord({
    name: t.string(),
    email: t.string(),
    age: t.number(),
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

### Refined Types

ts-fortress provides the `refine` function to create refined types with custom validation logic while leveraging existing base types:

```tsx
import * as t from 'ts-fortress';

// Create refined types
const Uuid = t.refine({
    baseType: t.string(),
    // Define custom validation logic
    is: (value: string): value is string =>
        /^[\da-f]{8}-[\da-f]{4}-[0-5][\da-f]{3}-[089ab][\da-f]{3}-[\da-f]{12}$/iu.test(
            value,
        ),
    defaultValue: '00000000-1111-2222-3333-444444444444',
    typeName: 'Uuid',
});

type Uuid = t.TypeOf<typeof Uuid>; // string (with runtime validation)

const PositiveNumber = t.refine({
    baseType: t.number(1),
    is: (value: number): value is number => value > 0,
    defaultValue: 1,
    typeName: 'PositiveNumber',
});

type PositiveNumber = t.TypeOf<typeof PositiveNumber>; // number (with runtime validation)

const EvenNumber = t.refine({
    baseType: t.number(),
    is: (value: number): value is number => value % 2 === 0,
    defaultValue: 0,
    typeName: 'EvenNumber',
});

// Usage in validation
const uuidResult = Uuid.validate('6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b');

assert(t.Result.isOk(uuidResult));

if (t.Result.isOk(uuidResult)) {
    const validUuid = uuidResult.value; // string, guaranteed to be valid Uuid format
}

const positiveResult = PositiveNumber.validate(42);

assert(t.Result.isOk(positiveResult));

if (t.Result.isOk(positiveResult)) {
    const positiveNum = positiveResult.value; // number, guaranteed to be > 0
}

// Invalid cases
assert(!Uuid.is('invalid-uuid'));
assert(!PositiveNumber.is(-5));
assert(!EvenNumber.is(7));

// Use in record schemas
const UserProfile = t.record({
    id: Uuid, // refined uuid validation
    score: PositiveNumber, // must be positive
    level: EvenNumber, // must be even
});

type UserProfile = t.TypeOf<typeof UserProfile>;

// The refined types maintain their validation in composite types
const userData = {
    id: '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b', // ✅ valid uuid format
    score: 85, // ✅ positive number
    level: 4, // ✅ even number
} as const satisfies UserProfile;

assert(UserProfile.is(userData));

const invalidData = {
    id: 'user123', // ❌ invalid uuid format
    score: -10, // ❌ negative number
    level: 3, // ❌ odd number
} as const;

const result = UserProfile.validate(invalidData);

assert(t.Result.isErr(result));

assert.deepStrictEqual(
    t.validationErrorsToMessages(
        result.value satisfies readonly t.ValidationError[],
    ),
    [
        'Expected <Uuid> at id, got <string> type value "user123".',
        'Expected <PositiveNumber> at score, got <number> type value `-10`.',
        'Expected <EvenNumber> at level, got <number> type value `3`.',
    ],
);
```

#### Key Benefits of Refined Types

- **Composable validation**: Build on existing base types while adding custom constraints
- **Type safety**: TypeScript types reflect the refined constraints at compile time
- **Clear error messages**: Validation errors clearly indicate which refinement failed
- **Reusable logic**: Define validation logic once and reuse across multiple schemas
- **Performance**: Leverages base type validation before applying custom refinements

#### Common Use Cases

```tsx
import * as t from 'ts-fortress';

// Domain-specific string types
const PhoneNumber = t.refine({
    baseType: t.string(),
    is: (s): s is string => /^\+?[\d\s()-]+$/u.test(s),
    defaultValue: '+1234567890',
    typeName: 'PhoneNumber',
});

const ZipCode = t.refine({
    baseType: t.string(),
    is: (s): s is string => /^\d{5}(-\d{4})?$/u.test(s),
    defaultValue: '12345',
    typeName: 'ZipCode',
});

// Constrained numeric types
const Percentage = t.refine({
    baseType: t.number(),
    is: (n): n is number => 0 <= n && n <= 100,
    defaultValue: 0,
    typeName: 'Percentage',
});

const Port = t.refine({
    baseType: t.number(3000),
    is: (n): n is number => Number.isInteger(n) && 1 <= n && n <= 65_535,
    defaultValue: 3000,
    typeName: 'Port',
});
```

### Branded Types

ts-fortress provides extensive support for branded types to create domain-specific validation:

```tsx
import * as t from 'ts-fortress';

// Simple branded types
const UserId = t.brandedString({ typeName: 'UserId', defaultValue: '' });
const Weight = t.brandedNumber({ typeName: 'Weight', defaultValue: 0 });

type UserId = t.TypeOf<typeof UserId>; // Brand<string, 'UserId'>
type Weight = t.TypeOf<typeof Weight>; // Brand<number, 'Weight'>

// Rich number validation types
const PositiveInt = t.positiveInt(1);
const SafeInt = t.safeInt(0);
const UInt16 = t.uint16(0);

// Usage
const userIdResult = UserId.validate('user_123');

assert(t.Result.isOk(userIdResult));

if (t.Result.isOk(userIdResult)) {
    const id: UserId = userIdResult.value;
}
```

### Union and Intersection Types

```tsx
import * as t from 'ts-fortress';

// Union types
const IdType = t.union([t.string(), t.number()]);

// Intersection types
const TimestampedType = t.intersection(
    [
        t.record({ data: t.string() }),
        t.record({
            createdAt: t.number(Date.now()),
            updatedAt: t.number(Date.now()),
        }),
    ],
    t.record({
        data: t.string(),
        createdAt: t.number(Date.now()),
        updatedAt: t.number(Date.now()),
    }),
);

// Merge records (similar to intersection but more specific)
const ExtendedUserType = t.mergeRecords([
    PersonType,
    t.record({
        id: t.string(),
        email: t.string(),
    }),
]);
```

### Enums

```tsx
import * as t from 'ts-fortress';

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

Tips: It is often better to use `uintRange` instead of `enumType` when possible, because `enumType` stores a Set of the sizes of its members as data, while `uintRange` only stores the range, resulting in smaller memory usage.

## Error Handling

ts-fortress uses `Result<T, readonly ValidationError[]>` for structured error handling with detailed error information:

```tsx
import * as t from 'ts-fortress';

const User = t.record({
    name: t.string(),
    age: t.number(),
});

type User = t.TypeOf<typeof User>;

const invalidData = { name: 123, age: 'not a number' };

const result = User.validate(invalidData);

assert(t.Result.isErr(result));

// result.value is an array of ValidationError objects

assert.deepStrictEqual(result.value, [
    {
        actualValue: 123,
        expectedType: 'string',
        path: ['name'],
        typeName: 'string',
        details: undefined,
    },
    {
        actualValue: 'not a number',
        expectedType: 'number',
        path: ['age'],
        typeName: 'number',
        details: undefined,
    },
] satisfies t.ValidationError[]);

// Convert to string messages
const messages = t.validationErrorsToMessages(result.value);

assert.deepStrictEqual(messages, [
    'Expected <string> at name, got <number> type value `123`.',
    'Expected <number> at age, got <string> type value "not a number".',
]);

const assertIsUser: (a: unknown) => asserts a is User = User.assertIs;

// Using assertions (throws on invalid data)
try {
    assertIsUser(invalidData);
} catch (error) {
    assert.deepStrictEqual(
        error,
        new Error(
            '\nExpected <string> at name, got <number> type value `123`.,\nExpected <number> at age, got <string> type value "not a number".',
        ),
    );
}

// Excess property validation example
const StrictType = t.record(
    {
        name: t.string(),
        age: t.number(),
    },
    {
        excessPropertyValidation: 'error',
        excessPropertyFill: 'strip',
    },
);

const dataWithExcess = { name: 'John', age: 30, extra: 'not allowed' };
const strictResult = StrictType.validate(dataWithExcess);

assert(t.Result.isErr(strictResult));

assert.deepStrictEqual(strictResult.value, [
    {
        path: ['extra'],
        actualValue: 'not allowed',
        expectedType: '{ name: string, age: number }',
        typeName: '{ name: string, age: number }',
        details: {
            kind: 'excess-key',
            key: 'extra',
        },
    },
]);
```

### ValidationError Structure

Each validation error provides detailed information:

```tsx
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
- `t.literal(value)` - Literal types (string, number, or boolean)

### Collections

- `t.array(elementType)` - Array validation
- `t.nonEmptyArray(elementType)` - Non-empty array validation
- `t.tuple([t1, t2, ..., tN])` - Fixed-length tuple validation
- `t.arrayOfLength(size, elementType)` - Fixed-length array validation
- `t.arrayAtLeastLength(size, elementType)` - Array validation with a minimum length

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

### Refinement

- `t.refine({ baseType, is, defaultValue })` - Refine `baseType` by `is` function
- `t.brand({ baseType, is, defaultValue, brandKeys, brandFalseKeys?, typeName? })` - Refine `baseType` by `is` function with brand typing
- `t.brandedString({ typeName, defaultValue, is? })` - String branding
- `t.brandedNumber({ typeName, defaultValue, is? })` - Number branding
- Number types: `t.int()`, `t.safeInt()`, `t.positiveInt()`, `t.uint16()`, etc.

### Utilities

- `t.TypeOf<T>` - Extract TypeScript type from validator
- `t.enumType(values)` - Enum validation
- `t.uintRange({ start, end, defaultValue? })` - Non-negative integer range validation
- `t.intRange({ start, end, defaultValue? })` - Integer range validation
- `t.unknown` - Unknown Type
- `t.recursion(typeName, definition)` - Define recursive type

### Pre-defined types

- `t.int8` / `t.uint8` - Int8 / Uint8
- `t.JsonValue` / `t.JsonPrimitive` / `t.JsonObject`
- `t.nullable(T)` - An alias of `t.union([T, t.undefinedType])`

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](_media/LICENSE) file for details.

## Modules

- [array](array.md)
- [array/array](array/array.md)
- [array/array-at-least-length](array/array-at-least-length.md)
- [array/array-of-length](array/array-of-length.md)
- [array/non-empty-array](array/non-empty-array.md)
- [array/tuple](array/tuple.md)
- [brand](brand.md)
- [brand/brand](brand/brand.md)
- [brand/branded-number](brand/branded-number.md)
- [brand/branded-string](brand/branded-string.md)
- [compose](compose.md)
- [compose/intersection](compose/intersection.md)
- [compose/merge-records](compose/merge-records.md)
- [compose/union](compose/union.md)
- [entry-point](entry-point/README.md)
- [enum](enum.md)
- [enum/enum](enum/enum.md)
- [enum/int-range](enum/int-range.md)
- [enum/uint-range](enum/uint-range.md)
- [globals](globals.md)
- [other-types](other-types.md)
- [other-types/literal](other-types/literal.md)
- [other-types/map](other-types/map.md)
- [other-types/recursion](other-types/recursion.md)
- [other-types/refine](other-types/refine.md)
- [other-types/set](other-types/set.md)
- [other-types/unknown](other-types/unknown.md)
- [predefined](predefined.md)
- [predefined/brand](predefined/brand.md)
- [predefined/brand/number](predefined/brand/number.md)
- [predefined/brand/number/finite-number](predefined/brand/number/finite-number.md)
- [predefined/brand/number/int](predefined/brand/number/int.md)
- [predefined/brand/number/int16](predefined/brand/number/int16.md)
- [predefined/brand/number/int32](predefined/brand/number/int32.md)
- [predefined/brand/number/non-negative-finite-number](predefined/brand/number/non-negative-finite-number.md)
- [predefined/brand/number/non-zero-finite-number](predefined/brand/number/non-zero-finite-number.md)
- [predefined/brand/number/non-zero-int](predefined/brand/number/non-zero-int.md)
- [predefined/brand/number/non-zero-safe-int](predefined/brand/number/non-zero-safe-int.md)
- [predefined/brand/number/positive-finite-number](predefined/brand/number/positive-finite-number.md)
- [predefined/brand/number/positive-int](predefined/brand/number/positive-int.md)
- [predefined/brand/number/positive-safe-int](predefined/brand/number/positive-safe-int.md)
- [predefined/brand/number/safe-int](predefined/brand/number/safe-int.md)
- [predefined/brand/number/safe-uint](predefined/brand/number/safe-uint.md)
- [predefined/brand/number/uint](predefined/brand/number/uint.md)
- [predefined/brand/number/uint16](predefined/brand/number/uint16.md)
- [predefined/brand/number/uint32](predefined/brand/number/uint32.md)
- [predefined/brand/string](predefined/brand/string.md)
- [predefined/brand/string/email](predefined/brand/string/email.md)
- [predefined/brand/string/iso-8601](predefined/brand/string/iso-8601.md)
- [predefined/brand/string/json-string](predefined/brand/string/json-string.md)
- [predefined/brand/string/uuid](predefined/brand/string/uuid.md)
- [predefined/int8](predefined/int8.md)
- [predefined/json](predefined/json.md)
- [predefined/nullable](predefined/nullable.md)
- [predefined/uint8](predefined/uint8.md)
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
- [record/required](record/required.md)
- [record/valueof](record/valueof.md)
- [type](type/README.md)
- [utils](utils.md)
- [utils/create-assert-fn](utils/create-assert-fn.md)
- [utils/create-cast-fn](utils/create-cast-fn.md)
- [utils/create-is-fn](utils/create-is-fn.md)
- [utils/create-primitive-type](utils/create-primitive-type.md)
- [utils/create-type](utils/create-type.md)
- [utils/to-union-string](utils/to-union-string.md)
- [utils/validation-error](utils/validation-error.md)
