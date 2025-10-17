[**ts-fortress**](../../../README.md)

***

[ts-fortress](../../../README.md) / predefined/brand/string/uuid

# predefined/brand/string/uuid

## Functions

### uuid()

> **uuid**\<`V`\>(`options?`): [`Type`](../../../type/README.md#type)\<`UuidOf`\<`V`\>\>

Defined in: [src/predefined/brand/string/uuid.mts:8](https://github.com/noshiro-pf/ts-fortress/blob/main/src/predefined/brand/string/uuid.mts#L8)

#### Type Parameters

##### V

`V` *extends* [`UuidVersion`](../../../globals.md#uuidversion) \| `UuidVersionAdditionalOption`

#### Parameters

##### options?

`Partial`\<`Readonly`\<\{ `defaultValue`: `string`; `typeName`: `string`; `version`: `V`; \}\>\>

#### Returns

[`Type`](../../../type/README.md#type)\<`UuidOf`\<`V`\>\>

#### Link

https://github.com/validatorjs/validator.js/tree/v13.1.17?tab=readme-ov-file#validators

***

### uuidV4()

> **uuidV4**(`defaultValue?`): [`Type`](../../../type/README.md#type)\<[`Uuid4`](../../../globals.md#uuid4)\>

Defined in: [src/predefined/brand/string/uuid.mts:47](https://github.com/noshiro-pf/ts-fortress/blob/main/src/predefined/brand/string/uuid.mts#L47)

#### Parameters

##### defaultValue?

`string`

#### Returns

[`Type`](../../../type/README.md#type)\<[`Uuid4`](../../../globals.md#uuid4)\>

***

### uuidV6()

> **uuidV6**(`defaultValue?`): [`Type`](../../../type/README.md#type)\<[`Uuid6`](../../../globals.md#uuid6)\>

Defined in: [src/predefined/brand/string/uuid.mts:53](https://github.com/noshiro-pf/ts-fortress/blob/main/src/predefined/brand/string/uuid.mts#L53)

#### Parameters

##### defaultValue?

`string`

#### Returns

[`Type`](../../../type/README.md#type)\<[`Uuid6`](../../../globals.md#uuid6)\>

***

### uuidV7()

> **uuidV7**(`defaultValue?`): [`Type`](../../../type/README.md#type)\<[`Uuid7`](../../../globals.md#uuid7)\>

Defined in: [src/predefined/brand/string/uuid.mts:59](https://github.com/noshiro-pf/ts-fortress/blob/main/src/predefined/brand/string/uuid.mts#L59)

#### Parameters

##### defaultValue?

`string`

#### Returns

[`Type`](../../../type/README.md#type)\<[`Uuid7`](../../../globals.md#uuid7)\>
