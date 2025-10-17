[**ts-type-forge**](../README.md)

***

[ts-type-forge](../README.md) / record/partial

# record/partial

## Type Aliases

### PartiallyPartial

> **PartiallyPartial**\<`T`, `K`\> = [`MergeIntersection`](../others/utils.md#mergeintersection)\<`Omit`\<`T`, `K`\> & `Partial`\<`Pick`\<`T`, `K`\>\>\>

Defined in: [src/record/partial.d.mts:12](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/partial.d.mts#L12)

Creates a type where specified keys `K` of `T` are made optional.
The resulting type is a merged intersection for better readability.

#### Type Parameters

##### T

`T`

The original type.

##### K

`K` *extends* keyof `T`

The keys to make optional.

#### Returns

A new type with keys `K` made optional.

#### Example

```ts
type Data = { a: number; b: string; c: boolean };
type PartiallyPartialData = PartiallyPartial<Data, 'a' | 'b'>;
// Result: { a?: number; b?: string; c: boolean }
```

***

### PartiallyOptional

> **PartiallyOptional**\<`T`, `K`\> = [`PartiallyPartial`](#partiallypartial)\<`T`, `K`\>

Defined in: [src/record/partial.d.mts:26](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/partial.d.mts#L26)

Alias for `PartiallyPartial`. Creates a type where specified keys `K` of `T` are made optional.

#### Type Parameters

##### T

`T`

The original type.

##### K

`K` *extends* keyof `T`

The keys to make optional.

#### Returns

A new type with keys `K` made optional.

#### Example

```ts
type Data = { a: number; b: string; c: boolean };
type PartiallyOptionalData = PartiallyOptional<Data, 'a' | 'b'>;
// Result: { a?: number; b?: string; c: boolean }
```

***

### PartiallyNullable

> **PartiallyNullable**\<`T`, `K`\> = [`MergeIntersection`](../others/utils.md#mergeintersection)\<`Omit`\<`T`, `K`\> & \{ \[P in K\]: T\[P\] \| undefined \}\>

Defined in: [src/record/partial.d.mts:39](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/partial.d.mts#L39)

Creates a type where specified keys `K` of `T` are made nullable (i.e., `| undefined` is added to their type).
The resulting type is a merged intersection for better readability.

#### Type Parameters

##### T

`T`

The original type.

##### K

`K` *extends* keyof `T`

The keys to make nullable.

#### Returns

A new type with keys `K` made nullable.

#### Example

```ts
type Data = { a: number; b: string; c: boolean };
type PartiallyNullableData = PartiallyNullable<Data, 'a' | 'b'>;
// Result: { a: number | undefined; b: string | undefined; c: boolean }
```

***

### PartiallyRequired

> **PartiallyRequired**\<`T`, `K`\> = [`MergeIntersection`](../others/utils.md#mergeintersection)\<`Omit`\<`T`, `K`\> & `Required`\<`Pick`\<`T`, `K`\>\>\>

Defined in: [src/record/partial.d.mts:54](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/partial.d.mts#L54)

Creates a type where specified keys `K` of `T` are made required (removing the optional `?` modifier).
The resulting type is a merged intersection for better readability.

#### Type Parameters

##### T

`T`

The original type (can have optional properties).

##### K

`K` *extends* keyof `T`

The keys to make required.

#### Returns

A new type with keys `K` made required.

#### Example

```ts
type Data = { a?: number; b?: string; c?: boolean };
type PartiallyRequiredData = PartiallyRequired<Data, 'a' | 'b'>;
// Result: { a: number; b: string; c?: boolean }
```

***

### OptionalKeys

> **OptionalKeys**\<`R`\> = `PickUndefined`\<`MapToNever`\<`R`\>\>

Defined in: [src/record/partial.d.mts:98](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/partial.d.mts#L98)

Extracts keys from a record `R` that are explicitly marked as optional using the `?` modifier.
It works by creating a mapped type where all values are `never` and then using `PickUndefined`
to find keys where `undefined` is assignable (which is true only for optional properties in this context).

#### Type Parameters

##### R

`R` *extends* [`UnknownRecord`](../constants/record.md#unknownrecord)

The record type.

#### Returns

A union of keys that are optional in `R`.

#### Example

```ts
type K = OptionalKeys<{
  a?: 0; // optional
  b?: 0 | undefined; // optional
  c?: undefined; // optional
  d: 0; // required
  e: undefined; // required, value is undefined
  f: 0 | undefined; // required, value includes undefined
}>; // 'a' | 'b' | 'c'
```

***

### RequiredKeys

> **RequiredKeys**\<`R`\> = `Exclude`\<keyof `R`, [`OptionalKeys`](#optionalkeys)\<`R`\>\>

Defined in: [src/record/partial.d.mts:116](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/record/partial.d.mts#L116)

Extracts keys from a record `R` that are *not* explicitly marked as optional using the `?` modifier.
It calculates this by taking all keys of `R` and excluding the optional keys identified by `OptionalKeys<R>`.

#### Type Parameters

##### R

`R` *extends* [`UnknownRecord`](../constants/record.md#unknownrecord)

The record type.

#### Returns

A union of keys that are required (not optional) in `R`.

#### Example

```ts
type K = RequiredKeys<{
  a?: 0; // optional
  b?: 0 | undefined; // optional
  c?: undefined; // optional
  d: 0; // required
  e: undefined; // required, value is undefined
  f: 0 | undefined; // required, value includes undefined
}>; // 'd' | 'e' | 'f'
```
