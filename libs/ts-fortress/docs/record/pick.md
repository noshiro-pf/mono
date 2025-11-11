[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/pick

# record/pick

## Type Aliases

### PickedType

> **PickedType**\<`R`, `KeysToPick`, `ExcessValidation`\> = [`RecordType`](../type/README.md#recordtype)\<`Pick`\<`R`, `ArrayElement`\<`KeysToPick`\>\>, `ExcessValidation`\>

Defined in: [src/record/pick.mts:34](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/pick.mts#L34)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToPick

`KeysToPick` *extends* readonly keyof `R`[]

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

## Functions

### pick()

> **pick**\<`R`, `KeysToPick`, `ExcessValidation`\>(`recordType`, `keysToPick`, `options?`): [`PickedType`](#pickedtype)\<`R`, `KeysToPick`, `ExcessValidation`\>

Defined in: [src/record/pick.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/pick.mts#L11)

Creates a record type with keys picked.

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToPick

`KeysToPick` *extends* readonly keyof `R` & `string`[]

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`, `ExcessValidation`\>

##### keysToPick

`KeysToPick`

##### options?

`Partial`\<`Readonly`\<\{ `excessPropertyFill`: `"allow"` \| `"strip"`; `excessPropertyValidation`: `ExcessValidation`; `typeName`: `string`; \}\>\>

#### Returns

[`PickedType`](#pickedtype)\<`R`, `KeysToPick`, `ExcessValidation`\>
