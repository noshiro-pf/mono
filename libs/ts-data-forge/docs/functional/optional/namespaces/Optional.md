[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [functional/optional](../README.md) / Optional

# Optional

Namespace for the [Optional](../README.md#optional) type and related functions.
Provides utilities to handle values that might be absent, similar to Option types in other languages.

## Type Aliases

### Base

> **Base** = [`Optional`](../README.md#optional)\<`unknown`\>

Defined in: [src/functional/optional.mts:77](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L77)

Base type for any [Optional](../README.md#optional), used for generic constraints.
Represents an [Optional](../README.md#optional) with an unknown value type.

---

### NarrowToNone\<O\>

> **NarrowToNone**\<`O`\> = `O` _extends_ [`None`](#none) ? `O` : `never`

Defined in: [src/functional/optional.mts:98](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L98)

Narrows an [Optional.Base](#base) type to [Optional.None](#none) if it is a [Optional.None](#none).
If the [Optional](../README.md#optional) is [Optional.Some](#some)<S>, resolves to `never`.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to narrow.

---

### NarrowToSome\<O\>

> **NarrowToSome**\<`O`\> = `O` _extends_ [`None`](#none) ? `never` : `O`

Defined in: [src/functional/optional.mts:91](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L91)

Narrows an [Optional.Base](#base) type to [Optional.Some](#some)<S> if it is a [Optional.Some](#some).
If the [Optional](../README.md#optional) is [Optional.None](#none), resolves to `never`.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to narrow.

---

### None

> **None** = `None_`

Defined in: [src/functional/optional.mts:71](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L71)

Represents an [Optional](../README.md#optional) that does not contain a value (is empty).

---

### Some\<S\>

> **Some**\<`S`\> = `Some_`\<`S`\>

Defined in: [src/functional/optional.mts:66](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L66)

Represents an [Optional](../README.md#optional) that contains a value.

#### Type Parameters

##### S

`S`

The type of the contained value.

---

### Unwrap\<O\>

> **Unwrap**\<`O`\> = `O` _extends_ [`Some`](#some)\<infer S\> ? `S` : `never`

Defined in: [src/functional/optional.mts:84](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L84)

Extracts the value type `S` from an [Optional.Some](#some)<S>.
If the [Optional](../README.md#optional) is [Optional.None](#none), resolves to `never`.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to unwrap.

## Variables

### none

> `const` **none**: [`None`](#none)

Defined in: [src/functional/optional.mts:126](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L126)

The singleton instance representing [Optional.None](#none) (an empty Optional).

#### Example

```typescript
const emptyValue = Optional.none;
console.log(Optional.isNone(emptyValue)); // true
console.log(Optional.unwrapOr(emptyValue, 'default')); // "default"
```

## Functions

### expectToBe()

#### Call Signature

> **expectToBe**\<`O`\>(`optional`, `message`): [`Unwrap`](#unwrap)\<`O`\>

Defined in: [src/functional/optional.mts:483](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L483)

Unwraps an `Optional`, returning the contained value or throwing an error with the provided message.

##### Type Parameters

###### O

`O` _extends_ [`Base`](#base)

The `Optional.Base` type to unwrap.

##### Parameters

###### optional

`O`

The `Optional` to unwrap.

###### message

`string`

The error message to throw if the `Optional` is `Optional.None`.

##### Returns

[`Unwrap`](#unwrap)\<`O`\>

The contained value if `Optional.Some`.

##### Throws

Error with the provided message if the `Optional` is `Optional.None`.

##### Example

```typescript
const some = Optional.some(42);
const value = Optional.expectToBe(some, 'Value must exist');
console.log(value); // 42
```

#### Call Signature

> **expectToBe**\<`S`\>(`message`): (`optional`) => `S`

Defined in: [src/functional/optional.mts:489](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L489)

Unwraps an `Optional`, returning the contained value or throwing an error with the provided message.

##### Type Parameters

###### S

`S`

##### Parameters

###### message

`string`

The error message to throw if the `Optional` is `Optional.None`.

##### Returns

The contained value if `Optional.Some`.

> (`optional`): `S`

###### Parameters

###### optional

[`Optional`](../README.md#optional)\<`S`\>

###### Returns

`S`

##### Throws

Error with the provided message if the `Optional` is `Optional.None`.

##### Example

```typescript
const some = Optional.some(42);
const value = Optional.expectToBe(some, 'Value must exist');
console.log(value); // 42
```

---

### filter()

#### Call Signature

> **filter**\<`O`\>(`optional`, `predicate`): [`Optional`](../README.md#optional)\<[`Unwrap`](#unwrap)\<`O`\>\>

Defined in: [src/functional/optional.mts:435](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L435)

Filters an `Optional` based on a predicate.
If the `Optional` is `Some` and the predicate returns true, returns the original `Optional`.
Otherwise returns `None`.

##### Type Parameters

###### O

`O` _extends_ [`Base`](#base)

The input `Optional.Base` type.

##### Parameters

###### optional

`O`

The `Optional` to filter.

###### predicate

(`value`) => `boolean`

The predicate function.

##### Returns

[`Optional`](../README.md#optional)\<[`Unwrap`](#unwrap)\<`O`\>\>

The filtered `Optional`.

##### Example

```typescript
const someEven = Optional.some(4);
const filtered = Optional.filter(someEven, (x) => x % 2 === 0);
console.log(Optional.unwrap(filtered)); // 4
```

#### Call Signature

> **filter**\<`S`\>(`predicate`): (`optional`) => [`Optional`](../README.md#optional)\<`S`\>

Defined in: [src/functional/optional.mts:441](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L441)

Filters an `Optional` based on a predicate.
If the `Optional` is `Some` and the predicate returns true, returns the original `Optional`.
Otherwise returns `None`.

##### Type Parameters

###### S

`S`

##### Parameters

###### predicate

(`value`) => `boolean`

The predicate function.

##### Returns

The filtered `Optional`.

> (`optional`): [`Optional`](../README.md#optional)\<`S`\>

###### Parameters

###### optional

[`Optional`](../README.md#optional)\<`S`\>

###### Returns

[`Optional`](../README.md#optional)\<`S`\>

##### Example

```typescript
const someEven = Optional.some(4);
const filtered = Optional.filter(someEven, (x) => x % 2 === 0);
console.log(Optional.unwrap(filtered)); // 4
```

---

### flatMap()

#### Call Signature

> **flatMap**\<`O`, `S2`\>(`optional`, `flatMapFn`): [`Optional`](../README.md#optional)\<`S2`\>

Defined in: [src/functional/optional.mts:392](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L392)

Applies a function that returns an `Optional` to the value in an `Optional.Some`.
If the input is `Optional.None`, returns `Optional.None`.
This is the monadic bind operation for `Optional`.

##### Type Parameters

###### O

`O` _extends_ [`Base`](#base)

The input `Optional.Base` type.

###### S2

`S2`

The value type of the `Optional` returned by the function.

##### Parameters

###### optional

`O`

The `Optional` to flat map.

###### flatMapFn

(`value`) => [`Optional`](../README.md#optional)\<`S2`\>

The function to apply that returns an `Optional`.

##### Returns

[`Optional`](../README.md#optional)\<`S2`\>

The result of applying the function, or `Optional.None`.

##### Example

```typescript
const parseNumber = (s: string): Optional<number> => {
    const n = Number(s);
    return isNaN(n) ? Optional.none : Optional.some(n);
};

const result = Optional.flatMap(Optional.some('42'), parseNumber);
console.log(Optional.unwrap(result)); // 42
```

#### Call Signature

> **flatMap**\<`S`, `S2`\>(`flatMapFn`): (`optional`) => [`Optional`](../README.md#optional)\<`S2`\>

Defined in: [src/functional/optional.mts:398](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L398)

Applies a function that returns an `Optional` to the value in an `Optional.Some`.
If the input is `Optional.None`, returns `Optional.None`.
This is the monadic bind operation for `Optional`.

##### Type Parameters

###### S

`S`

###### S2

`S2`

The value type of the `Optional` returned by the function.

##### Parameters

###### flatMapFn

(`value`) => [`Optional`](../README.md#optional)\<`S2`\>

The function to apply that returns an `Optional`.

##### Returns

The result of applying the function, or `Optional.None`.

> (`optional`): [`Optional`](../README.md#optional)\<`S2`\>

###### Parameters

###### optional

[`Optional`](../README.md#optional)\<`S`\>

###### Returns

[`Optional`](../README.md#optional)\<`S2`\>

##### Example

```typescript
const parseNumber = (s: string): Optional<number> => {
    const n = Number(s);
    return isNaN(n) ? Optional.none : Optional.some(n);
};

const result = Optional.flatMap(Optional.some('42'), parseNumber);
console.log(Optional.unwrap(result)); // 42
```

---

### fromNullable()

> **fromNullable**\<`T`\>(`value`): [`Optional`](../README.md#optional)\<`NonNullable`\<`T`\>\>

Defined in: [src/functional/optional.mts:562](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L562)

Converts a nullable value to an `Optional`.

This is the primary way to lift nullable values (null or undefined) into
the Optional type system. The function treats both `null` and `undefined`
as empty values, converting them to `Optional.None`.

#### Type Parameters

##### T

`T`

The type of the nullable value.

#### Parameters

##### value

The nullable value to convert.

`undefined` | `null` | `T`

#### Returns

[`Optional`](../README.md#optional)\<`NonNullable`\<`T`\>\>

`Optional.Some<NonNullable<T>>` if the value is not null or undefined, otherwise `Optional.None`.

#### Example

```typescript
const value: string | null = 'hello';
const optional = Optional.fromNullable(value);
console.log(Optional.unwrap(optional)); // "hello"

const nullValue: string | null = null;
const noneOptional = Optional.fromNullable(nullValue);
console.log(Optional.isNone(noneOptional)); // true
```

---

### isNone()

> **isNone**\<`O`\>(`optional`): `optional is NarrowToNone<O>`

Defined in: [src/functional/optional.mts:146](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L146)

Checks if an [Optional](../README.md#optional) is [Optional.None](#none).
Acts as a type guard.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to check.

#### Parameters

##### optional

`O`

The [Optional](../README.md#optional) to check.

#### Returns

`optional is NarrowToNone<O>`

`true` if the [Optional](../README.md#optional) is [Optional.None](#none), `false` otherwise.

---

### isOptional()

> **isOptional**(`maybeOptional`): `maybeOptional is Optional<unknown>`

Defined in: [src/functional/optional.mts:53](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L53)

Checks if the given value is an [Optional](../README.md#optional).

#### Parameters

##### maybeOptional

`unknown`

The value to check.

#### Returns

`maybeOptional is Optional<unknown>`

`true` if the value is an [Optional](../README.md#optional), otherwise `false`.

---

### isSome()

> **isSome**\<`O`\>(`optional`): `optional is NarrowToSome<O>`

Defined in: [src/functional/optional.mts:135](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L135)

Checks if an [Optional](../README.md#optional) is [Optional.Some](#some).
Acts as a type guard.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to check.

#### Parameters

##### optional

`O`

The [Optional](../README.md#optional) to check.

#### Returns

`optional is NarrowToSome<O>`

`true` if the [Optional](../README.md#optional) is [Optional.Some](#some), `false` otherwise.

---

### map()

#### Call Signature

> **map**\<`O`, `S2`\>(`optional`, `mapFn`): [`Optional`](../README.md#optional)\<`S2`\>

Defined in: [src/functional/optional.mts:343](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L343)

Maps an [Optional](../README.md#optional)<S> to [Optional](../README.md#optional)<S2> by applying a function to a contained value.
If the [Optional](../README.md#optional) is [Optional.None](#none), it returns [Optional.none](#none-1).
Otherwise, it applies the `mapFn` to the value in `Optional.Some` and returns a new `Optional.Some` with the result.

##### Type Parameters

###### O

`O` _extends_ [`Base`](#base)

The input `Optional.Base` type.

###### S2

`S2`

The type of the value returned by the mapping function.

##### Parameters

###### optional

`O`

The `Optional` to map.

###### mapFn

(`value`) => `S2`

The function to apply to the value if it exists.

##### Returns

[`Optional`](../README.md#optional)\<`S2`\>

A new `Optional<S2>` resulting from the mapping, or `Optional.None` if the input was `Optional.None`.

##### Example

```typescript
const someNumber = Optional.some(5);
const mapped = Optional.map(someNumber, (x) => x * 2);
console.log(Optional.unwrap(mapped)); // 10

const noneValue = Optional.none;
const mappedNone = Optional.map(noneValue, (x) => x * 2);
console.log(Optional.isNone(mappedNone)); // true
```

#### Call Signature

> **map**\<`S`, `S2`\>(`mapFn`): (`optional`) => [`Optional`](../README.md#optional)\<`S2`\>

Defined in: [src/functional/optional.mts:349](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L349)

Maps an [Optional](../README.md#optional)<S> to [Optional](../README.md#optional)<S2> by applying a function to a contained value.
If the [Optional](../README.md#optional) is [Optional.None](#none), it returns [Optional.none](#none-1).
Otherwise, it applies the `mapFn` to the value in `Optional.Some` and returns a new `Optional.Some` with the result.

##### Type Parameters

###### S

`S`

###### S2

`S2`

The type of the value returned by the mapping function.

##### Parameters

###### mapFn

(`value`) => `S2`

The function to apply to the value if it exists.

##### Returns

A new `Optional<S2>` resulting from the mapping, or `Optional.None` if the input was `Optional.None`.

> (`optional`): [`Optional`](../README.md#optional)\<`S2`\>

###### Parameters

###### optional

[`Optional`](../README.md#optional)\<`S`\>

###### Returns

[`Optional`](../README.md#optional)\<`S2`\>

##### Example

```typescript
const someNumber = Optional.some(5);
const mapped = Optional.map(someNumber, (x) => x * 2);
console.log(Optional.unwrap(mapped)); // 10

const noneValue = Optional.none;
const mappedNone = Optional.map(noneValue, (x) => x * 2);
console.log(Optional.isNone(mappedNone)); // true
```

---

### orElse()

#### Call Signature

> **orElse**\<`O`, `O2`\>(`optional`, `alternative`): `O` \| `O2`

Defined in: [src/functional/optional.mts:295](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L295)

Returns the `Optional` if it is `Some`, otherwise returns the alternative.

Provides a way to chain Optional operations with fallback values. This is
particularly useful for implementing default behavior or cascading lookups.
Supports both direct usage and curried form for functional composition.

##### Type Parameters

###### O

`O` _extends_ [`Base`](#base)

The input `Optional.Base` type.

###### O2

`O2` _extends_ [`Base`](#base)

##### Parameters

###### optional

`O`

The `Optional` to check.

###### alternative

`O2`

The alternative `Optional` to return if the first is `None`.

##### Returns

`O` \| `O2`

The first `Optional` if `Some`, otherwise the alternative.

##### Example

```typescript
const primary = Optional.none;
const fallback = Optional.some('default');
const result = Optional.orElse(primary, fallback);
console.log(Optional.unwrap(result)); // "default"
```

#### Call Signature

> **orElse**\<`S`, `S2`\>(`alternative`): (`optional`) => `Readonly`\<\{ \}\> \| `Readonly`\<\{ `value`: `S2`; \}\> \| `Readonly`\<\{ `value`: `S`; \}\>

Defined in: [src/functional/optional.mts:301](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L301)

Returns the `Optional` if it is `Some`, otherwise returns the alternative.

Provides a way to chain Optional operations with fallback values. This is
particularly useful for implementing default behavior or cascading lookups.
Supports both direct usage and curried form for functional composition.

##### Type Parameters

###### S

`S`

###### S2

`S2`

##### Parameters

###### alternative

[`Optional`](../README.md#optional)\<`S2`\>

The alternative `Optional` to return if the first is `None`.

##### Returns

The first `Optional` if `Some`, otherwise the alternative.

> (`optional`): `Readonly`\<\{ \}\> \| `Readonly`\<\{ `value`: `S2`; \}\> \| `Readonly`\<\{ `value`: `S`; \}\>

###### Parameters

###### optional

[`Optional`](../README.md#optional)\<`S`\>

###### Returns

`Readonly`\<\{ \}\> \| `Readonly`\<\{ `value`: `S2`; \}\> \| `Readonly`\<\{ `value`: `S`; \}\>

##### Example

```typescript
const primary = Optional.none;
const fallback = Optional.some('default');
const result = Optional.orElse(primary, fallback);
console.log(Optional.unwrap(result)); // "default"
```

---

### some()

> **some**\<`S`\>(`value`): [`Some`](#some)\<`S`\>

Defined in: [src/functional/optional.mts:112](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L112)

Creates an [Optional.Some](#some) containing the given value.

#### Type Parameters

##### S

`S`

The type of the value.

#### Parameters

##### value

`S`

The value to wrap in an [Optional.Some](#some).

#### Returns

[`Some`](#some)\<`S`\>

An [Optional.Some](#some)<S> containing the value.

#### Example

```typescript
const someValue = Optional.some(42);
console.log(Optional.isSome(someValue)); // true
console.log(Optional.unwrap(someValue)); // 42
```

---

### toNullable()

> **toNullable**\<`O`\>(`optional`): `undefined` \| [`Unwrap`](#unwrap)\<`O`\>

Defined in: [src/functional/optional.mts:588](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L588)

Converts an `Optional` to a nullable value.

This function extracts the value from an Optional, returning `undefined`
for empty Optionals. This is useful when interfacing with APIs or systems
that expect nullable values rather than Optional types.

Note: This returns `undefined` (not `null`) for consistency with JavaScript's
undefined semantics and TypeScript's optional properties.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The `Optional.Base` type to convert.

#### Parameters

##### optional

`O`

The `Optional` to convert.

#### Returns

`undefined` \| [`Unwrap`](#unwrap)\<`O`\>

The contained value if `Some`, otherwise `undefined`.

#### Example

```typescript
const some = Optional.some(42);
console.log(Optional.toNullable(some)); // 42

const none = Optional.none;
console.log(Optional.toNullable(none)); // undefined
```

---

### unwrap()

#### Call Signature

> **unwrap**\<`O`\>(`optional`): [`Unwrap`](#unwrap)\<`O`\>

Defined in: [src/functional/optional.mts:204](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L204)

Unwraps an `Optional`, returning the contained value or `undefined` if empty.

This function provides a safe way to extract values from Optionals without
throwing exceptions. It has overloaded behavior based on the type:

- For `Optional.Some<T>`: Always returns `T` (guaranteed by type system)
- For general `Optional<T>`: Returns `T | undefined`

##### Type Parameters

###### O

`O` _extends_ `Readonly`\<\{ `value`: `unknown`; \}\>

The `Optional.Base` type to unwrap.

##### Parameters

###### optional

`O`

The `Optional` to unwrap.

##### Returns

[`Unwrap`](#unwrap)\<`O`\>

The contained value if `Optional.Some`, otherwise `undefined`.

##### Example

```typescript
const some = Optional.some(42);
const value = Optional.unwrap(some); // 42

const none = Optional.none;
const result = Optional.unwrap(none); // undefined
```

#### Call Signature

> **unwrap**\<`O`\>(`optional`): `undefined` \| [`Unwrap`](#unwrap)\<`O`\>

Defined in: [src/functional/optional.mts:206](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L206)

Unwraps an `Optional`, returning the contained value or `undefined` if empty.

This function provides a safe way to extract values from Optionals without
throwing exceptions. It has overloaded behavior based on the type:

- For `Optional.Some<T>`: Always returns `T` (guaranteed by type system)
- For general `Optional<T>`: Returns `T | undefined`

##### Type Parameters

###### O

`O` _extends_ [`Base`](#base)

The `Optional.Base` type to unwrap.

##### Parameters

###### optional

`O`

The `Optional` to unwrap.

##### Returns

`undefined` \| [`Unwrap`](#unwrap)\<`O`\>

The contained value if `Optional.Some`, otherwise `undefined`.

##### Example

```typescript
const some = Optional.some(42);
const value = Optional.unwrap(some); // 42

const none = Optional.none;
const result = Optional.unwrap(none); // undefined
```

---

### unwrapOr()

#### Call Signature

> **unwrapOr**\<`O`, `D`\>(`optional`, `defaultValue`): `D` \| [`Unwrap`](#unwrap)\<`O`\>

Defined in: [src/functional/optional.mts:243](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L243)

Unwraps an `Optional`, returning the contained value or a default value if it's `Optional.None`.

Supports both direct usage and curried form for functional composition.
This is often preferred over `unwrap()` when you have a sensible fallback value.

##### Type Parameters

###### O

`O` _extends_ [`Base`](#base)

The `Optional.Base` type to unwrap.

###### D

`D`

The type of the default value.

##### Parameters

###### optional

`O`

The `Optional` to unwrap.

###### defaultValue

`D`

The value to return if `optional` is `Optional.None`.

##### Returns

`D` \| [`Unwrap`](#unwrap)\<`O`\>

The contained value if `Optional.Some`, otherwise `defaultValue`.

##### Example

```typescript
// Direct usage - most common pattern
const some = Optional.some(42);
const value1 = Optional.unwrapOr(some, 0);
console.log(value1); // 42

const none = Optional.none;
const value2 = Optional.unwrapOr(none, 0);
console.log(value2); // 0

// Curried usage
const unwrapWithDefault = Optional.unwrapOr('default');
const result = unwrapWithDefault(Optional.some('hello'));
console.log(result); // "hello"
```

#### Call Signature

> **unwrapOr**\<`S`, `D`\>(`defaultValue`): (`optional`) => `S` \| `D`

Defined in: [src/functional/optional.mts:249](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L249)

Unwraps an `Optional`, returning the contained value or a default value if it's `Optional.None`.

Supports both direct usage and curried form for functional composition.
This is often preferred over `unwrap()` when you have a sensible fallback value.

##### Type Parameters

###### S

`S`

###### D

`D`

The type of the default value.

##### Parameters

###### defaultValue

`D`

The value to return if `optional` is `Optional.None`.

##### Returns

The contained value if `Optional.Some`, otherwise `defaultValue`.

> (`optional`): `S` \| `D`

###### Parameters

###### optional

[`Optional`](../README.md#optional)\<`S`\>

###### Returns

`S` \| `D`

##### Example

```typescript
// Direct usage - most common pattern
const some = Optional.some(42);
const value1 = Optional.unwrapOr(some, 0);
console.log(value1); // 42

const none = Optional.none;
const value2 = Optional.unwrapOr(none, 0);
console.log(value2); // 0

// Curried usage
const unwrapWithDefault = Optional.unwrapOr('default');
const result = unwrapWithDefault(Optional.some('hello'));
console.log(result); // "hello"
```

---

### unwrapThrow()

> **unwrapThrow**\<`O`\>(`optional`): [`Unwrap`](#unwrap)\<`O`\>

Defined in: [src/functional/optional.mts:175](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L175)

Unwraps an `Optional`, returning the contained value.
Throws an error if the `Optional` is `Optional.None`.

This is a safer alternative to direct value access when you know the Optional
should contain a value. Use this method when an empty Optional represents
a programming error or unexpected condition.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The `Optional.Base` type to unwrap.

#### Parameters

##### optional

`O`

The `Optional` to unwrap.

#### Returns

[`Unwrap`](#unwrap)\<`O`\>

The contained value if `Optional.Some`.

#### Throws

Error with message "`unwrapThrow()` has failed because it is `None`" if the `Optional` is `Optional.None`.

#### Example

```typescript
const userInput = Optional.some(42);
console.log(Optional.unwrapThrow(userInput)); // 42

const empty = Optional.none;
try {
    Optional.unwrapThrow(empty); // throws Error
} catch (error) {
    console.log(error.message); // "`unwrapThrow()` has failed because it is `None`"
}
```

---

### zip()

> **zip**\<`A`, `B`\>(`optionalA`, `optionalB`): [`Optional`](../README.md#optional)\<readonly \[`A`, `B`\]\>

Defined in: [src/functional/optional.mts:533](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L533)

Combines two `Optional` values into a single `Optional` containing a tuple.
If either `Optional` is `None`, returns `None`.

#### Type Parameters

##### A

`A`

The value type of the first `Optional`.

##### B

`B`

The value type of the second `Optional`.

#### Parameters

##### optionalA

[`Optional`](../README.md#optional)\<`A`\>

The first `Optional`.

##### optionalB

[`Optional`](../README.md#optional)\<`B`\>

The second `Optional`.

#### Returns

[`Optional`](../README.md#optional)\<readonly \[`A`, `B`\]\>

An `Optional` containing a tuple of both values, or `None`.

#### Example

```typescript
const a = Optional.some(1);
const b = Optional.some('hello');
const zipped = Optional.zip(a, b);
console.log(Optional.unwrap(zipped)); // [1, "hello"]

const withNone = Optional.zip(a, Optional.none);
console.log(Optional.isNone(withNone)); // true
```
