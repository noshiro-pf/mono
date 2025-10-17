[**ts-fortress**](../README.md)

***

[ts-fortress](../README.md) / record/optional

# record/optional

## Type Aliases

### OptionalPropertyType

> **OptionalPropertyType**\<`T`\> = `T` & `PartiallyRequired`\<`T`, `"optional"`\>

Defined in: [src/record/optional.mts:3](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/optional.mts#L3)

#### Type Parameters

##### T

`T` *extends* [`Type`](../type/README.md#type)\<`unknown`\>

***

### RequiredPropertyType

> **RequiredPropertyType**\<`T`\> = `PartiallyOptional`\<`T`, `"optional"`\>

Defined in: [src/record/optional.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/optional.mts#L6)

#### Type Parameters

##### T

`T` *extends* [`Type`](../type/README.md#type)\<`unknown`\>

## Functions

### isOptionalProperty()

> **isOptionalProperty**\<`T`\>(`t`): `t is OptionalPropertyType<T>`

Defined in: [src/record/optional.mts:18](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/optional.mts#L18)

#### Type Parameters

##### T

`T` *extends* `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### t

`T`

#### Returns

`t is OptionalPropertyType<T>`

***

### optional()

> **optional**\<`T`\>(`t`): [`OptionalPropertyType`](#optionalpropertytype)\<`T`\>

Defined in: [src/record/optional.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/optional.mts#L11)

#### Type Parameters

##### T

`T` *extends* `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is unknown`; `cast`: (`a`) => `unknown`; `defaultValue`: `unknown`; `fill`: (`a`) => `unknown`; `is`: (`a`) => `a is unknown`; `typeName`: `string`; `validate`: (`a`) => [`Result`](../entry-point/README.md#result)\<`unknown`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

#### Parameters

##### t

`T`

#### Returns

[`OptionalPropertyType`](#optionalpropertytype)\<`T`\>
