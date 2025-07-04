[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [functional/optional](../README.md) / Optional

# Optional

Namespace for the [Optional](../README.md#optional) type and related functions.
Provides utilities to handle values that might be absent, similar to Option types in other languages.

## Type Aliases

### Base

> **Base** = [`Optional`](../README.md#optional)\<`unknown`\>

Defined in: [src/functional/optional.mts:78](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L78)

Base type for any [Optional](../README.md#optional), used for generic constraints.
Represents an [Optional](../README.md#optional) with an unknown value type.

---

### NarrowToNone\<O\>

> **NarrowToNone**\<`O`\> = `O` _extends_ [`None`](#none) ? `O` : `never`

Defined in: [src/functional/optional.mts:99](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L99)

Narrows an [Optional.Base](#base) type to [Optional.None](#none) if it is a [Optional.None](#none).
If the [Optional](../README.md#optional) is [Optional.Some](#some)<S>, resolves to `never`.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to narrow.

---

### NarrowToSome\<O\>

> **NarrowToSome**\<`O`\> = `O` _extends_ [`None`](#none) ? `never` : `O`

Defined in: [src/functional/optional.mts:92](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L92)

Narrows an [Optional.Base](#base) type to [Optional.Some](#some)<S> if it is a [Optional.Some](#some).
If the [Optional](../README.md#optional) is [Optional.None](#none), resolves to `never`.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to narrow.

---

### None

> **None** = `None_`

Defined in: [src/functional/optional.mts:72](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L72)

Represents an [Optional](../README.md#optional) that does not contain a value (is empty).

---

### Some\<S\>

> **Some**\<`S`\> = `Some_`\<`S`\>

Defined in: [src/functional/optional.mts:67](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L67)

Represents an [Optional](../README.md#optional) that contains a value.

#### Type Parameters

##### S

`S`

The type of the contained value.

---

### Unwrap\<O\>

> **Unwrap**\<`O`\> = `O` _extends_ [`Some`](#some)\<infer S\> ? `S` : `never`

Defined in: [src/functional/optional.mts:85](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L85)

Extracts the value type `S` from an [Optional.Some](#some)<S>.
If the [Optional](../README.md#optional) is [Optional.None](#none), resolves to `never`.

#### Type Parameters

##### O

`O` _extends_ [`Base`](#base)

The [Optional.Base](#base) type to unwrap.

## Variables

### expectToBe

> `const` **expectToBe**: `ExpectToBeFnOverload`

Defined in: [src/functional/optional.mts:498](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L498)

Unwraps an `Optional`, returning the contained value or throwing an error with the provided message.

#### Template

The `Optional.Base` type to unwrap.

#### Param

The `Optional` to unwrap.

#### Param

The error message to throw if the `Optional` is `Optional.None`.

#### Returns

The contained value if `Optional.Some`.

#### Throws

Error with the provided message if the `Optional` is `Optional.None`.

#### Example

```typescript
const some = Optional.some(42);
const value = Optional.expectToBe(some, 'Value must exist');
console.log(value); // 42
```

---

### filter

> `const` **filter**: `FilterFnOverload`

Defined in: [src/functional/optional.mts:448](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L448)

Filters an `Optional` based on a predicate.
If the `Optional` is `Some` and the predicate returns true, returns the original `Optional`.
Otherwise returns `None`.

#### Template

The input `Optional.Base` type.

#### Param

The `Optional` to filter.

#### Param

The predicate function.

#### Returns

The filtered `Optional`.

#### Example

```typescript
const someEven = Optional.some(4);
const filtered = Optional.filter(someEven, (x) => x % 2 === 0);
console.log(Optional.unwrap(filtered)); // 4
```

---

### flatMap

> `const` **flatMap**: `FlatMapFnOverload`

Defined in: [src/functional/optional.mts:402](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L402)

Applies a function that returns an `Optional` to the value in an `Optional.Some`.
If the input is `Optional.None`, returns `Optional.None`.
This is the monadic bind operation for `Optional`.

#### Template

The input `Optional.Base` type.

#### Template

The value type of the `Optional` returned by the function.

#### Param

The `Optional` to flat map.

#### Param

The function to apply that returns an `Optional`.

#### Returns

The result of applying the function, or `Optional.None`.

#### Example

```typescript
const parseNumber = (s: string): Optional<number> => {
    const n = Number(s);
    return isNaN(n) ? Optional.none : Optional.some(n);
};

const result = Optional.flatMap(Optional.some('42'), parseNumber);
console.log(Optional.unwrap(result)); // 42
```

---

### map

> `const` **map**: `MapFnOverload`

Defined in: [src/functional/optional.mts:352](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L352)

Maps an [Optional](../README.md#optional)<S> to [Optional](../README.md#optional)<S2> by applying a function to a contained value.
If the [Optional](../README.md#optional) is [Optional.None](#none), it returns [Optional.none](#none-1).
Otherwise, it applies the `mapFn` to the value in `Optional.Some` and returns a new `Optional.Some` with the result.

#### Template

The input `Optional.Base` type.

#### Template

The type of the value returned by the mapping function.

#### Param

The `Optional` to map.

#### Param

The function to apply to the value if it exists.

#### Returns

A new `Optional<S2>` resulting from the mapping, or `Optional.None` if the input was `Optional.None`.

#### Example

```typescript
const someNumber = Optional.some(5);
const mapped = Optional.map(someNumber, (x) => x * 2);
console.log(Optional.unwrap(mapped)); // 10

const noneValue = Optional.none;
const mappedNone = Optional.map(noneValue, (x) => x * 2);
console.log(Optional.isNone(mappedNone)); // true
```

---

### none

> `const` **none**: [`None`](#none)

Defined in: [src/functional/optional.mts:127](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L127)

The singleton instance representing [Optional.None](#none) (an empty Optional).

#### Example

```typescript
const emptyValue = Optional.none;
console.log(Optional.isNone(emptyValue)); // true
console.log(Optional.unwrapOr(emptyValue, 'default')); // "default"
```

---

### orElse

> `const` **orElse**: `OrElseFnOverload`

Defined in: [src/functional/optional.mts:296](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L296)

Returns the `Optional` if it is `Some`, otherwise returns the alternative.

Provides a way to chain Optional operations with fallback values. This is
particularly useful for implementing default behavior or cascading lookups.
Supports both direct usage and curried form for functional composition.

#### Template

The input `Optional.Base` type.

#### Param

The `Optional` to check.

#### Param

The alternative `Optional` to return if the first is `None`.

#### Returns

The first `Optional` if `Some`, otherwise the alternative.

#### Example

```typescript
const primary = Optional.none;
const fallback = Optional.some('default');
const result = Optional.orElse(primary, fallback);
console.log(Optional.unwrap(result)); // "default"
```

---

### unwrap

> `const` **unwrap**: `UnwrapFnOverload`

Defined in: [src/functional/optional.mts:205](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L205)

Unwraps an `Optional`, returning the contained value or `undefined` if empty.

This function provides a safe way to extract values from Optionals without
throwing exceptions. It has overloaded behavior based on the type:

- For `Optional.Some<T>`: Always returns `T` (guaranteed by type system)
- For general `Optional<T>`: Returns `T | undefined`

#### Template

The `Optional.Base` type to unwrap.

#### Param

The `Optional` to unwrap.

#### Returns

The contained value if `Optional.Some`, otherwise `undefined`.

#### Example

```typescript
const some = Optional.some(42);
const value = Optional.unwrap(some); // 42

const none = Optional.none;
const result = Optional.unwrap(none); // undefined
```

---

### unwrapOr

> `const` **unwrapOr**: `UnwrapOrFnOverload`

Defined in: [src/functional/optional.mts:247](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L247)

Unwraps an `Optional`, returning the contained value or a default value if it's `Optional.None`.

Supports both direct usage and curried form for functional composition.
This is often preferred over `unwrap()` when you have a sensible fallback value.

#### Template

The `Optional.Base` type to unwrap.

#### Template

The type of the default value.

#### Param

The `Optional` to unwrap.

#### Param

The value to return if `optional` is `Optional.None`.

#### Returns

The contained value if `Optional.Some`, otherwise `defaultValue`.

#### Example

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

## Functions

### fromNullable()

> **fromNullable**\<`T`\>(`value`): [`Optional`](../README.md#optional)\<`NonNullable`\<`T`\>\>

Defined in: [src/functional/optional.mts:576](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L576)

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

Defined in: [src/functional/optional.mts:147](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L147)

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

Defined in: [src/functional/optional.mts:54](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L54)

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

Defined in: [src/functional/optional.mts:136](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L136)

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

### some()

> **some**\<`S`\>(`value`): [`Some`](#some)\<`S`\>

Defined in: [src/functional/optional.mts:113](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L113)

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

Defined in: [src/functional/optional.mts:602](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L602)

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

### unwrapThrow()

> **unwrapThrow**\<`O`\>(`optional`): [`Unwrap`](#unwrap)\<`O`\>

Defined in: [src/functional/optional.mts:176](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L176)

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

Defined in: [src/functional/optional.mts:547](https://github.com/noshiro-pf/ts-data-forge/blob/main/src/functional/optional.mts#L547)

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
