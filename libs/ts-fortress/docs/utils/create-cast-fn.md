[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / utils/create-cast-fn

# utils/create-cast-fn

## Functions

### createCastFn()

> **createCastFn**\<`T`\>(`validate`): (`a`) => `T`

Defined in: [src/utils/create-cast-fn.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/utils/create-cast-fn.mts#L6)

#### Type Parameters

##### T

`T`

#### Parameters

##### validate

(`a`) => `Result`\<`T`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `details?`: [`ValidationErrorDetails`](validation-error.md#validationerrordetails); `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>

#### Returns

> (`a`): `T`

##### Parameters

###### a

`unknown`

##### Returns

`T`
