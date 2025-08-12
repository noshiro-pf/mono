[**ts-data-forge**](../README.md)

---

[ts-data-forge](../README.md) / guard/is-type

# guard/is-type

## Functions

### isBigint()

> **isBigint**(`u`): `u is bigint`

Defined in: [src/guard/is-type.mts:180](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L180)

Type guard that checks if a value is a bigint.

**Type Narrowing Behavior:**

- Narrows `unknown` to `bigint` when `true`
- Identifies values created with `BigInt()` constructor or `n` suffix

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is bigint`

`true` if `u` is a bigint, `false` otherwise.
When `true`, TypeScript narrows the type to `bigint`.

#### Example

```typescript
const userInput: unknown = parseInput();

if (isBigint(userInput)) {
    // userInput is now typed as bigint
    console.log('BigInt value:', userInput.toString());
    const doubled = userInput * 2n; // Safe bigint operations
}
```

---

### isBoolean()

> **isBoolean**(`u`): `u is boolean`

Defined in: [src/guard/is-type.mts:77](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L77)

Type guard that checks if a value is a boolean.

**Type Narrowing Behavior:**

- Narrows `unknown` to `boolean` when `true`
- Preserves literal boolean types (`true | false`)

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is boolean`

`true` if `u` is a boolean, `false` otherwise.
When `true`, TypeScript narrows the type to `boolean`.

#### Example

```typescript
const userInput: unknown = parseInput();

if (isBoolean(userInput)) {
    // userInput is now typed as boolean
    console.log('Boolean value:', userInput ? 'true' : 'false');
}
```

---

### isNonNullish()

> **isNonNullish**\<`T`\>(`u`): `u is NonNullable<T>`

Defined in: [src/guard/is-type.mts:450](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L450)

Type guard that checks if a value is not `null` or `undefined` (non-nullish).

This function uses the loose inequality operator (`!=`) to check that a value is neither
`null` nor `undefined` in a single comparison. This is equivalent to TypeScript's
`NonNullable<T>` utility type.

**Type Narrowing Behavior:**

- Excludes both `null` and `undefined` from the input type when `true`
- Equivalent to applying TypeScript's `NonNullable<T>` utility type
- Commonly used to filter out nullish values from arrays

#### Type Parameters

##### T

`T`

The type of the input value

#### Parameters

##### u

`T`

The value to check

#### Returns

`u is NonNullable<T>`

`true` if `u` is not `null` and not `undefined`, `false` otherwise.
When `true`, TypeScript narrows the type to `NonNullable<T>`.

#### Examples

```typescript
const items: (string | null | undefined)[] = [
    'hello',
    null,
    'world',
    undefined,
    'test',
];

const definedItems = items.filter(isNonNullish);
// definedItems is now string[] - both null and undefined values are filtered out

definedItems.forEach((item) => {
    // item is guaranteed to be string, never null or undefined
    console.log(item.toUpperCase());
});
```

Progressive validation with optional chaining alternative:

```typescript
interface User {
    profile?: {
        name?: string;
        email?: string;
    };
}

const user: User = getUser();

// Instead of optional chaining: user.profile?.name
if (isNonNullish(user.profile) && isNonNullish(user.profile.name)) {
    // user.profile.name is now guaranteed to be string
    console.log('User name:', user.profile.name.toUpperCase());
}
```

---

### isNotBigint()

> **isNotBigint**\<`T`\>(`u`): `u is RelaxedExclude<T, bigint>`

Defined in: [src/guard/is-type.mts:205](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L205)

Type guard that checks if a value is not a bigint.

**Type Narrowing Behavior:**

- Excludes `bigint` from the input type when `true`
- Preserves all other types in the union

#### Type Parameters

##### T

`T`

The type of the input value

#### Parameters

##### u

`T`

The value to check

#### Returns

`u is RelaxedExclude<T, bigint>`

`true` if `u` is not a bigint, `false` otherwise.
When `true`, TypeScript excludes `bigint` from the type.

#### Example

```typescript
type NumericValue = number | bigint;
const value: NumericValue = getValue();

if (isNotBigint(value)) {
    // value is now number
    console.log('Regular number:', value.toFixed(2));
}
```

---

### isNotBoolean()

> **isNotBoolean**\<`T`\>(`u`): `u is RelaxedExclude<T, boolean>`

Defined in: [src/guard/is-type.mts:102](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L102)

Type guard that checks if a value is not a boolean.

**Type Narrowing Behavior:**

- Excludes `boolean` from the input type when `true`
- Preserves all other types in the union

#### Type Parameters

##### T

`T`

The type of the input value

#### Parameters

##### u

`T`

The value to check

#### Returns

`u is RelaxedExclude<T, boolean>`

`true` if `u` is not a boolean, `false` otherwise.
When `true`, TypeScript excludes `boolean` from the type.

#### Example

```typescript
type MixedValue = string | number | boolean;
const value: MixedValue = getValue();

if (isNotBoolean(value)) {
    // value is now string | number
    console.log('Non-boolean value:', value);
}
```

---

### isNotNull()

> **isNotNull**\<`T`\>(`u`): `u is T`

Defined in: [src/guard/is-type.mts:364](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L364)

Type guard that checks if a value is not `null`.

**Type Narrowing Behavior:**

- Excludes `null` from the input type when `true`
- Preserves all other types including `undefined`
- Commonly used to filter out null values

#### Type Parameters

##### T

`T`

The type of the input value (which could be `null`)

#### Parameters

##### u

The value to check

`null` | `T`

#### Returns

`u is T`

`true` if `u` is not `null`, `false` otherwise.
When `true`, TypeScript excludes `null` from the type.

#### Example

```typescript
const items: (string | null)[] = ['a', null, 'b', null, 'c'];

const nonNullItems = items.filter(isNotNull);
// nonNullItems is now string[] - null values are filtered out

nonNullItems.forEach((item) => {
    // item is guaranteed to be string, not null
    console.log(item.toUpperCase());
});
```

---

### isNotNumber()

> **isNotNumber**\<`T`\>(`u`): `u is RelaxedExclude<T, number>`

Defined in: [src/guard/is-type.mts:155](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L155)

Type guard that checks if a value is not a number.

**Type Narrowing Behavior:**

- Excludes `number` from the input type when `true`
- Preserves all other types in the union

#### Type Parameters

##### T

`T`

The type of the input value

#### Parameters

##### u

`T`

The value to check

#### Returns

`u is RelaxedExclude<T, number>`

`true` if `u` is not a number, `false` otherwise.
When `true`, TypeScript excludes `number` from the type.

#### Example

```typescript
type Value = string | number | boolean;
const values: Value[] = ['hello', 42, true, 3.14, false];

const nonNumbers = values.filter(isNotNumber);
// nonNumbers is now (string | boolean)[] - numbers are filtered out
```

---

### isNotString()

> **isNotString**\<`T`\>(`u`): `u is RelaxedExclude<T, string>`

Defined in: [src/guard/is-type.mts:259](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L259)

Type guard that checks if a value is not a string.

**Type Narrowing Behavior:**

- Excludes `string` from the input type when `true`
- Preserves all other types in the union

#### Type Parameters

##### T

`T`

The type of the input value

#### Parameters

##### u

`T`

The value to check

#### Returns

`u is RelaxedExclude<T, string>`

`true` if `u` is not a string, `false` otherwise.
When `true`, TypeScript excludes `string` from the type.

#### Example

```typescript
type Value = string | number | boolean;
const mixedValues: Value[] = ['hello', 42, true, 'world', 3.14];

const nonStrings = mixedValues.filter(isNotString);
// nonStrings is now (number | boolean)[] - strings are filtered out
```

---

### isNotSymbol()

> **isNotSymbol**\<`T`\>(`u`): `u is RelaxedExclude<T, symbol>`

Defined in: [src/guard/is-type.mts:309](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L309)

Type guard that checks if a value is not a symbol.

**Type Narrowing Behavior:**

- Excludes `symbol` from the input type when `true`
- Preserves all other types in the union

#### Type Parameters

##### T

`T`

The type of the input value

#### Parameters

##### u

`T`

The value to check

#### Returns

`u is RelaxedExclude<T, symbol>`

`true` if `u` is not a symbol, `false` otherwise.
When `true`, TypeScript excludes `symbol` from the type.

#### Example

```typescript
type PropertyKey = string | number | symbol;
const key: PropertyKey = getPropertyKey();

if (isNotSymbol(key)) {
    // key is now string | number
    console.log('Non-symbol key:', key);
}
```

---

### isNotUndefined()

> **isNotUndefined**\<`T`\>(`u`): `u is RelaxedExclude<T, undefined>`

Defined in: [src/guard/is-type.mts:53](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L53)

Type guard that checks if a value is not `undefined`.

**Type Narrowing Behavior:**

- Excludes `undefined` from the input type when `true`
- Preserves all other types in the union
- Commonly used to filter out undefined values

#### Type Parameters

##### T

`T`

The type of the input value

#### Parameters

##### u

`T`

The value to check

#### Returns

`u is RelaxedExclude<T, undefined>`

`true` if `u` is not `undefined`, `false` otherwise.
When `true`, TypeScript excludes `undefined` from the type.

#### Example

```typescript
const items: (string | undefined)[] = ['a', undefined, 'b', undefined, 'c'];

const definedItems = items.filter(isNotUndefined);
// definedItems is now string[] - undefined values are filtered out

definedItems.forEach((item) => {
    // item is guaranteed to be string, not undefined
    console.log(item.toUpperCase());
});
```

---

### isNull()

> **isNull**(`u`): `u is null`

Defined in: [src/guard/is-type.mts:336](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L336)

Type guard that checks if a value is `null`.

**Type Narrowing Behavior:**

- Narrows the input type to `null` when `true`
- Useful for explicit null checks

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is null`

`true` if `u` is `null`, `false` otherwise.
When `true`, TypeScript narrows the type to `null`.

#### Example

```typescript
const value: string | null = getValue();

if (isNull(value)) {
    // value is now typed as null
    console.log('Value is null');
} else {
    // value is now typed as string
    console.log('Value length:', value.length);
}
```

---

### isNullish()

> **isNullish**(`u`): u is undefined \| null

Defined in: [src/guard/is-type.mts:393](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L393)

Type guard that checks if a value is `null` or `undefined` (nullish).

This function uses the loose equality operator (`==`) to check for both `null` and `undefined`
in a single comparison, which is the standard JavaScript idiom for nullish checks.

**Type Narrowing Behavior:**

- Narrows the input type to `null | undefined` when `true`
- Useful for checking if a value is "nullish" (either null or undefined)

#### Parameters

##### u

`unknown`

The value to check

#### Returns

u is undefined \| null

`true` if `u` is `null` or `undefined`, `false` otherwise.
When `true`, TypeScript narrows the type to `null | undefined`.

#### Example

```typescript
const value: string | null | undefined = getValue();

if (isNullish(value)) {
    // value is now typed as null | undefined
    console.log('Value is nullish');
} else {
    // value is now typed as string
    console.log('Value length:', value.length);
}
```

---

### isNumber()

> **isNumber**(`u`): `u is number`

Defined in: [src/guard/is-type.mts:132](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L132)

Type guard that checks if a value is a number.

**Type Narrowing Behavior:**

- Narrows `unknown` to `number` when `true`
- Includes `NaN`, `Infinity`, and `-Infinity` as valid numbers
- Preserves literal number types when possible

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is number`

`true` if `u` is a number, `false` otherwise.
When `true`, TypeScript narrows the type to `number`.

#### Example

```typescript
const userInput: unknown = parseInput();

if (isNumber(userInput)) {
    // userInput is now typed as number
    console.log('Number value:', userInput.toFixed(2));

    // Note: this includes NaN and Infinity
    if (Number.isFinite(userInput)) {
        console.log('Finite number:', userInput);
    }
}
```

---

### isString()

> **isString**(`u`): `u is string`

Defined in: [src/guard/is-type.mts:236](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L236)

Type guard that checks if a value is a string.

**Type Narrowing Behavior:**

- Narrows `unknown` to `string` when `true`
- Preserves literal string types when possible
- Includes empty strings

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is string`

`true` if `u` is a string, `false` otherwise.
When `true`, TypeScript narrows the type to `string`.

#### Example

```typescript
const userInput: unknown = parseInput();

if (isString(userInput)) {
    // userInput is now typed as string
    console.log('String length:', userInput.length);
    console.log('Uppercase:', userInput.toUpperCase());

    // You can further check for non-empty strings
    if (userInput.length > 0) {
        console.log('Non-empty string:', userInput);
    }
}
```

---

### isSymbol()

> **isSymbol**(`u`): `u is symbol`

Defined in: [src/guard/is-type.mts:284](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L284)

Type guard that checks if a value is a symbol.

**Type Narrowing Behavior:**

- Narrows `unknown` to `symbol` when `true`
- Identifies values created with `Symbol()` constructor

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is symbol`

`true` if `u` is a symbol, `false` otherwise.
When `true`, TypeScript narrows the type to `symbol`.

#### Example

```typescript
const userInput: unknown = parseInput();

if (isSymbol(userInput)) {
    // userInput is now typed as symbol
    console.log('Symbol description:', userInput.description);
    console.log('Symbol string:', userInput.toString());
}
```

---

### isUndefined()

> **isUndefined**(`u`): `u is undefined`

Defined in: [src/guard/is-type.mts:25](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/guard/is-type.mts#L25)

Type guard that checks if a value is `undefined`.

**Type Narrowing Behavior:**

- Narrows the input type to `undefined` when `true`
- Useful for explicit undefined checks

#### Parameters

##### u

`unknown`

The value to check

#### Returns

`u is undefined`

`true` if `u` is `undefined`, `false` otherwise.
When `true`, TypeScript narrows the type to `undefined`.

#### Example

```typescript
const value: string | undefined = getValue();

if (isUndefined(value)) {
    // value is now typed as undefined
    console.log('Value is undefined');
} else {
    // value is now typed as string
    console.log('Value length:', value.length);
}
```
