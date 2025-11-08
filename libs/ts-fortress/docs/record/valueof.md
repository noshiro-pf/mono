[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/valueof

# record/valueof

## Functions

### valueof()

> **valueof**\<`R`\>(`recordType`, `options?`): `ValueOfType`\<`R`\>

Defined in: [src/record/valueof.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/valueof.mts#L6)

#### Type Parameters

##### R

`R` *extends* `ReadonlyRecord`\<`string`, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\>

#### Parameters

##### recordType

[`RecordType`](../type/README.md#recordtype)\<`R`\>

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

`ValueOfType`\<`R`\>
