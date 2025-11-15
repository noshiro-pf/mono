## Why ts-fortress over Zod and io-ts?

While ts-fortress, [Zod](https://github.com/colinhacks/zod), and [io-ts](https://github.com/gcanti/io-ts) are all excellent TypeScript validation libraries, ts-fortress offers more readable and informative error messages than both, a more type-safe way of building validators than Zod, and addresses some critical runtime consistency issues found in io-ts.

### Type Safety when Building Schemas

**Problem with Zod**: The following code compiles without errors but creates an invalid schema:

```tsx
import * as z from 'zod';

// ❌ This compiles but is incorrect!
const SomeObjectIncorrect = z.object({
    key1: 1, // Should be z.literal(1)
    key2: 'string', // Should be z.string()
});

type SomeObjectIncorrect = z.infer<typeof SomeObjectIncorrect>; // inferred as { key1: unknown, key2: unknown }
```

The above Zod schema will fail at runtime because raw values (`1`, `'string'`) are not valid Zod validators.

**Correct Zod usage** requires remembering to wrap all values:

```tsx
// ✅ Correct Zod usage
const SomeObject = z.object({
    key1: z.literal(1),
    key2: z.string(),
});
```

**ts-fortress prevents this error at compile time**:

```tsx
import * as t from 'ts-fortress';

// ❌ TypeScript error - this won't compile!
const SomeObjectIncorrect = t.record({
    // @ts-expect-error number is not assignable to Type<unknown>
    key1: 1,
    // @ts-expect-error string is not assignable to Type<unknown>
    key2: 'string',
});

// ✅ Correct ts-fortress usage - enforced by TypeScript
const SomeObject = t.record({
    key1: t.literal(1), // or t.number(1) with default
    key2: t.string(),
});
```

### Benefits

- **Compile-time safety**: TypeScript catches invalid schema definitions immediately.
- **IDE support**: The type system guides you toward correct usage

### Deep Readonly Types by Default

**ts-fortress generates deeply readonly types**, promoting immutability and preventing accidental mutations:

```tsx
import * as t from 'ts-fortress';

const UserType = t.record({
    name: t.string(),
    address: t.record({
        street: t.string(),
        city: t.string(),
    }),
    tags: t.array(t.string()),
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
// @ts-expect-error Cannot assign to 'name' because it is read-only
user.name = 'new name';
// @ts-expect-error Cannot assign to 'street' because it is read-only
user.address.street = 'new street';
// @ts-expect-error Property 'push' does not exist on readonly array
user.tags.push('new tag');
// @ts-expect-error Index signature in type 'readonly string[]' only permits reading
user.tags[0] = 'modified';
```

**In contrast, Zod types are mutable by default**:

```tsx
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

// None of these will result in a TypeScript compilation error:
user.name = 'new name';
user.address.street = 'new street';
user.tags.push('new tag');
user.tags[0] = 'modified';
```

**In io-ts, Readonly types will generate verbose error messages**:

```tsx
import * as ioTs from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';

// io-ts nested readonly version with multiple Readonly wrappers
const IoTsNestedReadonly = ioTs.readonly(
    ioTs.type({
        user: ioTs.readonly(
            ioTs.type({
                profile: ioTs.readonly(
                    ioTs.type({
                        age: ioTs.number,
                    }),
                ),
            }),
        ),
    }),
);

const invalidData = {
    user: {
        profile: {
            age: 'not-a-number', // should be number
        },
    },
} as const;

// Get io-ts error messages
const ioTsResult = IoTsNestedReadonly.decode(invalidData);
const ioTsErrorMessages = PathReporter.report(ioTsResult);

assert.equal(
    ioTsErrorMessages[0],
    `Invalid value "not-a-number" supplied to : Readonly<{ user: Readonly<{ profile: Readonly<{ age: number }> }> }>/user: Readonly<{ profile: Readonly<{ age: number }> }>/profile: Readonly<{ age: number }>/age: number`,
);
```

**The error message contains excessive `Readonly<...>` wrapper noise:**

- Root level: `Readonly<{ user: Readonly<{ profile: Readonly<{ age: number }> }> }>`
- User level: `Readonly<{ profile: Readonly<{ age: number }> }>`
- Profile level: `Readonly<{ age: number }>`
- Each nested readonly creates exponentially verbose error messages with redundant type information

This verbosity makes error messages extremely difficult to read and debug in production environments.

**ts-fortress addresses this issue** by generating clean, actionable error messages without verbose type wrapper details:

```tsx
import * as tf from 'ts-fortress';

// ts-fortress equivalent clean structure
const TsFortressNestedType = tf.record({
    user: tf.record({
        profile: tf.record({
            age: tf.number(),
        }),
    }),
});

// Get ts-fortress error messages
const tsFortressResult = TsFortressNestedType.validate(invalidData);
const tsFortressErrorMessages = tf.Result.isErr(tsFortressResult)
    ? tf.validationErrorsToMessages(tsFortressResult.value)
    : [];

assert.equal(
    tsFortressErrorMessages[0],
    `Error at user.profile.age: expected <number> value but <string> type value "not-a-number" was passed.`,
);
```

**ts-fortress vs Zod comparison:**

```tsx
import * as z from 'zod';

// Zod nested readonly equivalent
const ZodNestedType = z
    .object({
        user: z
            .object({
                profile: z
                    .object({
                        age: z.number(),
                    })
                    .readonly(),
            })
            .readonly(),
    })
    .readonly();

// Get Zod error messages using prettifyError
const zodResult = ZodNestedType.safeParse(invalidData);
const zodErrorMessages = zodResult.success
    ? ''
    : z.prettifyError(zodResult.error);

assert.equal(
    zodErrorMessages,
    '✖ Invalid input: expected number, received string\n  → at user.profile.age',
);
```

**Error message comparison:**

- **io-ts**: 148 characters of verbose type information mixed with the actual error
- **Zod**: 62 characters with visual formatting but missing the actual invalid value
- **ts-fortress**: 74 characters focused purely on what went wrong and where, including the actual invalid value

While Zod produces cleaner error messages than io-ts and includes helpful visual formatting, **ts-fortress provides superior debugging experience** by including the actual invalid value (`"not-a-number"`) in the error message, making it easier to understand what data caused the validation failure.

### Benefits of Deep Readonly

- **Immutability by default**: Prevents accidental mutations that can lead to bugs
- **Functional programming support**: Encourages functional programming patterns
- **Predictable data flow**: Ensures data integrity throughout your application
- **Thread safety**: Immutable data is inherently safe to share between contexts

### Runtime-Type Consistency Issues in io-ts

**io-ts has several long-standing bugs** where runtime behavior doesn't match TypeScript types, which have remained unfixed for years:

#### 1. Keyof Type Mismatch ([Issue #697](https://github.com/gcanti/io-ts/issues/697))

```tsx
import { isRight } from 'fp-ts/Either';
import * as t from 'io-ts';

const T = t.keyof({
    0: undefined,
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
});

// ❌ Runtime behavior is inconsistent with TypeScript types!
assert(!isRight(T.decode(0))); // number 0 is rejected
assert(isRight(T.decode('0'))); // string "0" is accepted

type T = t.TypeOf<typeof T>;
// ↑ TypeScript infers: 0 | 1 | 2 | 3 | 4 (number literals)
// But should be: "0" | "1" | "2" | "3" | "4" (string literals)

// The runtime validator only accepts strings, but TypeScript thinks it accepts numbers!
```

For this reason, the [io-ts documentation](https://github.com/gcanti/io-ts/blob/master/index.md#implemented-types--combinators) states that `t.keyof` only supports string keys (although this is somewhat dangerous, as the TypeScript type definition does not prevent the use of keys other than string).

**ts-fortress eliminates these problems** by ensuring strict runtime-type consistency:

```tsx
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
assert(t.Result.isErr(T.validate(0))); // ❌ Fails correctly - number 0 is rejected
assert(t.Result.isOk(T.validate('0'))); // ✅ Success - string "0" is accepted

// For this use case, if you want to define a union type of numeric literals, you can use `uintRange` from ts-fortress:

const U = t.uintRange({ start: 0, end: 5 });

type U = t.TypeOf<typeof U>;
// ↑ TypeScript correctly infers: 0 | 1 | 2 | 3 | 4 (number literals)

assert(t.Result.isErr(U.validate('0'))); // ❌ Fails - string "0" is rejected
assert(t.Result.isOk(U.validate(0))); // ✅ Success - number 0 is accepted
```

#### 2. Union + Undefined Decode Issues ([Issue #677](https://github.com/gcanti/io-ts/issues/677))

```tsx
import { isRight } from 'fp-ts/Either';
import * as t from 'io-ts';

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
        const expected = { A: 1 };
        assert.notDeepEqual(res.right, expected); // NG

        const actual = { A: 1, B: undefined };

        assert.deepStrictEqual(res.right, actual);

        assert.ok(A.is(res.right)); // ok
        assert.notOk(!B.is(res.right)); // NG (expected: false)
    }
}

// ❌ Case 2: Union decode produces inconsistent results
{
    const UnionCA = t.union([C, A]);
    const res = UnionCA.decode({ A: 1 });

    if (isRight(res)) {
        const expected = {};
        assert.notDeepEqual(res.right, expected); // NG

        const actual = { A: 1 };

        assert.deepStrictEqual(res.right, actual);

        assert(A.is(res.right)); // ok
        assert(C.is(res.right)); // ok
    }
}
```

**ts-fortress eliminates these problems** by ensuring strict runtime-type consistency:

```tsx
import * as t from 'ts-fortress';

// ✅ Complex union types work reliably without unexpected behavior
const A = t.record({
    A: t.union([t.number(), t.undefinedType, t.nullType]),
});

const B = t.record({
    B: t.union([t.number(), t.undefinedType, t.nullType]),
});

const C = t.partial(
    t.record({
        C: t.union([t.number(), t.nullType]),
    }),
);

// ✅ Case 1: Union validation is predictable and correct
{
    const UnionBA = t.union([B, A]);
    const result = UnionBA.validate({ A: 1 });

    if (t.Result.isOk(result)) {
        assert.deepStrictEqual(result.value, { A: 1 }); // Correct! No unexpected fields

        assert(A.is(result.value)); // Correct
        assert(!B.is(result.value)); // Correct! B requires field B
    }
}

// ✅ Case 2: Consistent validation behavior
{
    const UnionCA = t.union([C, A]);
    const result = UnionCA.validate({ A: 1 });

    if (t.Result.isOk(result)) {
        assert.deepStrictEqual(result.value, { A: 1 }); // Correct and consistent

        assert(A.is(result.value)); // Correct
        assert(C.is(result.value)); // Consistent! ts-fortress partial types allow extra fields
    }
}
```

This makes ts-fortress especially valuable in large codebases where schema correctness is critical and runtime failures need to be minimized.
