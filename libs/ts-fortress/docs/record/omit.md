[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/omit

# record/omit

## Functions

### omit()

> **omit**\<`R`, `KeysToOmit`\>(`recordType`, `keysToOmit`, `options?`): `OmittedType`\<`R`, `KeysToOmit`\>

Defined in: [record/omit.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/omit.mts#L11)

Creates a record type with keys omitted.

#### Type Parameters

##### R

`R` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`UnknownRecord`, readonly `Readonly`\<\{ `actualValue`: `unknown`; `expectedType`: `string`; `message`: `undefined` \| `string`; `path`: readonly `string`[]; `typeName`: `string`; \}\>[]\>; \}\>

##### KeysToOmit

`KeysToOmit` _extends_ readonly keyof [`TypeOf`](../type.md#typeof)\<`R`\> & `string`[]

#### Parameters

##### recordType

`R`

##### keysToOmit

`KeysToOmit`

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

`OmittedType`\<`R`, `KeysToOmit`\>
