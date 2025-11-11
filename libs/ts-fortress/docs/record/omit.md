[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/omit

# record/omit

## Type Aliases

### OmittedType

> **OmittedType**\<`R`, `KeysToOmit`, `ExcessValidation`\> = [`RecordType`](../type/README.md#recordtype)\<`Omit`\<`R`, `ArrayElement`\<`KeysToOmit`\>\>, `ExcessValidation`\>

Defined in: [src/record/omit.mts:34](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/omit.mts#L34)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, [`Type`](../type/README.md#type)\<`unknown`\>\>

##### KeysToOmit

`KeysToOmit` *extends* readonly keyof `R`[]

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

## Functions

### omit()

> **omit**\<`R`, `KeysToOmit`, `ExcessValidation`\>(`recordType`, `keysToOmit`, `options?`): [`OmittedType`](#omittedtype)\<`R`, `KeysToOmit`, `ExcessValidation`\>

Defined in: [src/record/omit.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/omit.mts#L11)

Creates a record type with keys omitted.

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

##### KeysToOmit

`KeysToOmit` *extends* readonly keyof `R` & `string`[]

##### ExcessValidation

`ExcessValidation` *extends* [`ExcessPropertyBehavior`](../type/README.md#excesspropertybehavior) = `"strip"`

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`, `ExcessValidation`\>

##### keysToOmit

`KeysToOmit`

##### options?

`Partial`\<`Readonly`\<\{ `excessPropertyFill`: `"allow"` \| `"strip"`; `excessPropertyValidation`: `ExcessValidation`; `typeName`: `string`; \}\>\>

#### Returns

[`OmittedType`](#omittedtype)\<`R`, `KeysToOmit`, `ExcessValidation`\>
