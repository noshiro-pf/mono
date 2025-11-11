[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/partial

# record/partial

## Type Aliases

### PartialType

> **PartialType**\<`R`, `KeysToBeOptional`, `ExcessValidation`\> = [`RecordType`](../type/README.md#recordtype)\<`PartialTypeShape`\<`R`, `KeysToBeOptional`\>, `ExcessValidation`\>

Defined in: [src/record/partial.mts:77](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/partial.mts#L77)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToBeOptional

`KeysToBeOptional` *extends* `NonEmptyArray`\<keyof `R` & `string`\> \| `undefined`

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

## Functions

### partial()

> **partial**\<`R`, `KeysToBeOptional`, `ExcessValidation`\>(`recordType`, `options?`): [`PartialType`](#partialtype)\<`R`, `KeysToBeOptional`, `ExcessValidation`\>

Defined in: [src/record/partial.mts:15](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/partial.mts#L15)

Creates a Partial type. If keysToBeOptional is set, only those keys are
optional, otherwise, all properties are optional.

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToBeOptional

`KeysToBeOptional` *extends* readonly \[keyof `R` & `string`, keyof `R` & `string`\]

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`, `ExcessValidation`\>

##### options?

`Partial`\<`Readonly`\<\{ `excessPropertyFill`: `"allow"` \| `"strip"`; `excessPropertyValidation`: `ExcessValidation`; `keysToBeOptional`: `KeysToBeOptional`; `typeName`: `string`; \}\>\>

#### Returns

[`PartialType`](#partialtype)\<`R`, `KeysToBeOptional`, `ExcessValidation`\>
