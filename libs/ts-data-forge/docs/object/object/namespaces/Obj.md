[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [object/object](../README.md) / Obj

# Obj

A collection of type-safe object utility functions providing functional programming patterns
for object manipulation, including pick, omit, shallow equality checks, and more.

All functions maintain TypeScript type safety and support both direct and curried usage patterns
for better composition with pipe operations.

## Functions

### fromEntries()

> **fromEntries**\<`Entries`\>(`entries`): `IsFixedLengthList`\<`Entries`\> _extends_ `true` ? `Readonly`\<`EntriesToObjectImpl`\<\{ \}, `Entries`\>\> : `PartialIfKeyIsUnion`\<`TypeEq`\<`Entries`\[`"length"`\], `0`\> _extends_ `true` ? `never` : `TypeEq`\<`Tail`\<`Entries`\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<`Entries`\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<`Entries`\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<`Tail`\<...\>\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<`Entries`\>\[`0`\]\[`0`\] \| `Tail`\<`Tail`\<...\>\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<...\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<...\>\[`"length"`\], `0`\> _extends_ `true` ? ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] : `TypeEq`\<...\[...\], `0`\> _extends_ `true` ? ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] : `TypeEq`\<..., ...\> _extends_ `true` ? ... \| ... \| ... \| ... \| ... \| ... \| ... : ... _extends_ ... ? ... : ..., `ReadonlyRecord`\<`TypeEq`\<`Entries`\[`"length"`\], `0`\> _extends_ `true` ? `never` : `TypeEq`\<`Tail`\<`Entries`\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<`Entries`\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<`Entries`\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<...\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<...\>\[`"length"`\], `0`\> _extends_ `true` ? ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] : `TypeEq`\<...\[...\], `0`\> _extends_ `true` ? ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] : `TypeEq`\<..., ...\> _extends_ `true` ? ... \| ... \| ... \| ... \| ... \| ... : ... _extends_ ... ? ... : ..., `TypeEq`\<`Entries`\[`"length"`\], `0`\> _extends_ `true` ? `never` : `TypeEq`\<`Tail`\<`Entries`\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`1`\] : `TypeEq`\<`Tail`\<`Tail`\<`Entries`\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`1`\] \| `Tail`\<`Entries`\>\[`0`\]\[`1`\] : `TypeEq`\<`Tail`\<`Tail`\<...\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`1`\] \| `Tail`\<...\>\[`0`\]\[`1`\] \| `Tail`\<...\>\[`0`\]\[`1`\] : `TypeEq`\<`Tail`\<...\>\[`"length"`\], `0`\> _extends_ `true` ? ...\[...\]\[`1`\] \| ...\[...\]\[`1`\] \| ...\[...\]\[`1`\] \| ...\[...\]\[`1`\] : `TypeEq`\<...\[...\], `0`\> _extends_ `true` ? ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] : `TypeEq`\<..., ...\> _extends_ `true` ? ... \| ... \| ... \| ... \| ... \| ... : ... _extends_ ... ? ... : ...\>\>

Defined in: [src/object/object.mts:356](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/object/object.mts#L356)

Creates an object from an array of key-value pairs with precise TypeScript typing.
This is a type-safe wrapper around `Object.fromEntries` that provides better type inference
and compile-time guarantees about the resulting object structure.

**Type Behavior**:

- When entries is a fixed-length tuple, the exact object type is inferred
- When entries has dynamic length with union key types, `Partial` is applied to prevent
  incorrect assumptions about which keys will be present

#### Type Parameters

##### Entries

`Entries` _extends_ readonly readonly \[`PropertyKey`, `unknown`\][]

The readonly array type of key-value entry tuples

#### Parameters

##### entries

`Entries`

An array of readonly key-value entry tuples `[key, value]`

#### Returns

`IsFixedLengthList`\<`Entries`\> _extends_ `true` ? `Readonly`\<`EntriesToObjectImpl`\<\{ \}, `Entries`\>\> : `PartialIfKeyIsUnion`\<`TypeEq`\<`Entries`\[`"length"`\], `0`\> _extends_ `true` ? `never` : `TypeEq`\<`Tail`\<`Entries`\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<`Entries`\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<`Entries`\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<`Tail`\<...\>\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<`Entries`\>\[`0`\]\[`0`\] \| `Tail`\<`Tail`\<...\>\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<...\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<...\>\[`"length"`\], `0`\> _extends_ `true` ? ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] : `TypeEq`\<...\[...\], `0`\> _extends_ `true` ? ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] : `TypeEq`\<..., ...\> _extends_ `true` ? ... \| ... \| ... \| ... \| ... \| ... \| ... : ... _extends_ ... ? ... : ..., `ReadonlyRecord`\<`TypeEq`\<`Entries`\[`"length"`\], `0`\> _extends_ `true` ? `never` : `TypeEq`\<`Tail`\<`Entries`\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<`Entries`\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<`Entries`\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<`Tail`\<...\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] \| `Tail`\<...\>\[`0`\]\[`0`\] : `TypeEq`\<`Tail`\<...\>\[`"length"`\], `0`\> _extends_ `true` ? ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] \| ...\[...\]\[`0`\] : `TypeEq`\<...\[...\], `0`\> _extends_ `true` ? ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] : `TypeEq`\<..., ...\> _extends_ `true` ? ... \| ... \| ... \| ... \| ... \| ... : ... _extends_ ... ? ... : ..., `TypeEq`\<`Entries`\[`"length"`\], `0`\> _extends_ `true` ? `never` : `TypeEq`\<`Tail`\<`Entries`\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`1`\] : `TypeEq`\<`Tail`\<`Tail`\<`Entries`\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`1`\] \| `Tail`\<`Entries`\>\[`0`\]\[`1`\] : `TypeEq`\<`Tail`\<`Tail`\<...\>\>\[`"length"`\], `0`\> _extends_ `true` ? `Entries`\[`0`\]\[`1`\] \| `Tail`\<...\>\[`0`\]\[`1`\] \| `Tail`\<...\>\[`0`\]\[`1`\] : `TypeEq`\<`Tail`\<...\>\[`"length"`\], `0`\> _extends_ `true` ? ...\[...\]\[`1`\] \| ...\[...\]\[`1`\] \| ...\[...\]\[`1`\] \| ...\[...\]\[`1`\] : `TypeEq`\<...\[...\], `0`\> _extends_ `true` ? ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] \| ...\[...\] : `TypeEq`\<..., ...\> _extends_ `true` ? ... \| ... \| ... \| ... \| ... \| ... : ... _extends_ ... ? ... : ...\>\>

An object created from the entries with precise typing

#### Example

```typescript
// Fixed entries with precise typing
const fixedEntries = [
    ['name', 'Alice'],
    ['age', 30],
    ['active', true],
] as const;

const user = Obj.fromEntries(fixedEntries);
// Type: { readonly name: "Alice"; readonly age: 30; readonly active: true }
// Value: { name: "Alice", age: 30, active: true }

// Simple coordinate example
const coordEntries = [
    ['x', 1],
    ['y', 3],
] as const;
const point = Obj.fromEntries(coordEntries);
// Type: { readonly x: 1; readonly y: 3 }
// Value: { x: 1, y: 3 }

// Dynamic entries with union keys
const dynamicEntries: Array<['name' | 'email', string]> = [
    ['name', 'Alice'],
    // email might or might not be present
];
const partialUser = Obj.fromEntries(dynamicEntries);
// Type: Partial<{ name: string; email: string }>
// This prevents assuming both 'name' and 'email' are always present

// Creating configuration objects
const configEntries = [
    ['apiUrl', 'https://api.example.com'],
    ['timeout', 5000],
    ['retries', 3],
    ['debug', false],
] as const;
const config = Obj.fromEntries(configEntries);
// Precise types for each configuration value

// Converting Maps to objects
const settingsMap = new Map([
    ['theme', 'dark'],
    ['language', 'en'],
    ['notifications', true],
] as const);
const settings = Obj.fromEntries([...settingsMap]);

// Building objects from computed entries
const keys = ['a', 'b', 'c'] as const;
const values = [1, 2, 3] as const;
const computedEntries = keys.map((k, i) => [k, values[i]] as const);
const computed = Obj.fromEntries(computedEntries);
// Type reflects the specific key-value associations

// Error handling with validation
function createUserFromEntries(
    entries: ReadonlyArray<readonly [string, unknown]>,
) {
    const user = Obj.fromEntries(entries);
    // Type is Partial<Record<string, unknown>> - safe for dynamic data

    if ('name' in user && typeof user.name === 'string') {
        // Type narrowing works correctly
        return { name: user.name, ...user };
    }
    throw new Error('Invalid user data');
}
```

---

### omit()

#### Call Signature

> **omit**\<`R`, `Keys`\>(`record`, `keys`): `Omit`\<`R`, `ArrayElement`\<`Keys`\>\>

Defined in: [src/object/object.mts:229](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/object/object.mts#L229)

Creates a new record that excludes the specified keys from the source record.
This function supports both direct usage and curried form for functional composition.

**Type Safety**: Only keys that exist in the source record type are allowed,
and the return type precisely reflects which properties remain after omission.

##### Type Parameters

###### R

`R` _extends_ `UnknownRecord`

The type of the input record

###### Keys

`Keys` _extends_ readonly keyof `R`[]

The readonly array type of keys to omit from the record

##### Parameters

###### record

`R`

The source record to omit properties from

###### keys

`Keys`

A readonly array of keys to exclude from the result

##### Returns

`Omit`\<`R`, `ArrayElement`\<`Keys`\>\>

A new record containing all properties except the specified keys

##### Example

```typescript
// Direct usage
const original = { a: 1, b: 2, c: 3, d: 4 };
Obj.omit(original, ['a', 'c']); // { b: 2, d: 4 }
Obj.omit(original, ['b']); // { a: 1, c: 3, d: 4 }
Obj.omit(original, []); // { a: 1, b: 2, c: 3, d: 4 } (no keys omitted)

// Real-world example: removing sensitive data
const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'secret123',
    apiKey: 'abc-def-ghi',
    lastLogin: new Date(),
};

// Create safe user object for client-side
const safeUser = Obj.omit(user, ['password', 'apiKey']);
// Result: { id: 1, name: "Alice", email: "alice@example.com", lastLogin: Date }

// Curried usage for data processing pipelines
const removeSensitive = Obj.omit(['password', 'apiKey', 'ssn'] as const);
const users = [user]; // array of user objects
const safeUsers = users.map(removeSensitive);

// Using with pipe for complex transformations
import { pipe } from '../functional/pipe.mjs';
const publicProfile = pipe(user)
    .map(Obj.omit(['password', 'apiKey']))
    .map((u) => ({ ...u, displayName: u.name.toUpperCase() })).value;
// Result: { id: 1, name: "Alice", email: "...", lastLogin: Date, displayName: "ALICE" }

// Database queries: exclude computed fields
const dbUser = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Alice Johnson', // computed field
    isActive: true, // computed field
};

const storableData = Obj.omit(dbUser, ['fullName', 'isActive']);
// Only data that should be persisted to database

// Type safety prevents invalid operations
// Obj.omit(user, ['invalidKey']); // ❌ TypeScript error
// Obj.omit(user, ['id', 'nonExistentField']); // ❌ TypeScript error

// Handling partial omission (when some keys might not exist)
const partialUser = { id: 1, name: 'Alice', password: 'secret' } as const;
const omitCredentials = Obj.omit(['password', 'apiKey']); // apiKey might not exist
const cleaned = omitCredentials(partialUser); // { id: 1, name: "Alice" }
```

#### Call Signature

> **omit**\<`Keys`\>(`keys`): \<`R`\>(`record`) => `Omit`\<`R`, `ArrayElement`\<`Keys`\>\>

Defined in: [src/object/object.mts:235](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/object/object.mts#L235)

Creates a new record that excludes the specified keys from the source record.
This function supports both direct usage and curried form for functional composition.

**Type Safety**: Only keys that exist in the source record type are allowed,
and the return type precisely reflects which properties remain after omission.

##### Type Parameters

###### Keys

`Keys` _extends_ readonly `PropertyKey`[]

The readonly array type of keys to omit from the record

##### Parameters

###### keys

`Keys`

A readonly array of keys to exclude from the result

##### Returns

A new record containing all properties except the specified keys

> \<`R`\>(`record`): `Omit`\<`R`, `ArrayElement`\<`Keys`\>\>

###### Type Parameters

###### R

`R` _extends_ `UnknownRecord`

###### Parameters

###### record

`R`

###### Returns

`Omit`\<`R`, `ArrayElement`\<`Keys`\>\>

##### Example

```typescript
// Direct usage
const original = { a: 1, b: 2, c: 3, d: 4 };
Obj.omit(original, ['a', 'c']); // { b: 2, d: 4 }
Obj.omit(original, ['b']); // { a: 1, c: 3, d: 4 }
Obj.omit(original, []); // { a: 1, b: 2, c: 3, d: 4 } (no keys omitted)

// Real-world example: removing sensitive data
const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'secret123',
    apiKey: 'abc-def-ghi',
    lastLogin: new Date(),
};

// Create safe user object for client-side
const safeUser = Obj.omit(user, ['password', 'apiKey']);
// Result: { id: 1, name: "Alice", email: "alice@example.com", lastLogin: Date }

// Curried usage for data processing pipelines
const removeSensitive = Obj.omit(['password', 'apiKey', 'ssn'] as const);
const users = [user]; // array of user objects
const safeUsers = users.map(removeSensitive);

// Using with pipe for complex transformations
import { pipe } from '../functional/pipe.mjs';
const publicProfile = pipe(user)
    .map(Obj.omit(['password', 'apiKey']))
    .map((u) => ({ ...u, displayName: u.name.toUpperCase() })).value;
// Result: { id: 1, name: "Alice", email: "...", lastLogin: Date, displayName: "ALICE" }

// Database queries: exclude computed fields
const dbUser = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Alice Johnson', // computed field
    isActive: true, // computed field
};

const storableData = Obj.omit(dbUser, ['fullName', 'isActive']);
// Only data that should be persisted to database

// Type safety prevents invalid operations
// Obj.omit(user, ['invalidKey']); // ❌ TypeScript error
// Obj.omit(user, ['id', 'nonExistentField']); // ❌ TypeScript error

// Handling partial omission (when some keys might not exist)
const partialUser = { id: 1, name: 'Alice', password: 'secret' } as const;
const omitCredentials = Obj.omit(['password', 'apiKey']); // apiKey might not exist
const cleaned = omitCredentials(partialUser); // { id: 1, name: "Alice" }
```

---

### pick()

#### Call Signature

> **pick**\<`R`, `Keys`\>(`record`, `keys`): `Pick`\<`R`, `ArrayElement`\<`Keys`\>\>

Defined in: [src/object/object.mts:116](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/object/object.mts#L116)

Creates a new record that contains only the specified keys from the source record.
This function supports both direct usage and curried form for functional composition.

**Type Safety**: Only keys that exist in the source record type are allowed,
preventing runtime errors from accessing non-existent properties.

##### Type Parameters

###### R

`R` _extends_ `UnknownRecord`

The type of the input record

###### Keys

`Keys` _extends_ readonly keyof `R`[]

The readonly array type of keys to pick from the record

##### Parameters

###### record

`R`

The source record to pick properties from

###### keys

`Keys`

A readonly array of keys to include in the result

##### Returns

`Pick`\<`R`, `ArrayElement`\<`Keys`\>\>

A new record containing only the specified keys and their values

##### Example

```typescript
// Direct usage
const original = { a: 1, b: 2, c: 3, d: 4 };
Obj.pick(original, ['a', 'c']); // { a: 1, c: 3 }
Obj.pick(original, ['b']); // { b: 2 }
Obj.pick(original, []); // {} (empty result)

// Real-world example with user data
const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'secret123',
    age: 30,
};

// Extract public user information
const publicUser = Obj.pick(user, ['id', 'name', 'email']);
// Result: { id: 1, name: "Alice", email: "alice@example.com" }

// Curried usage for functional composition
const pickIdAndName = Obj.pick(['id', 'name'] as const);
const users = [user, { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 }];
const publicUsers = users.map(pickIdAndName);
// Result: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]

// Using with pipe for data transformation
import { pipe } from '../functional/pipe.mjs';
const result = pipe(user)
    .map(Obj.pick(['id', 'name']))
    .map((u) => ({ ...u, displayName: u.name.toUpperCase() })).value;
// Result: { id: 1, name: "Alice", displayName: "ALICE" }

// Type safety prevents invalid keys
// Obj.pick(user, ['invalidKey']); // ❌ TypeScript error
// Obj.pick(user, ['id', 'nonExistentField']); // ❌ TypeScript error

// Partial key selection (when some keys might not exist)
const partialUser = { id: 1, name: 'Alice' } as const;
const pickVisible = Obj.pick(['name', 'age']); // age might not exist
const visible = pickVisible(partialUser); // { name: "Alice" } (age omitted)
```

#### Call Signature

> **pick**\<`Keys`\>(`keys`): \<`R`\>(`record`) => `RelaxedPick`\<`R`, `ArrayElement`\<`Keys`\>\>

Defined in: [src/object/object.mts:122](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/object/object.mts#L122)

Creates a new record that contains only the specified keys from the source record.
This function supports both direct usage and curried form for functional composition.

**Type Safety**: Only keys that exist in the source record type are allowed,
preventing runtime errors from accessing non-existent properties.

##### Type Parameters

###### Keys

`Keys` _extends_ readonly `PropertyKey`[]

The readonly array type of keys to pick from the record

##### Parameters

###### keys

`Keys`

A readonly array of keys to include in the result

##### Returns

A new record containing only the specified keys and their values

> \<`R`\>(`record`): `RelaxedPick`\<`R`, `ArrayElement`\<`Keys`\>\>

###### Type Parameters

###### R

`R` _extends_ `UnknownRecord`

###### Parameters

###### record

`R`

###### Returns

`RelaxedPick`\<`R`, `ArrayElement`\<`Keys`\>\>

##### Example

```typescript
// Direct usage
const original = { a: 1, b: 2, c: 3, d: 4 };
Obj.pick(original, ['a', 'c']); // { a: 1, c: 3 }
Obj.pick(original, ['b']); // { b: 2 }
Obj.pick(original, []); // {} (empty result)

// Real-world example with user data
const user = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'secret123',
    age: 30,
};

// Extract public user information
const publicUser = Obj.pick(user, ['id', 'name', 'email']);
// Result: { id: 1, name: "Alice", email: "alice@example.com" }

// Curried usage for functional composition
const pickIdAndName = Obj.pick(['id', 'name'] as const);
const users = [user, { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 }];
const publicUsers = users.map(pickIdAndName);
// Result: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]

// Using with pipe for data transformation
import { pipe } from '../functional/pipe.mjs';
const result = pipe(user)
    .map(Obj.pick(['id', 'name']))
    .map((u) => ({ ...u, displayName: u.name.toUpperCase() })).value;
// Result: { id: 1, name: "Alice", displayName: "ALICE" }

// Type safety prevents invalid keys
// Obj.pick(user, ['invalidKey']); // ❌ TypeScript error
// Obj.pick(user, ['id', 'nonExistentField']); // ❌ TypeScript error

// Partial key selection (when some keys might not exist)
const partialUser = { id: 1, name: 'Alice' } as const;
const pickVisible = Obj.pick(['name', 'age']); // age might not exist
const visible = pickVisible(partialUser); // { name: "Alice" } (age omitted)
```

---

### shallowEq()

> **shallowEq**(`a`, `b`, `eq`): `boolean`

Defined in: [src/object/object.mts:44](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/object/object.mts#L44)

Performs a shallow equality check on two records using a configurable equality function.
Verifies that both records have the same number of entries and that for every key in the first record,
the corresponding value passes the equality test with the value in the second record.

#### Parameters

##### a

`UnknownRecord`

The first record to compare

##### b

`UnknownRecord`

The second record to compare

##### eq

(`x`, `y`) => `boolean`

Optional equality function (defaults to Object.is for strict equality)

#### Returns

`boolean`

`true` if the records are shallowly equal according to the equality function, `false` otherwise

#### Example

```typescript
// Basic usage with default Object.is equality
Obj.shallowEq({ x: 1, y: 2 }, { x: 1, y: 2 }); // true
Obj.shallowEq({ x: 1 }, { x: 1, y: 2 }); // false (different number of keys)
Obj.shallowEq({ x: 1 }, { x: 2 }); // false (different values)
Obj.shallowEq({}, {}); // true (both empty)

// String comparisons
Obj.shallowEq({ a: 'hello' }, { a: 'hello' }); // true
Obj.shallowEq({ a: 'hello' }, { a: 'world' }); // false

// Using custom equality function
const caseInsensitiveEq = (a: unknown, b: unknown) =>
    typeof a === 'string' && typeof b === 'string'
        ? a.toLowerCase() === b.toLowerCase()
        : a === b;

Obj.shallowEq({ name: 'ALICE' }, { name: 'alice' }, caseInsensitiveEq); // true

// Handling special values
Obj.shallowEq({ x: NaN }, { x: NaN }); // true (Object.is treats NaN === NaN)
Obj.shallowEq({ x: +0 }, { x: -0 }); // false (Object.is distinguishes +0 and -0)
```
