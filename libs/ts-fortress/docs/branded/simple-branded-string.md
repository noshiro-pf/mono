[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / branded/simple-branded-string

# branded/simple-branded-string

## Functions

### simpleBrandedString()

> **simpleBrandedString**\<`K`\>(`__namedParameters`): [`Type`](../type/README.md#type)\<`Brand`\<`string`, `K`\>\>

Defined in: [src/branded/simple-branded-string.mts:5](https://github.com/noshiro-pf/ts-fortress/blob/main/src/branded/simple-branded-string.mts#L5)

#### Type Parameters

##### K

`K` _extends_ `string`

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `defaultValue`: `string`; `is?`: (`u`) => `u is Brand<string, K>`; `typeName`: `K`; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`Brand`\<`string`, `K`\>\>
