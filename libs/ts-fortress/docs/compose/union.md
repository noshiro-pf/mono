[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / compose/union

# compose/union

## Functions

### union()

> **union**\<`Types`\>(`types`, `options?`): `UnionType`\<`Types`\>

Defined in: [src/compose/union.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/compose/union.mts#L11)

#### Type Parameters

##### Types

`Types` *extends* readonly \[`Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>, `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](../utils/validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>\]

#### Parameters

##### types

`Types`

##### options?

`Partial`\<`Readonly`\<\{ `defaultType`: `UnionType`\<`Types`\>; `typeName`: `string`; \}\>\>

#### Returns

`UnionType`\<`Types`\>
