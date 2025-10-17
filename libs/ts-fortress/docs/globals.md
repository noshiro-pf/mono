[**ts-fortress**](README.md)

***

[ts-fortress](README.md) / globals

# globals

## Type Aliases

### Email

> **Email** = `Brand`\<`string`, `"Email"`\>

Defined in: [src/globals.d.mts:7](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L7)

***

### Iso8601

> **Iso8601** = `Brand`\<`string`, `"Iso8601"`\>

Defined in: [src/globals.d.mts:5](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L5)

***

### JsonString

> **JsonString** = `Brand`\<`string`, `"JsonString"`\>

Defined in: [src/globals.d.mts:9](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L9)

***

### PartialReadonly

> **PartialReadonly**\<`T`\> = `Partial`\<`Readonly`\<`T`\>\>

Defined in: [src/globals.d.mts:3](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L3)

#### Type Parameters

##### T

`T`

***

### Uuid

> **Uuid** = `Brand`\<[`UuidBaseString`](#uuidbasestring), `"Uuid"`\>

Defined in: [src/globals.d.mts:18](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L18)

***

### Uuid4

> **Uuid4** = `Brand`\<[`UuidBaseString`](#uuidbasestring)\<`4`\>, `"Uuid"`\>

Defined in: [src/globals.d.mts:20](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L20)

***

### Uuid6

> **Uuid6** = `Brand`\<[`UuidBaseString`](#uuidbasestring)\<`6`\>, `"Uuid"`\>

Defined in: [src/globals.d.mts:22](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L22)

***

### Uuid7

> **Uuid7** = `Brand`\<[`UuidBaseString`](#uuidbasestring)\<`7`\>, `"Uuid"`\>

Defined in: [src/globals.d.mts:24](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L24)

***

### UuidBaseString

> **UuidBaseString**\<`V`\> = `` `${string}-${string}-${V}${string}-${string}-${string}` `` \| `"00000000-0000-0000-0000-000000000000"` \| `"ffffffff-ffff-ffff-ffff-ffffffffffff"`

Defined in: [src/globals.d.mts:13](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L13)

#### Type Parameters

##### V

`V` *extends* [`UuidVersion`](#uuidversion) = [`UuidVersion`](#uuidversion)

***

### UuidVersion

> **UuidVersion** = `UintRangeInclusive`\<`1`, `8`\>

Defined in: [src/globals.d.mts:11](https://github.com/noshiro-pf/ts-fortress/blob/main/src/globals.d.mts#L11)
