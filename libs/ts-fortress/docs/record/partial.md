[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/partial

# record/partial

## Functions

### partial()

> **partial**\<`R`, `KeysToBeOptional`\>(`recordType`, `options?`): `PartialType`\<`R`, `KeysToBeOptional`\>

Defined in: [record/partial.mts:10](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/partial.mts#L10)

Creates a Partial type. If keysToBeOptional is set, only those keys are
optional, otherwise, all properties are optional.

#### Type Parameters

##### R

`R` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`UnknownRecord`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

##### KeysToBeOptional

`KeysToBeOptional` _extends_ readonly \[keyof [`TypeOf`](../type.md#typeof)\<`R`\> & `string`, keyof [`TypeOf`](../type.md#typeof)\<`R`\> & `string`\]

#### Parameters

##### recordType

`R`

##### options?

`Partial`\<`Readonly`\<\{ `keysToBeOptional`: `KeysToBeOptional`; `typeName`: `string`; \}\>\>

#### Returns

`PartialType`\<`R`, `KeysToBeOptional`\>
