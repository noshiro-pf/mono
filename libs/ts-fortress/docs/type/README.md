[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / type

# type

## Namespaces

- [TsFortressInternal](namespaces/TsFortressInternal.md)

## Type Aliases

### ~~OptionalType\<A\>~~

> **OptionalType**\<`A`\> = `MergeIntersection`\<[`Type`](#type)\<`A`\> & `Readonly`\<\{ `optional`: `true`; \}\>\>

Defined in: [src/type.mts:30](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L30)

#### Type Parameters

##### A

`A`

#### Deprecated

---

### RecordType\<R\>

> **RecordType**\<`R`\> = [`Type`](#type)\<[`RecordTypeValue`](namespaces/TsFortressInternal.md#recordtypevalue)\<`R`\>\> & `Readonly`\<\{ `allowExcessProperties`: `boolean`; `shape`: `R`; \}\>

Defined in: [src/type.mts:34](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L34)

#### Type Parameters

##### R

`R` _extends_ `ReadonlyRecord`\<`string`, [`Type`](#type)\<`unknown`\>\>

---

### Type\<A\>

> **Type**\<`A`\> = `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is A`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is A`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`A`, readonly [`ValidationError`](../utils/validation-error.md#validationerror)[]\>; \}\>

Defined in: [src/type.mts:14](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L14)

- `typeName` : Name for this type
- `is` : Type guard function
- `assertIs` : Type assertion function
- `cast` : Cast function
- `fill` : Default value filling function
- `validate` : A base function to be used in `is` and `assertIs`. `validate`
  returns Result.Ok if the value is of Type A, otherwise returns Result.Err
  with structured validation error information.

#### Type Parameters

##### A

`A`

---

### TypeOf\<A\>

> **TypeOf**\<`A`\> = `A`\[`"defaultValue"`\]

Defined in: [src/type.mts:27](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L27)

#### Type Parameters

##### A

`A` _extends_ [`Type`](#type)\<`unknown`\>
