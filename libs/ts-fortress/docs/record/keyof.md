[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / record/keyof

# record/keyof

## Functions

### keyof()

> **keyof**\<`R`\>(`recordType`, `options?`): `KeyofType`\<`R`\>

Defined in: [record/keyof.mts:6](https://github.com/noshiro-pf/ts-fortress/blob/main/src/record/keyof.mts#L6)

#### Type Parameters

##### R

`R` _extends_ `Readonly`\<\{ `assertIs`: (`a`) => `asserts a is UnknownRecord`; `cast`: (`a`) => `A`; `defaultValue`: `A`; `fill`: (`a`) => `A`; `is`: (`a`) => `a is UnknownRecord`; `optional?`: `true`; `typeName`: `string`; `validate`: (`a`) => `Result`\<`UnknownRecord`, readonly `string`[]\>; \}\>

#### Parameters

##### recordType

`R`

##### options?

`Partial`\<`Readonly`\<\{ `typeName`: `string`; \}\>\>

#### Returns

`KeyofType`\<`R`\>
