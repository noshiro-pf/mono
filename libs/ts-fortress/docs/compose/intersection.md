[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / compose/intersection

# compose/intersection

## Functions

### intersection()

> **intersection**\<`Types`\>(`types`, `defaultType`, `options?`): `IntersectionType`\<`Types`\>

Defined in: [src/compose/intersection.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/compose/intersection.mts#L11)

#### Type Parameters

##### Types

`Types` *extends* readonly \[`Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\]

#### Parameters

##### types

`Types`

##### defaultType

`IntersectionType`\<`Types`\>

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

`IntersectionType`\<`Types`\>
