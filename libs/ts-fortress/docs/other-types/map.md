[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / other-types/map

# other-types/map

## Functions

### MapType()

> **MapType**\<`K`, `V`\>(`keyType`, `valueType`, `options?`): [`Type`](../type/README.md#type)\<`MapResultType`\<`K`, `V`\>\>

Defined in: [src/other-types/map.mts:20](https://github.com/noshiro-pf/ts-fortress/blob/main/src/other-types/map.mts#L20)

#### Type Parameters

##### K

`K` *extends* `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

##### V

`V` *extends* `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### keyType

`K`

##### valueType

`V`

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

[`Type`](../type/README.md#type)\<`MapResultType`\<`K`, `V`\>\>
