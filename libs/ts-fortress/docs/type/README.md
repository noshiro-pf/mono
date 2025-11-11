[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / type

# type

## Namespaces

- [TsFortressInternal](namespaces/TsFortressInternal.md)

## Type Aliases

### ExcessPropertyBehavior

> **ExcessPropertyBehavior** = `"allow"` \| `"strip"` \| `"error"`

Defined in: [src/type.mts:37](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L37)

***

### ExcessPropertyFillBehavior

> **ExcessPropertyFillBehavior** = `Extract`\<[`ExcessPropertyBehavior`](#excesspropertybehavior), `"allow"` \| `"strip"`\>

Defined in: [src/type.mts:39](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L39)

***

### ~~OptionalType~~

> **OptionalType**\<`A`\> = `MergeIntersection`\<[`Type`](#type)\<`A`\> & `Readonly`\<\{ `optional`: `true`; \}\>\>

Defined in: [src/type.mts:30](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L30)

#### Type Parameters

##### A

`A`

#### Deprecated

***

### RecordType

> **RecordType**\<`R`, `ExcessPropertyValidation`\> = [`Type`](#type)\<`ExcessPropertyValidation` *extends* `"allow"` ? [`RecordTypeValue`](namespaces/TsFortressInternal.md#recordtypevalue)\<`R`\> \| `UnknownRecord` : [`RecordTypeValue`](namespaces/TsFortressInternal.md#recordtypevalue)\<`R`\>\> & `Readonly`\<\{ `excessPropertyFill`: [`ExcessPropertyFillBehavior`](#excesspropertyfillbehavior); `excessPropertyValidation`: `ExcessPropertyValidation`; `shape`: `R`; \}\>

Defined in: [src/type.mts:44](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L44)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, [`Type`](#type)\<`unknown`\>\>

##### ExcessPropertyValidation

`ExcessPropertyValidation` *extends* [`ExcessPropertyBehavior`](#excesspropertybehavior) = `"strip"`

***

### Type

> **Type**\<`A`\> = `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is A`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is A`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`A`, readonly [`ValidationError`](../utils/validation-error.md#validationerror)[]\>; \}\>

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

***

### TypeOf

> **TypeOf**\<`A`\> = `A`\[`"defaultValue"`\]

Defined in: [src/type.mts:27](https://github.com/noshiro-pf/ts-fortress/blob/main/src/type.mts#L27)

#### Type Parameters

##### A

`A` *extends* [`Type`](#type)\<`unknown`\>
