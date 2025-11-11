[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/required

# record/required

## Type Aliases

### RequiredType

> **RequiredType**\<`R`, `KeysToBeRequired`, `ExcessValidation`\> = [`RecordType`](../type/README.md#recordtype)\<`RequiredTypeShape`\<`R`, `KeysToBeRequired`\>, `ExcessValidation`\>

Defined in: [src/record/required.mts:92](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/required.mts#L92)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToBeRequired

`KeysToBeRequired` *extends* `NonEmptyArray`\<keyof `R` & `string`\> \| `undefined`

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

## Functions

### required()

> **required**\<`R`, `KeysToBeRequired`, `ExcessValidation`\>(`recordType`, `options?`): [`RequiredType`](#requiredtype)\<`R`, `KeysToBeRequired`, `ExcessValidation`\>

Defined in: [src/record/required.mts:19](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/required.mts#L19)

Creates a Required type. If keysToBeRequired is set, only those keys are
made required, otherwise, all properties are made required.

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToBeRequired

`KeysToBeRequired` *extends* readonly \[keyof `R` & `string`, keyof `R` & `string`\]

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`, `ExcessValidation`\>

##### options?

`Partial`\<`Readonly`\<\{ `excessPropertyFill`: `"allow"` \| `"strip"`; `excessPropertyValidation`: `ExcessValidation`; `keysToBeRequired`: `KeysToBeRequired`; `typeName`: `string`; \}\>\>

#### Returns

[`RequiredType`](#requiredtype)\<`R`, `KeysToBeRequired`, `ExcessValidation`\>
