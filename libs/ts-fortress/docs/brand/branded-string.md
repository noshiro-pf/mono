[**ts-fortress**](../README.md)

---

[ts-fortress](../README.md) / brand/branded-string

# brand/branded-string

## Variables

### simpleBrandedString()

> `const` **simpleBrandedString**: \<`K`\>(`__namedParameters`) => [`Type`](../type/README.md#type)\<`Brand`\<`string`, `K`\>\> = `brandedString`

Defined in: [src/brand/branded-string.mts:26](https://github.com/noshiro-pf/ts-fortress/blob/main/src/brand/branded-string.mts#L26)

Same as brandedString

#### Type Parameters

##### K

`K` _extends_ `string`

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `defaultValue`: `string`; `is?`: (`u`) => `u is Brand<string, K>`; `typeName`: `K`; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`Brand`\<`string`, `K`\>\>

## Functions

### brandedString()

> **brandedString**\<`K`\>(`__namedParameters`): [`Type`](../type/README.md#type)\<`Brand`\<`string`, `K`\>\>

Defined in: [src/brand/branded-string.mts:5](https://github.com/noshiro-pf/ts-fortress/blob/main/src/brand/branded-string.mts#L5)

#### Type Parameters

##### K

`K` _extends_ `string`

#### Parameters

##### \_\_namedParameters

`Readonly`\<\{ `defaultValue`: `string`; `is?`: (`u`) => `u is Brand<string, K>`; `typeName`: `K`; \}\>

#### Returns

[`Type`](../type/README.md#type)\<`Brand`\<`string`, `K`\>\>
