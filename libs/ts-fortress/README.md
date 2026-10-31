# ts-fortress

TypeScript-first schema validation library with static type inference.

## Documentation

- API reference: <https://noshiro-pf.github.io/mono/ts-fortress/>

[![npm version](https://img.shields.io/npm/v/ts-fortress.svg)](https://www.npmjs.com/package/ts-fortress)
[![npm downloads](https://img.shields.io/npm/dm/ts-fortress.svg)](https://www.npmjs.com/package/ts-fortress)
[![License](https://img.shields.io/npm/l/ts-fortress.svg)](https://github.com/noshiro-pf/mono/blob/main/libs/ts-fortress/LICENSE)
[![codecov](https://codecov.io/gh/noshiro-pf/mono/graph/badge.svg?component=ts-fortress)](https://codecov.io/gh/noshiro-pf/mono)

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
} as const as unknown;

assert.isTrue(User.is(userData));

if (User.is(userData)) {
    // userData is now typed as User
    userData satisfies User;

    expectType<typeof userData.age, number>('=');

    expectType<typeof userData.email, string | undefined>('=');

    assert.strictEqual(
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
} as const;

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
assert.isFalse(UserProfile.is(partialData)); // missing required keys

const result = UserProfile.validate(partialData);

assert.isTrue(t.Result.isErr(result));

assert.deepStrictEqual(
    t.validationErrorsToMessages(
        result.value satisfies readonly t.ValidationError[],
    ),
    [
        'Error at age: missing required key "age".',
        'Error at preferences.notifications: missing required key "notifications".',
        'Error at tags: missing required key "tags".',
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

### Dropping invalid array elements

`fill` keeps an array's valid elements and, by default, replaces each invalid one with its filled value. When repairing stored data such as settings, an element that no longer makes sense is usually better removed than turned into a default unrelated to what was saved; `t.array(elementType, { onInvalidElement: 'drop' })` does that:

```tsx
import * as t from 'ts-fortress';

const SortSpec = t.record({
    key: t.enumType(['title', 'priority']),
    order: t.enumType(['asc', 'desc']),
});

const saved = [
    { key: 'colour', order: 'desc' }, // a key that no longer exists
    { key: 'priority', order: 'asc' },
] as const;

// By default, an invalid element is replaced with its filled value, so the
// unknown key turns into the default key 'title'
assert.deepStrictEqual(t.array(SortSpec).fill(saved), [
    { key: 'title', order: 'desc' },
    { key: 'priority', order: 'asc' },
]);

// With onInvalidElement: 'drop', it is removed instead
assert.deepStrictEqual(
    t.array(SortSpec, { onInvalidElement: 'drop' }).fill(saved),
    [{ key: 'priority', order: 'asc' }],
);
```

An element is judged as a whole by the element type's `is`, so a nested record or array with one wrong part is dropped rather than repaired. The option changes `fill` only: `prune` takes a value that is already of the type, so it never meets an invalid element.

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

Slug.is('feature-new-flag'); // true

Slug.is('Feature-Flag'); // false (fails regex)

type SlugType = t.TypeOf<typeof Slug>;
// inferred as a `feature${string}` template literal branded with
// `NonEmptyString`, `MinLengthString<6>` and `MaxLengthString<32>`
```

String constraints:

- `startsWith`, `endsWith`, `includes` — narrow the result to the corresponding template literal type
- `lowercase`, `uppercase`
- `nonempty` — brands the result as `NonEmptyString` (from [ts-type-forge](https://github.com/noshiro-pf/mono/tree/main/libs/ts-type-forge))
- `minLength`, `maxLength` — brand the result as `MinLengthString<N>` / `MaxLengthString<N>` (from ts-type-forge), which preserve the natural subtyping between length bounds
- `regex`

`minLength` / `maxLength` accept plain `number`s, which must be positive integers (`>= 1`) — passing a non-integer or a value less than `1` throws a `TypeError` when the type is constructed. Number literals in the range `1..39` are encoded in the result brand (`MinLengthString<N>` / `MaxLengthString<N>`); larger literals and dynamically computed `number`s are still enforced at runtime, but the result type falls back to plain `string` to keep the type-level computation cheap.

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

const PermissionsMask = t.bigint(0b11_1100n, {
    gte: 0n,
    lte: (1n << 6n) - 1n,
    multipleOf: 1n << 2n,
});

PermissionsMask.is(0b10_1100n); // true

PermissionsMask.is(0b10_1111n); // false (not divisible by 4)
```

Bigint constraints mirror the numeric API but operate on `bigint` literals. When `multipleOf` or `step` is `0n`, only `0n` passes the check.

### Reading constraints back

A constrained type carries the constraints it was given on a `constraints` property, so the numbers a schema validates against can also drive the UI — an `<input>`'s `min` / `max` / `step`, a character counter — instead of being written down a second time and drifting.

```tsx
import * as t from 'ts-fortress';

const SignupForm = t.record({
    age: t.int(20, { min: 0, max: 120 }),
    displayName: t.string('a', { minLength: 1, maxLength: 32 }),
});

// The values the schema validates against are readable back off it, so a form
// control can be driven by the same numbers instead of a second copy of them.
const age = t.at(SignupForm, 'age');

const min: 0 = age.constraints.min;

const max: 120 = age.constraints.max;

// A constraint that was not specified is `undefined` — not `number | undefined`
const step: undefined = age.constraints.step;

// The record's shape reaches the same member type directly
const maxLength: 32 = SignupForm.shape.displayName.constraints.maxLength;
```

What that gives you:

- **Every constraint key is present**, so a constraint that _was_ specified is read without `?.` and at the literal type it was given (`age.constraints.max` is `120`, not `number | undefined`). One that was _not_ specified is typed `undefined`, so a typo or a missing constraint is a compile error rather than a silent `undefined` at runtime.
- **Wrappers keep it.** `t.refine` and `t.brand` carry the base type's constraints over, and so do the branded constructors built on them — `t.int(0, { min: 0, max: 100 }).constraints.max` reads `100`. Branding or refining a type that carries no constraints adds no `constraints` property at all.
- **Records reach it.** `t.record` and `t.strictRecord` expose the shape they were built from as `.shape`, and `t.at(SignupForm, 'age')` returns that very member type — constraints included. An optional member widens to `T | undefined` and still carries the member's constraints. Record types assembled at runtime — `t.pick`, `t.omit`, `t.partial`, `t.mergeRecords`, `t.keyValueRecord` — carry no shape, so `t.at` on one of those falls back to a plain `Type` as before.
- `t.ConstraintsOf<typeof age>` names the constraint record of a type, for passing it around or picking fields out of.

> **Tip:** If a default value violates its constraints, `ts-fortress` throws during construction. This guards against invalid schemas ever reaching production.

## JSON Schema

`t.toJsonSchema(type)` writes the JSON Schema (draft 2020-12, the dialect OpenAPI 3.1 uses) of the JSON values a type accepts, so that an editor, a config file's `$schema`, or an API document can be generated from the type instead of being written a second time and drifting from it.

```tsx
import * as t from 'ts-fortress';

const Config = t.strictRecord({
    name: t.string('app', { minLength: 1 }),
    retries: t.optional(t.uint32()),
    mode: t.enumType(['fast', 'safe']),
});

const schema = t.toJsonSchema(Config);

assert.deepStrictEqual(
    schema,
    t.Result.ok({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1 },
            retries: {
                type: 'integer',
                minimum: 0,
                exclusiveMaximum: 4_294_967_296,
                'x-brand': 'Uint32',
            },
            mode: { enum: ['fast', 'safe'] },
        },
        required: ['name', 'mode'],
        additionalProperties: false,
    }),
);

// A part that has no JSON form is an error, named by where it would go
const WithBigint = t.record({ id: t.bigint() });

assert.deepStrictEqual(
    t.toJsonSchema(WithBigint),
    t.Result.err([
        {
            kind: 'not-json',
            schemaPath: '/properties/id',
            typeName: 'bigint',
            message: 'no JSON value is of the kind `bigint`',
        },
    ]),
);
```

How it reads a type:

- **It is read off the type's `structure`.** Every type the package builds carries a `structure` describing what it was built from (`{ kind: 'record', shape, excessProperty }`, `{ kind: 'union', memberTypes }`, ...), and `constraints` for the constrained primitives. A `Type` written by hand without one is an `'opaque'` error.
- **Constraints become keywords**: `minLength` / `maxLength` / `pattern` for strings, `minimum` / `exclusiveMaximum` / `multipleOf` for numbers, `integer` for `int` and the integer ranges, `minItems` / `maxItems` for the length-constrained arrays. The predefined branded numbers say what their brands mean, so `t.uint32()` is an integer from 0 to 2^32 - 1.
- **Records** list every member not wrapped in `t.optional` under `required`, and `t.strictRecord` adds `additionalProperties: false`. **Unions** become `anyOf`, or `oneOf` with an OpenAPI `discriminator` when a literal key tells the members apart; **intersections** become `allOf`; **recursions** become `$defs` entries named after their `typeName`.
- **A predicate cannot be written down.** `t.refine`, `t.templateLiteral` and the `uppercase` / `lowercase` string constraints add their names to `x-refined`, and `t.brand` its name to `x-brand`; there the schema accepts more than the type does, and the type stays the authority.
- **No JSON value is a `bigint`, `symbol`, `undefined`, `Map` or `Set`**, so such a type is a `'not-json'` error — except as a union member, which is left out: `t.nullable(t.string())` is a string.
- Default values are not written as `default`, since every type has one and a client would read every property as one it may leave out. Pass `{ includeSchemaUri: false }` to leave `$schema` off a schema embedded in another document.

### Annotations

`t.annotate(type, { title, description, format, examples, deprecated })` gives a type what a reader of its schema needs and its structure cannot say. `toJsonSchema` writes each under the keyword of the same name, `title` and `description` first.

```tsx
import * as t from 'ts-fortress';

const Config = t.strictRecord({
    name: t.annotate(t.string('app'), {
        description: 'The name the service registers under.',
    }),
    retries: t.optional(
        t.annotate(t.uint32(), {
            description: 'How many times a failed request is retried.',
            examples: [t.asUint32(3)],
        }),
    ),
    id: t.uuid(),
});

const schema = t.toJsonSchema(
    t.annotate(Config, { title: 'Service configuration' }),
    { includeSchemaUri: false },
);

assert.deepStrictEqual(
    schema,
    t.Result.ok({
        title: 'Service configuration',
        type: 'object',
        properties: {
            name: {
                description: 'The name the service registers under.',
                type: 'string',
            },
            retries: {
                description: 'How many times a failed request is retried.',
                type: 'integer',
                minimum: 0,
                exclusiveMaximum: 4_294_967_296,
                'x-brand': 'Uint32',
                examples: [3],
            },
            // `uuid()` carries the `uuid` format of its own
            id: {
                type: 'string',
                minLength: 1,
                'x-brand': 'Uuid',
                format: 'uuid',
            },
        },
        required: ['name', 'id'],
        additionalProperties: false,
    }),
);

// Annotations never change what is valid
assert.isTrue(t.annotate(t.string(), { format: 'email' }).is('not an e-mail'));
```

- **Annotations change nothing the type does.** Validation, `fill`, `prune`, the default value, `constraints` and a record's `shape` are those of the type annotated, and a `format` is a description: the type decides what is valid.
- **`t.optional` and `t.annotate` go either way round.** `t.optional(t.annotate(x, ...))` and `t.annotate(t.optional(x), ...)` are the same record member.
- **A key given again replaces the earlier one**, so `t.annotate(t.uuid(), { format: 'my-uuid' })` replaces the `uuid` format `t.uuid()` carries. `t.uuid()` is the only predefined type with a `format`: what `t.email()`, `t.uri()` and `t.iso8601()` accept is not contained in the JSON Schema format of that name, and a validator that asserted it would reject some of their values.
- **`examples` are values of the type**, checked by `toJsonSchema`: one the type does not accept is an `'invalid-example'` error, and one that is not JSON a `'not-json'` error.
- An annotated `t.recursion` is annotated at each `$ref` to it; annotate the type its definition returns to annotate the `$defs` entry.

## Why ts-fortress over Zod and io-ts?

While ts-fortress, [Zod](https://github.com/colinhacks/zod), and [io-ts](https://github.com/gcanti/io-ts) are all excellent TypeScript validation libraries, ts-fortress offers more readable and informative error messages than both, a more type-safe way of building validators than Zod, and addresses some critical runtime consistency issues found in io-ts.

For more information, please see [this documentation](https://github.com/noshiro-pf/mono/blob/main/libs/ts-fortress/documents/why-ts-fortress-over-zod-and-io-ts.md).

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

- **Default values**: ts-fortress types are functions to allow for explicit default values, etc.
- **Naming**: `record` instead of `type`, more explicit function names
- **Error handling**: `Result` type instead of `Either`

## Core Concepts

### Type Interface

Every validator in ts-fortress implements the `Type<A>` interface:

```tsx
import type { StrictOmit } from 'ts-type-forge';

type Type<A> = Readonly<{
    typeName: string; // Human-readable type name
    defaultValue: A; // Default value for this type
    is: (a: unknown) => a is A; // Type guard function
    assertIs: (a: unknown) => asserts a is A; // Type assertion
    cast: (a: unknown) => A; // Cast with fallback to default
    fill: (a: unknown) => A; // Fill missing values with defaults
    prune: <B extends A>(a: B) => A; // Recursively remove excess properties
    validate: (a: unknown) => Result<A, readonly ValidationError[]>; // Detailed validation
    structure?: TypeStructure; // What the type is built from, readable at runtime
    annotations?: TypeAnnotations; // Title, description, format, ... (see `annotate`)
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

assert.isTrue(t.Result.isOk(result));

// A valid input is returned as is (the same reference)
assert.deepStrictEqual(result.value, { name: 'Alice', age: 30 });

assert.strictEqual(result.value, validData);

// Error case - provides detailed error information
const invalidData = { name: 'Bob', age: 'thirty' } as const;

const errorResult = User.validate(invalidData);

assert.isTrue(t.Result.isErr(errorResult));

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
    'Error at age: expected <number> type but <string> type value "thirty" was passed.',
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
            '\nError: expected <number> type but <string> type value "not a number" was passed.',
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

assert.isTrue(Port.cast(3000) === 3000); // 3000 is a valid number

try {
    Port.cast('invalid'); // Throws Error!
} catch (error) {
    assert.deepStrictEqual(
        error,
        new Error(
            'Error: expected <number> type but <string> type value "invalid" was passed.',
        ),
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
const newUser: User = { ...User.defaultValue, id: 'user-123' } as const;

// This default value filling process can also be written as follows:
const newUser2: User = User.fill({ id: 'user-456' });

assert.deepStrictEqual(newUser, { id: 'user-123', name: 'Guest', score: 0 });

assert.deepStrictEqual(newUser2, { id: 'user-456', name: 'Guest', score: 0 });

// Useful for React state initialization
const UserForm = () => {
    const [formData, setFormData] = useState<User>(User.defaultValue);

    // ...
    IGNORE_EMBEDDING(formData, setFormData);
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
        excessProperty: 'reject', // Reject any properties not defined in schema
    },
);

// Alternatively, use the strictRecord alias for cleaner syntax
const StrictUserTypeAlias = t.strictRecord({
    id: t.string(),
    name: t.string(),
});

// Permissive validation (allow excess properties)
const PermissiveUserType = t.record(
    {
        id: t.string(),
        name: t.string(),
    },
    {
        excessProperty: 'allow', // Allow additional properties and keep them in results
    },
);

// Example usage - both StrictUserType and StrictUserTypeAlias behave identically
const strictData = { id: '123', name: 'John', extra: 'not allowed' } as const;

assert.isFalse(StrictUserType.is(strictData)); // 'extra' property causes rejection

assert.isFalse(StrictUserTypeAlias.is(strictData)); // same as above

const permissiveData = { id: '123', name: 'John', extra: 'allowed' } as const;

assert.isTrue(PermissiveUserType.is(permissiveData)); // 'extra' property is allowed

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

assert.isTrue(t.Result.isOk(uuidResult));

if (t.Result.isOk(uuidResult)) {
    const validUuid = uuidResult.value; // string, guaranteed to be valid Uuid format

    IGNORE_EMBEDDING(validUuid);
}

const positiveResult = PositiveNumber.validate(42);

assert.isTrue(t.Result.isOk(positiveResult));

if (t.Result.isOk(positiveResult)) {
    const positiveNum = positiveResult.value; // number, guaranteed to be > 0

    IGNORE_EMBEDDING(positiveNum);
}

// Invalid cases
assert.isFalse(Uuid.is('invalid-uuid'));

assert.isFalse(PositiveNumber.is(-5));

assert.isFalse(EvenNumber.is(7));

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

assert.isTrue(UserProfile.is(userData));

const invalidData = {
    id: 'user123', // ❌ invalid uuid format
    score: -10, // ❌ negative number
    level: 3, // ❌ odd number
} as const;

const result = UserProfile.validate(invalidData);

assert.isTrue(t.Result.isErr(result));

assert.deepStrictEqual(
    t.validationErrorsToMessages(
        result.value satisfies readonly t.ValidationError[],
    ),
    [
        'Error at id: expected <Uuid> type but <string> type value "user123" was passed.',
        'Error at score: expected <PositiveNumber> type but <number> type value `-10` was passed.',
        'Error at level: expected <EvenNumber> type but <number> type value `3` was passed.',
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

assert.isTrue(t.Result.isOk(userIdResult));

if (t.Result.isOk(userIdResult)) {
    const id: UserId = userIdResult.value;

    IGNORE_EMBEDDING(id);
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

// Numeric ranges (end is exclusive)
const DiceRoll = t.uintRange(1, 7, { defaultValue: 1 }); // integers from 1 to 6

type DiceRoll = t.TypeOf<typeof DiceRoll>; // 1 | 2 | 3 | 4 | 5 | 6

// Numeric ranges (end is inclusive)
const DiceRoll2 = t.uintRangeInclusive(1, 6, { defaultValue: 1 }); // integers from 1 to 6

type DiceRoll2 = t.TypeOf<typeof DiceRoll2>; // 1 | 2 | 3 | 4 | 5 | 6
```

Tips: It is often better to use `uintRange` instead of `enumType` when possible, because `enumType` stores a Set of its members as data, while `uintRange` only stores the range, resulting in smaller memory usage.

## Error Handling

ts-fortress uses `Result<T, readonly ValidationError[]>` for structured error handling with detailed error information:

```tsx
import * as t from 'ts-fortress';

const User = t.record({
    name: t.string(),
    age: t.number(),
});

type User = t.TypeOf<typeof User>;

const invalidData = { name: 123, age: 'not a number' } as const;

const result = User.validate(invalidData);

assert.isTrue(t.Result.isErr(result));

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
] satisfies readonly t.ValidationError[]);

// Convert to string messages
const messages = t.validationErrorsToMessages(result.value);

assert.deepStrictEqual(messages, [
    'Error at name: expected <string> type but <number> type value `123` was passed.',
    'Error at age: expected <number> type but <string> type value "not a number" was passed.',
]);

const assertIsUser: (a: unknown) => asserts a is User = User.assertIs;

// Using assertions (throws on invalid data)
try {
    assertIsUser(invalidData);
} catch (error) {
    assert.deepStrictEqual(
        error,
        new Error(
            '\nError at name: expected <string> type but <number> type value `123` was passed.,\nError at age: expected <number> type but <string> type value "not a number" was passed.',
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
        excessProperty: 'reject',
    },
);

const dataWithExcess = { name: 'John', age: 30, extra: 'not allowed' } as const;

const strictResult = StrictType.validate(dataWithExcess);

assert.isTrue(t.Result.isErr(strictResult));

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
    typeName: string; // Name of the type being validated
    details?: ValidationErrorDetails | undefined; // Structured information used to build a descriptive message
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
- `t.fixedLengthTuple(size, elementType)` - Fixed-length array validation
- `t.minLengthTuple(size, elementType)` - Array validation with a minimum length
- `t.maxLengthTuple(size, elementType)` - Array validation with a maximum length
- `t.boundedLengthTuple(min, max, elementType)` - Array validation with a length between `min` and `max` (inclusive)

### Objects

- `t.record(schema, options?)` - Object validation
    - `options.excessProperty?: 'allow' | 'reject'` - How properties not defined in the schema are handled (default: `'allow'`)
- `t.strictRecord(schema, options?)` - Object validation with strict mode (alias for `record` with `excessProperty: 'reject'`)
- `t.keyValueRecord(keyType, valueType)` - Corresponding to the `Record<K, V>` type
- `t.partial(recordType)` - Make all fields optional
- `t.optional(type)` - Optional field wrapper
- `t.pick(recordType, keys)` - Pick specific fields
- `t.omit(recordType, keys)` - Omit specific fields
- `t.keyof(recordType)` - Key of the record type.
- `t.at(recordType, key)` - The member type stored at `key`. On a record built by `t.record` / `t.strictRecord` it returns the shape's own member type, constraints and all; those record types also expose `.shape` directly.

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
- `type.constraints` - The constraints a `t.string` / `t.number` / `t.bigint` type (or a `t.refine` / `t.brand` wrapper of one) was created with. Every constraint key is present; the unspecified ones are typed `undefined`. See [Reading constraints back](#reading-constraints-back)
- `t.ConstraintsOf<T>` - The constraint record carried by a type
- `t.attachConstraints(type, constraints)` - Attach constraint values to a type of your own
- `type.structure` - What a type was built from, discriminated by `kind` (`t.TypeStructure`)
- `t.toJsonSchema(type, { includeSchemaUri? })` - The JSON Schema of a type. See [JSON Schema](#json-schema)
- `t.annotate(type, { title?, description?, format?, examples?, deprecated? })` - A type with annotations for its JSON Schema (`type.annotations`). See [Annotations](#annotations)
- `t.enumType(values)` - Enum validation
- `t.uintRange(start, end, { defaultValue? })` - Non-negative integer range validation (`end` is exclusive)
- `t.intRange(start, end, { defaultValue? })` - Integer range validation (`end` is exclusive)
- `t.uintRangeInclusive(start, end, { defaultValue? })` - Non-negative integer range validation (`end` is inclusive)
- `t.intRangeInclusive(start, end, { defaultValue? })` - Integer range validation (`end` is inclusive)
- `t.unknown()` - Unknown Type
- `t.recursion(typeName, definition)` - Define recursive type

### Pre-defined types

- `t.int8()` / `t.uint8()` - Int8 / Uint8
- `t.JsonValue` / `t.JsonPrimitive` / `t.JsonObject`
- `t.nullable(T)` - An alias of `t.union([T, t.undefinedType])`

## Contributing

We welcome contributions! Please open an issue or a pull request in the [noshiro-pf/mono](https://github.com/noshiro-pf/mono) repository.

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.
